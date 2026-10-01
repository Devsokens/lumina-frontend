import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import {
  addConflict,
  clearConflicts,
  clearOfflineData,
  enqueueScan,
  getManifest,
  isScannedLocally,
  listConflicts,
  listQueue,
  markScannedLocally,
  removeFromQueue,
  saveManifest,
  type ScanConflict,
  type ScanManifest,
} from "@/lib/scan/offline-db";
import { parseTicketCode, verifySignedText, verifyTicketSignature } from "@/lib/scan/ticket-crypto";

export type VerdictKind = "valid" | "used" | "invalid";

// Seuls les verdicts explicites (backend, ou manifeste signé hors ligne)
// colorent vert/orange/rouge. Une panne réseau n'est JAMAIS un "invalid".
export type ScanOutcome =
  | { type: "verdict"; kind: VerdictKind; detail?: string; offline: boolean }
  | { type: "network"; detail?: string }
  | { type: "error"; detail: string };

export type ManifestInfo = { generatedAt: string; downloadedAt: string; count: number };

type ServerVerdict = { status: VerdictKind; detail?: string };

type ScanState = {
  eventId: string | null;
  manifest: ManifestInfo | null;
  pendingCount: number;
  conflicts: ScanConflict[];
  syncing: boolean;
  preparing: boolean;
  setEventId: (eventId: string | null) => Promise<void>;
  refresh: () => Promise<void>;
  prepareOffline: () => Promise<void>;
  clearOffline: () => Promise<void>;
  dismissConflicts: () => Promise<void>;
  submit: (code: string) => Promise<ScanOutcome>;
  sync: () => Promise<void>;
};

const NETWORK_MESSAGE = "RÉSEAU — vérification impossible, réessayez";

function isOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

// Pas de réponse (réseau coupé, timeout, CORS) ou erreur serveur 5xx : le
// verdict est inconnu, ce n'est pas un refus du billet.
function isNetworkFailure(err: unknown) {
  return isAxiosError(err) && (!err.response || err.response.status >= 500);
}

function errorMessage(err: unknown) {
  if (isAxiosError(err)) {
    const body = err.response?.data as { error?: unknown } | undefined;
    if (typeof body?.error === "string") return body.error;
    if (err.response?.status === 403) return "Accès refusé pour ce compte.";
  }
  return "Erreur inattendue, réessayez.";
}

async function postValidate(code: string, eventId: string | null) {
  const { data } = await api.post<{ data: ServerVerdict }>("/admin/scan/validate", {
    code,
    ...(eventId ? { eventId } : {}),
  });
  return data.data;
}

function manifestInfo(m: { generatedAt: string; downloadedAt: string; tickets: unknown[] }) {
  return { generatedAt: m.generatedAt, downloadedAt: m.downloadedAt, count: m.tickets.length };
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

// Vérification hors ligne : 1) signature Ed25519 du QR, 2) présence + statut
// dans le manifeste, 3) anti-double local, puis mise en file de synchro.
async function verifyOffline(eventId: string, code: string): Promise<ScanOutcome> {
  const manifest = await getManifest(eventId);
  if (!manifest) {
    return { type: "network", detail: "Mode hors ligne non préparé pour cet événement." };
  }

  const parsed = parseTicketCode(code);
  if (parsed.kind === "unknown") {
    return { type: "verdict", kind: "invalid", offline: true, detail: "Format de QR inconnu." };
  }
  if (
    parsed.kind === "signed" &&
    !(await verifyTicketSignature(parsed.ticketId, eventId, parsed.signature, manifest.publicKey))
  ) {
    return {
      type: "verdict",
      kind: "invalid",
      offline: true,
      detail: "Signature invalide ou billet d'un autre événement.",
    };
  }

  const ticket = manifest.tickets.find((t) => t.code === code);
  if (!ticket || ticket.status !== "VALID") {
    return {
      type: "verdict",
      kind: "invalid",
      offline: true,
      detail: `Absent du manifeste du ${formatTime(manifest.generatedAt)}.`,
    };
  }
  if (await isScannedLocally(eventId, code)) {
    return { type: "verdict", kind: "used", offline: true, detail: "Déjà scanné sur cet appareil." };
  }

  await markScannedLocally(eventId, code);
  await enqueueScan({ eventId, code, scannedAt: new Date().toISOString() });
  return {
    type: "verdict",
    kind: "valid",
    offline: true,
    detail: [ticket.attendee, ticket.ticketType].filter(Boolean).join(" · "),
  };
}

export const useScanStore = create<ScanState>()(
  persist(
    (set, get) => ({
      eventId: null,
      manifest: null,
      pendingCount: 0,
      conflicts: [],
      syncing: false,
      preparing: false,

      setEventId: async (eventId) => {
        set({ eventId, manifest: null });
        await get().refresh();
      },

      refresh: async () => {
        const { eventId } = get();
        const [manifest, queue, conflicts] = await Promise.all([
          eventId ? getManifest(eventId) : Promise.resolve(undefined),
          listQueue(),
          listConflicts(),
        ]);
        set({
          manifest: manifest ? manifestInfo(manifest) : null,
          pendingCount: queue.length,
          conflicts,
        });
      },

      prepareOffline: async () => {
        const { eventId } = get();
        if (!eventId) throw new Error("Choisissez d'abord un événement.");
        set({ preparing: true });
        try {
          const { data } = await api.get<{ data: ScanManifest }>(
            `/admin/events/${eventId}/scan-manifest`
          );
          const m = data.data;
          // Même sérialisation, même ordre de champs que le backend.
          const body = JSON.stringify({
            eventId: m.eventId,
            generatedAt: m.generatedAt,
            publicKey: m.publicKey,
            tickets: m.tickets.map((t) => ({
              code: t.code,
              attendee: t.attendee,
              ticketType: t.ticketType,
              status: t.status,
            })),
          });
          if (
            m.eventId !== eventId ||
            !(await verifySignedText(`manifest.${body}`, m.signature, m.publicKey))
          ) {
            throw new Error("Manifeste corrompu (signature invalide).");
          }
          set({ manifest: manifestInfo(await saveManifest(m)) });
        } finally {
          set({ preparing: false });
        }
      },

      clearOffline: async () => {
        const { eventId } = get();
        if (eventId) await clearOfflineData(eventId);
        await get().refresh();
      },

      dismissConflicts: async () => {
        await clearConflicts();
        set({ conflicts: [] });
      },

      submit: async (rawCode) => {
        const code = rawCode.trim();
        const { eventId } = get();
        let outcome: ScanOutcome;

        if (isOffline()) {
          outcome = eventId
            ? await verifyOffline(eventId, code)
            : { type: "network", detail: "Hors ligne et aucun événement choisi." };
        } else {
          try {
            const verdict = await postValidate(code, eventId);
            if (eventId && verdict.status !== "invalid") await markScannedLocally(eventId, code);
            outcome = { type: "verdict", kind: verdict.status, detail: verdict.detail, offline: false };
          } catch (err) {
            if (!isNetworkFailure(err)) {
              outcome = { type: "error", detail: errorMessage(err) };
            } else if (eventId && (await getManifest(eventId))) {
              // Réseau tombé sans que le navigateur le sache encore.
              outcome = await verifyOffline(eventId, code);
            } else {
              outcome = { type: "network" };
            }
          }
        }

        await get().refresh();
        return outcome;
      },

      // Renvoie la file au backend, dans l'ordre, un scan à la fois. Le
      // backend reste l'arbitre : un "used" ou "invalid" devient un conflit
      // (billet entré deux fois, ou annulé/remboursé après le manifeste).
      sync: async () => {
        if (get().syncing || isOffline()) return;
        set({ syncing: true });
        try {
          const queue = await listQueue();
          const manifests = new Map<string, Awaited<ReturnType<typeof getManifest>>>();
          for (const scan of queue) {
            let verdict: ServerVerdict;
            try {
              verdict = await postValidate(scan.code, scan.eventId);
            } catch {
              break; // réseau ou session : on réessaiera au prochain passage
            }
            if (verdict.status !== "valid") {
              if (!manifests.has(scan.eventId)) {
                manifests.set(scan.eventId, await getManifest(scan.eventId));
              }
              const attendee =
                manifests.get(scan.eventId)?.tickets.find((t) => t.code === scan.code)?.attendee ??
                null;
              await addConflict({
                eventId: scan.eventId,
                code: scan.code,
                attendee,
                scannedAt: scan.scannedAt,
                serverStatus: verdict.status,
                detail: verdict.detail,
              });
            }
            await removeFromQueue(scan.id!);
          }
        } finally {
          set({ syncing: false });
          await get().refresh();
        }
      },
    }),
    {
      name: "lumina-scan",
      // Seul l'événement choisi est mémorisé (pas de donnée sensible).
      partialize: (s) => ({ eventId: s.eventId }),
    }
  )
);

export { NETWORK_MESSAGE };
