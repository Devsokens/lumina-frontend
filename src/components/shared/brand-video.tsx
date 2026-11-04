"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Film produit GiyaX « Studio produit » (30 s, muet) : les écrans de l'app
// (reconstruits depuis les composants) dans un téléphone et un ordinateur.
// Source éditable : motion/giyax-studio (HyperFrames). Fichiers web générés
// dans public/videos (720p servi aux petits écrans).
const POSTER = "/videos/giyax-studio-poster.jpg";

interface BrandVideoProps {
  className?: string;
  /** cover : remplit un cadre de n'importe quelle proportion (page de connexion). */
  fit?: "cover" | "contain";
  /** Position du bouton lecture/pause. */
  controlPosition?: "bottom-right" | "bottom-left";
}

export function BrandVideo({ className, fit = "cover", controlPosition = "bottom-right" }: BrandVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Pause choisie par la personne : on ne relance plus automatiquement.
  const userPaused = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    // Mouvement réduit ou économie de données : image fixe, lecture à la demande.
    if (reduceMotion || saveData) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) {
          video.play().catch(() => setPlaying(false));
        } else if (!entry.isIntersecting) {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => setPlaying(false));
    } else {
      userPaused.current = true;
      video.pause();
    }
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <video
        ref={ref}
        className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain")}
        poster={POSTER}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Film de présentation GiyaX : billets vendus en ligne et contrôlés à l'entrée, commandes envoyées directement en cuisine, logements réservés et payés d'avance, ventes suivies en direct. Digitaliser son activité n'a jamais été aussi simple."
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src="/videos/giyax-studio-720.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/videos/giyax-studio-1080.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Mettre la vidéo en pause" : "Lire la vidéo"}
        className={cn(
          "absolute bottom-3 flex size-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80",
          controlPosition === "bottom-right" ? "right-3" : "left-3",
        )}
      >
        {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
      </button>
    </div>
  );
}
