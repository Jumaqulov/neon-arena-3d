import type { Metadata } from "next";
import { GAMES } from "@/lib/data";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import LibraryHero from "@/components/games/LibraryHero";
import LibraryCta from "@/components/games/LibraryCta";
import GameSectionHeading from "@/components/games/GameSectionHeading";
import GameFilterGrid from "@/components/games/GameFilterGrid";

const DESCRIPTION =
  "NEON ARENA klub kompyuterlari va konsollarida o‘rnatilgan o‘yinlar: Counter-Strike 2, Dota 2, Valorant va boshqalar. Janr bo‘yicha saralang va o‘yin sahifasini oching.";

export const metadata: Metadata = {
  title: "O‘yinlar",
  description: DESCRIPTION,
  // openGraph is replaced (not merged) per route: repeat locale/type from the root layout
  openGraph: { title: "O‘yinlar — NEON ARENA", description: DESCRIPTION, locale: "uz_UZ", type: "website" },
};

export default function GamesPage() {
  const slugs = GAMES.map((g) => g.slug);
  return (
    <>
      <LibraryHero />

      <section id="katalog" aria-labelledby="catalog-title" className="section-y relative isolate overflow-hidden border-t border-line">
        <BigOutlineWord word="O‘YIN" className="top-8 -left-6" speed={0.35} />
        <div className="container-page relative z-10 flex flex-col gap-10 md:gap-12">
          <GameSectionHeading
            num="01"
            label="Katalog"
            id="catalog-title"
            title="Barcha o‘yinlar"
            lead="Klubda o‘rnatilgan o‘yinlar. Janrni tanlang — ro‘yxat shu zahoti saralanadi."
          />
          <GameFilterGrid slugs={slugs} listen />
        </div>
      </section>

      <LibraryCta />
    </>
  );
}
