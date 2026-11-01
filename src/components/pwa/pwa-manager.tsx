"use client";

import { useEffect, useState } from "react";
import { Download, Share, PlusSquare, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Événement non standard (Chrome, Edge, Samsung Internet, Opera) : invite
// d'installation sur Android, Windows, macOS, Linux, ChromeOS.
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "giya_pwa_install_dismissed";
const DISMISS_DAYS = 14;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos() {
  const ua = navigator.userAgent;
  // iPadOS se présente comme un Mac tactile.
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    return Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

// Installation (toutes plateformes), mise à jour et état réseau.
export function PwaManager() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS / iPadOS (Safari et autres navigateurs WebKit) : pas d'invite
    // automatique, on explique « Partager → Sur l'écran d'accueil ».
    const iosTimer = isIos()
      ? window.setTimeout(() => {
          setShowIosHelp(true);
          setVisible(true);
        }, 15_000)
      : undefined;

    const onInstalled = () => {
      setVisible(false);
      toast.success("GiyaX est installée sur cet appareil.");
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  // Nouvelle version du service worker active : proposer d'actualiser.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let hadController = !!navigator.serviceWorker.controller;
    const onChange = () => {
      if (!hadController) {
        hadController = true;
        return;
      }
      toast.info("Nouvelle version de GiyaX disponible.", {
        duration: Infinity,
        action: { label: "Actualiser", onClick: () => window.location.reload() },
      });
    };
    navigator.serviceWorker.addEventListener("controllerchange", onChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onChange);
  }, []);

  // État réseau.
  useEffect(() => {
    const offline = () =>
      toast.warning("Hors ligne : les données affichées peuvent ne pas être à jour.", { id: "net" });
    const online = () => toast.success("Connexion rétablie.", { id: "net" });
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // stockage indisponible : la bannière reviendra au prochain chargement
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    if (outcome === "accepted") setVisible(false);
    else dismiss();
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer l'application GiyaX"
      className="fixed inset-x-3 z-50 mx-auto max-w-md rounded-2xl border border-border bg-card/95 p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Fermer"
        className="absolute right-2 top-2 rounded-lg p-1 text-muted-foreground hover:bg-muted"
      >
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3 pr-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-bold">Installer GiyaX</p>
          {showIosHelp && !deferred ? (
            <p className="text-xs text-muted-foreground">
              Touchez <Share className="inline size-3.5 align-text-bottom" /> <strong>Partager</strong>, puis{" "}
              <PlusSquare className="inline size-3.5 align-text-bottom" /> <strong>Sur l&apos;écran d&apos;accueil</strong>.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Accès en un geste, plein écran, plus rapide et utilisable hors ligne.
            </p>
          )}
        </div>
      </div>
      {deferred && (
        <Button type="button" onClick={install} className="mt-3 w-full rounded-xl" size="sm">
          <Download className="size-4" /> Installer l&apos;application
        </Button>
      )}
    </div>
  );
}
