import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/shared/providers";
import { PwaManager } from "@/components/pwa/pwa-manager";
import "./globals.css";

// Typographie — voir LUMINA_Document_Maitre_v2.md section 3.3.
// next/font self-héberge les polices (pas de CDN Google Fonts en prod).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GiyaX — La plateforme de commerce et gestion pour l'Afrique",
  description:
    "GiyaX digitalise vos activités en Afrique : Événementiel, Restauration, E-Commerce et Hébergement RBNB avec paiement Mobile Money et mode hors-ligne.",
  manifest: "/manifest.json",
  applicationName: "GiyaX",
  // iOS : écran d'accueil en plein écran, barre d'état fondue dans l'app.
  appleWebApp: {
    capable: true,
    title: "GiyaX",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0A4F3C" },
    { media: "(prefers-color-scheme: dark)", color: "#14201B" },
  ],
  width: "device-width",
  initialScale: 1,
  // Contenu sous l'encoche / la barre d'accueil iOS (safe-area gérées en CSS).
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body" suppressHydrationWarning>
        <Providers>
          {children}
          <PwaManager />
        </Providers>
      </body>
    </html>
  );
}
