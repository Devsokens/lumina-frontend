import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/shared/providers";
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
  title: "LUMINA — Digitalisez votre activité en 5 minutes",
  description:
    "SaaS multi-tenant pour PME africaines : restauration, événementiel, commerce.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0A4F3C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
