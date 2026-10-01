import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// Stockage local du mode scan hors ligne (EF-E09), dans IndexedDB :
// - manifests : billets VALID d'un événement, tels que signés par le backend ;
// - scanned   : billets déjà acceptés sur CET appareil (anti-double local) ;
// - queue     : scans hors ligne à renvoyer au backend au retour du réseau ;
// - conflicts : scans hors ligne que le backend a refusés à la synchro.
// Aucun token n'est stocké ici. Les codes de billets le sont : "Effacer les
// données hors ligne" les supprime (à faire en fin d'événement).

export type ManifestTicket = {
  code: string;
  attendee: string | null;
  ticketType: string;
  status: string;
};

export type ScanManifest = {
  eventId: string;
  generatedAt: string;
  publicKey: string;
  tickets: ManifestTicket[];
  signature: string;
};

export type StoredManifest = ScanManifest & { downloadedAt: string };

export type QueuedScan = {
  id?: number;
  eventId: string;
  code: string;
  scannedAt: string;
};

export type ScanConflict = {
  id?: number;
  eventId: string;
  code: string;
  attendee: string | null;
  scannedAt: string;
  serverStatus: "used" | "invalid";
  detail?: string;
};

interface ScanDb extends DBSchema {
  manifests: { key: string; value: StoredManifest };
  scanned: { key: string; value: { key: string; eventId: string; scannedAt: string } };
  queue: { key: number; value: QueuedScan };
  conflicts: { key: number; value: ScanConflict };
}

let dbPromise: Promise<IDBPDatabase<ScanDb>> | null = null;

function db() {
  dbPromise ??= openDB<ScanDb>("lumina-scan", 1, {
    upgrade(database) {
      database.createObjectStore("manifests", { keyPath: "eventId" });
      database.createObjectStore("scanned", { keyPath: "key" });
      database.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
      database.createObjectStore("conflicts", { keyPath: "id", autoIncrement: true });
    },
  });
  return dbPromise;
}

const scannedKey = (eventId: string, code: string) => `${eventId}|${code}`;

export async function saveManifest(manifest: ScanManifest): Promise<StoredManifest> {
  const stored = { ...manifest, downloadedAt: new Date().toISOString() };
  await (await db()).put("manifests", stored);
  return stored;
}

export async function getManifest(eventId: string) {
  return (await db()).get("manifests", eventId);
}

export async function isScannedLocally(eventId: string, code: string) {
  return (await (await db()).get("scanned", scannedKey(eventId, code))) !== undefined;
}

export async function markScannedLocally(eventId: string, code: string) {
  await (await db()).put("scanned", {
    key: scannedKey(eventId, code),
    eventId,
    scannedAt: new Date().toISOString(),
  });
}

export async function enqueueScan(scan: QueuedScan) {
  await (await db()).add("queue", scan);
}

export async function listQueue() {
  return (await db()).getAll("queue");
}

export async function removeFromQueue(id: number) {
  await (await db()).delete("queue", id);
}

export async function addConflict(conflict: ScanConflict) {
  await (await db()).add("conflicts", conflict);
}

export async function listConflicts() {
  return (await db()).getAll("conflicts");
}

export async function clearConflicts() {
  await (await db()).clear("conflicts");
}

// Efface manifeste + anti-double local d'un événement. La file d'attente
// n'est jamais effacée ici : ce serait perdre des entrées non synchronisées.
export async function clearOfflineData(eventId: string) {
  const database = await db();
  await database.delete("manifests", eventId);
  const tx = database.transaction("scanned", "readwrite");
  for await (const cursor of tx.store) {
    if (cursor.value.eventId === eventId) await cursor.delete();
  }
  await tx.done;
}
