import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Headers de sécurité — voir LUMINA_Document_Maitre_v2.md section 25.3 et
// LUMINA_Audit_Menaces_Complet.md (clickjacking, MIME sniffing, etc.).
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const apiOrigin = (() => {
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:3001";
  }
})();

// 'unsafe-eval' est requis par le Fast Refresh de Next.js en dev — jamais en
// prod. 'unsafe-inline' reste nécessaire pour le script de bootstrap inline
// de Next.js (hydratation) tant qu'un CSP à base de nonce n'est pas mis en
// place. Voir LUMINA_Audit_Menaces_Complet.md action critique #5.
const isDev = process.env.NODE_ENV === "development";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' ${apiOrigin} data: blob:`,
  `connect-src 'self' ${apiOrigin} ws: wss:`,
  "font-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

// PWA via Serwist plutôt que next-pwa (successeur actif, compatible App
// Router Next 16) — déviation validée avec l'utilisateur pour lumina.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
