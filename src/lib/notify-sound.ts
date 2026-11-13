// Son des notifications dans l'application : quelques notes brèves,
// synthétisées par le navigateur (aucun fichier audio à charger). Quand GiyaX
// est fermé, c'est le son de notification du téléphone ou de l'ordinateur
// qui joue.

const MUTE_KEY = "giyax-notify-muted";
let context: AudioContext | null = null;

export function soundMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted: boolean) {
  try {
    if (muted) localStorage.setItem(MUTE_KEY, "1");
    else localStorage.removeItem(MUTE_KEY);
  } catch {
    // Stockage indisponible (navigation privée) : réglage non mémorisé.
  }
}

// Vente, cotisation, essai : carillon de trois notes ; autre : deux notes.
export function playNotifySound(kind?: string, force = false) {
  if (!force && soundMuted()) return;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    context ??= new Ctor();
    const ctx = context;
    // Un navigateur garde le son suspendu tant que la page n'a reçu aucun clic.
    if (ctx.state === "suspended") void ctx.resume();
    const notes = kind === "sale" || kind === "contribution" || kind === "test" ? [880, 1174.66, 1567.98] : [880, 1174.66];
    const start = ctx.currentTime + 0.02;
    notes.forEach((frequency, i) => {
      const at = start + i * 0.13;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.22, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.45);
    });
  } catch {
    // Son indisponible : la notification visuelle suffit.
  }
}
