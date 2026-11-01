"use client";

import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api, apiError, type ApiResponse } from "@/lib/api";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

// Envoi d'une image (affiche, visuel) : POST /admin/uploads (multipart,
// champ `file`) → { url }. Voir docs/API_CONTRACT.md §16.
export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress?: (pct: number) => void }) => {
      const body = new FormData();
      body.append("file", file);
      const { data } = await api.post<ApiResponse<{ url: string }>>("/admin/uploads", body, {
        timeout: 60_000,
        // L'instance envoie du JSON par défaut : axios convertirait le
        // FormData en JSON. Le navigateur ajoute la boundary.
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
        },
      });
      return data.data?.url ?? "";
    },
  });
}

export function uploadError(err: unknown) {
  if (isAxiosError(err) && err.response?.status === 404) {
    return "L'import de fichier n'est pas encore disponible sur le serveur : collez l'URL de l'image.";
  }
  if (isAxiosError(err) && err.response?.status === 413) return "Image trop lourde (5 Mo maximum).";
  return apiError(err, "Échec de l'envoi de l'image.");
}
