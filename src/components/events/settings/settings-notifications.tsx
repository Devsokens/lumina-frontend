"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, Volume2 } from "lucide-react";
import { EvButton } from "@/components/events/ev-ui";
import { InfoNote, MiniSwitch, SettingsCard, SettingsHeading, SettingsRow, StatePill } from "@/components/events/settings/settings-ui";
import { disablePush, enablePush, fetchPushStatus, pushState, testPush, type PushState } from "@/lib/push";
import { playNotifySound, setSoundMuted, soundMuted } from "@/lib/notify-sound";

// Paramètres · Notifications : chaque membre de l'équipe active les
// notifications sur ses propres appareils (téléphone, ordinateur).

const STATE_TEXT: Record<PushState, string> = {
  on: "Activées sur cet appareil",
  off: "Désactivées sur cet appareil",
  blocked: "Bloquées par le navigateur",
  "needs-install": "Installation requise",
  unsupported: "Non disponibles sur ce navigateur",
};

export function SettingsNotifications() {
  const [state, setState] = useState<PushState | null>(null);
  const [server, setServer] = useState<{ enabled: boolean; devices: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);

  async function refresh() {
    const [local, remote] = await Promise.all([pushState(), fetchPushStatus().catch(() => null)]);
    setState(local);
    setServer(remote ? { enabled: remote.enabled, devices: remote.devices } : { enabled: false, devices: 0 });
  }

  useEffect(() => {
    let cancelled = false;
    void Promise.all([pushState(), fetchPushStatus().catch(() => null)]).then(([local, remote]) => {
      if (cancelled) return;
      setState(local);
      setServer(remote ? { enabled: remote.enabled, devices: remote.devices } : { enabled: false, devices: 0 });
      setMuted(soundMuted());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function run(action: () => Promise<void>, done: string) {
    setBusy(true);
    try {
      await action();
      toast.success(done);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action impossible.");
    } finally {
      await refresh();
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true);
    try {
      const result = await testPush();
      if (result.sent === 0) toast.error("Aucun appareil n'a reçu l'essai. Désactivez puis réactivez les notifications.");
      else toast.success("Notification d'essai envoyée : elle arrive dans quelques secondes.");
    } catch {
      toast.error("Envoi de l'essai impossible pour le moment.");
    } finally {
      setBusy(false);
    }
  }

  const loading = state === null || server === null;
  const available = !!server?.enabled;

  return (
    <>
      <SettingsHeading title="Notifications" sub="Soyez prévenu à chaque vente, même quand GiyaX est fermé." />
      <SettingsCard>
        <SettingsRow title="Sur cet appareil" desc="Une notification à chaque billet vendu, inscription ou cotisation. Chaque membre de l'équipe l'active sur ses propres appareils.">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatePill tone={state === "on" ? "ok" : state === "blocked" ? "warn" : "neutral"} dot>
                {loading ? "Vérification…" : !available ? "Bientôt disponible" : STATE_TEXT[state]}
              </StatePill>
              {!loading && available && state === "off" && (
                <EvButton variant="primary" disabled={busy} onClick={() => void run(enablePush, "Notifications activées sur cet appareil.")}>
                  <BellRing className="size-4" />
                  Activer les notifications
                </EvButton>
              )}
              {!loading && available && state === "on" && (
                <>
                  <EvButton disabled={busy} onClick={() => void test()}>
                    Envoyer un essai
                  </EvButton>
                  <EvButton variant="ghost" disabled={busy} onClick={() => void run(disablePush, "Notifications désactivées sur cet appareil.")}>
                    Désactiver
                  </EvButton>
                </>
              )}
            </div>
            {!loading && available && state === "blocked" && (
              <InfoNote>Votre navigateur bloque les notifications de GiyaX. Ouvrez les réglages du site (icône à gauche de l&apos;adresse), autorisez les notifications, puis rechargez la page.</InfoNote>
            )}
            {!loading && available && state === "needs-install" && (
              <InfoNote>Sur iPhone et iPad : ouvrez GiyaX dans Safari, touchez « Partager » puis « Sur l&apos;écran d&apos;accueil ». Lancez ensuite GiyaX depuis l&apos;icône et revenez ici.</InfoNote>
            )}
            {!loading && available && state === "unsupported" && <InfoNote>Ce navigateur ne propose pas les notifications. Essayez Chrome, Edge, Firefox ou Safari récent.</InfoNote>}
            {!loading && !available && <InfoNote>Les notifications sont en cours d&apos;activation sur GiyaX. Revenez dans quelques jours.</InfoNote>}
            {!loading && available && server.devices > 0 && (
              <span className="text-xs text-ev-muted">
                {server.devices} appareil{server.devices > 1 ? "s" : ""} relié{server.devices > 1 ? "s" : ""} à votre compte.
              </span>
            )}
          </div>
        </SettingsRow>
        <SettingsRow last title="Son" desc="Un carillon discret quand une vente arrive pendant que le tableau de bord est ouvert. GiyaX fermé, c'est la sonnerie de notification de votre appareil qui joue.">
          <div className="flex flex-wrap items-center gap-3">
            <MiniSwitch
              checked={!muted}
              ariaLabel="Son des notifications"
              onChange={(on) => {
                setSoundMuted(!on);
                setMuted(!on);
                if (on) playNotifySound("test", true);
              }}
            />
            <span className="text-[13px]">{muted ? "Son coupé" : "Son activé"}</span>
            <EvButton size="sm" onClick={() => playNotifySound("test", true)}>
              <Volume2 className="size-4" />
              Écouter
            </EvButton>
          </div>
        </SettingsRow>
      </SettingsCard>
    </>
  );
}
