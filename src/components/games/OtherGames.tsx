import { GAMES, type GameSlug } from "@/lib/data";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import GameSectionHeading from "./GameSectionHeading";
import GameFilterGrid from "./GameFilterGrid";

/** "Boshqa o‘yinlar" catalog on a game page (every game except the current one). */
export default function OtherGames({ currentSlug }: { currentSlug: GameSlug }) {
  const others = GAMES.filter((g) => g.slug !== currentSlug).map((g) => g.slug);
  return (
    <section id="boshqa" aria-labelledby="more-title" className="section-y relative isolate overflow-hidden border-t border-line">
      <BigOutlineWord word="O‘YIN" className="top-10 -right-6" speed={-0.3} />
      <div className="container-page relative z-10 flex flex-col gap-10 md:gap-12">
        <GameSectionHeading
          num="02"
          label="Katalog"
          id="more-title"
          title="Boshqa o‘yinlar"
          lead="Klubda o‘rnatilgan boshqa o‘yinlar. Janrni tanlang — ro‘yxat shu zahoti saralanadi."
        />
        <GameFilterGrid slugs={others} listen />
      </div>
    </section>
  );
}
