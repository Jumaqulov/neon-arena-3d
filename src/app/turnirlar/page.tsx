import type { Metadata } from "next";
import TournamentsHero from "@/components/tournaments/TournamentsHero";
import TournamentList from "@/components/tournaments/TournamentList";
import Leaderboard from "@/components/tournaments/Leaderboard";
import HowItWorks from "@/components/tournaments/HowItWorks";

const DESCRIPTION =
  "NEON ARENA klub turnirlari: jadval, jonli efir, mavsum reytingi va ishtirok qoidalari. O‘yinni tanlang va ro‘yxatdan o‘ting.";

export const metadata: Metadata = {
  title: "Turnirlar va reyting",
  description: DESCRIPTION,
  // openGraph is replaced (not merged) per route: repeat locale/type from the root layout
  openGraph: { title: "Turnirlar va reyting — NEON ARENA", description: DESCRIPTION, locale: "uz_UZ", type: "website" },
};

export default function TournamentsPage() {
  return (
    <>
      <TournamentsHero />
      <TournamentList />
      <Leaderboard />
      <HowItWorks />
    </>
  );
}
