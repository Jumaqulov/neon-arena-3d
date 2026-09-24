import type { Metadata } from "next";
import { HERO } from "@/lib/data";
import { BookingProvider } from "@/components/home/BookingContext";
import HomeStyles from "@/components/home/HomeStyles";
import HomeHero from "@/components/home/HomeHero";
import ZonesSection from "@/components/home/ZonesSection";
import GamesSection from "@/components/home/GamesSection";
import BookingSection from "@/components/home/BookingSection";
import TournamentTeaser from "@/components/home/TournamentTeaser";
import FinalCta from "@/components/home/FinalCta";

export const metadata: Metadata = {
  title: { absolute: "NEON ARENA — Kompyuter klub va kibersport arenasi" },
  description: HERO.lead,
};

/**
 * Bosh sahifa — scroll story:
 * hero (pinned WebGL dolly + cube explode) → zones (pinned 3D ring) → games (pinned horizontal
 * 3D shelf) → #booking (isometric seat map + form) → next tournament (layered parallax card)
 * → final CTA (grid rush). Zone cards pre-select the zone in the booking form (shared state).
 */
export default function HomePage() {
  return (
    <BookingProvider>
      <HomeStyles />
      <HomeHero />
      <ZonesSection />
      <GamesSection />
      <BookingSection />
      <TournamentTeaser />
      <FinalCta />
    </BookingProvider>
  );
}
