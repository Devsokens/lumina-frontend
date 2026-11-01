// Préparation d'une image importée, entièrement dans le navigateur :
// - formats PNG/JPEG/WebP uniquement (jamais SVG) ;
// - ré-encodage via canvas : supprime EXIF (GPS…) et tout contenu caché ;
// - dimensions plafonnées puis qualité réduite jusqu'à tenir sous la limite
//   acceptée par le serveur (data URL ≤ 450 000 caractères ≈ 330 ko).
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_DATA_URL = 440_000;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible."));
    };
    img.src = url;
  });
}

export async function prepareImage(file: File, maxSide = 1600): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format non pris en charge : PNG, JPG ou WEBP.");
  }
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Image trop lourde (15 Mo maximum).");

  const img = await loadImage(file);
  let side = maxSide;
  for (let attempt = 0; attempt < 6; attempt++) {
    const scale = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Traitement d'image indisponible sur ce navigateur.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.72, 0.6]) {
      let data = canvas.toDataURL("image/webp", quality);
      // Safari ancien : pas d'encodeur WebP → JPEG.
      if (!data.startsWith("data:image/webp")) data = canvas.toDataURL("image/jpeg", quality);
      if (data.length <= MAX_DATA_URL) return data;
    }
    side = Math.round(side * 0.75);
  }
  throw new Error("Image trop détaillée : essayez une image plus petite.");
}

// URL d'image saisie : https uniquement.
export function isHttpsImageUrl(value: string) {
  return /^https:\/\/\S+$/.test(value.trim());
}
