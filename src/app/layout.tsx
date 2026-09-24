import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Unbounded } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/motion/SmoothScroll";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { SITE } from "@/lib/data";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  weight: ["500", "700", "800"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  weight: ["400", "500", "600"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["500", "700"],
  subsets: ["latin", "latin-ext", "cyrillic"], // cyrillic: the "№" sign (U+2116)
  display: "swap",
});

// Absolute origin for share images (OG/Twitter use relative /_next/static paths).
// Set SITE_URL (e.g. https://neonarena.uz) in the deployment env; Vercel's production
// domain is used when present, localhost only for local builds.
const SITE_ORIGIN =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "NEON ARENA — Kompyuter klub va kibersport arenasi",
    template: "%s — NEON ARENA",
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    title: "NEON ARENA",
    description: SITE.description,
    locale: "uz_UZ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0B10",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${unbounded.variable} ${plex.variable} ${jetbrains.variable}`}>
      <body className="bg-ground font-sans text-ink antialiased">
        <a href="#main" className="skip-link">
          Asosiy kontentga o‘tish
        </a>
        <SmoothScroll>
          <ScrollProgress />
          <Header />
          <main id="main" tabIndex={-1} className="relative outline-none">
            {children}
          </main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
