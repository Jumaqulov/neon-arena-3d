import type { Game, GameSlug } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";
import { GameArtImage } from "@/components/ui/GameArtImage";

/**
 * Rendered tile width in FavoriteGames (1 col → sm 2 → lg 3, gap 24px, page gutter
 * 16/24/40/80px, container max 1440px). The portrait cover is always width-bound in the
 * landscape art window, so this is also the rendered image width.
 */
const COVER_SIZES =
  "(min-width: 1440px) 411px, (min-width: 1280px) calc(33.33vw - 69px), (min-width: 1024px) calc(33.33vw - 43px), (min-width: 768px) calc(50vw - 52px), (min-width: 640px) calc(50vw - 36px), calc(100vw - 32px)";

/**
 * Crop of each 600x900 cover inside the art window. The covers carry the game logo, and the
 * tile already names the game in text, so the crop keeps the characters and leaves the logo
 * out. cqw is % of the tile width (the root is a size container): skipping the top N source px
 * at any tile size is `N / 600 * 100cqw`. Default: top (Dota 2 / PUBG / MK1 logos sit lower).
 * CSS object-position values for GameArtImage `position` (so the blur preview uses the same crop).
 */
const COVER_FOCUS: Partial<Record<GameSlug, string>> = {
  // logo band ends at ~151px, the operator's head starts at ~187px: cut at 156px (26cqw)
  "counter-strike-2": "50% -26cqw",
  // logo sits mid-cover: frame the two legends below it
  "apex-legends": "50% 100%",
};

/**
 * Cover for a favourite-game tile. Games with official artwork show their real cover in an
 * art window above the tile's 114px info strip, so the title / meta text stays on the solid
 * surface. The rest keep our typographic / geometric cover. Server-safe and decorative: the
 * caller wraps it in aria-hidden and renders the title as text (hence alt="").
 */
export default function GameCoverArt({ game }: { game: Game }) {
  return (
    <span className="absolute inset-0 @container">
      {getGameArt(game.slug) ? (
        <span className="absolute inset-x-0 bottom-[114px] top-0 overflow-hidden border-b border-line transition-colors duration-300 group-hover/game:border-lime/40">
          <GameArtImage
            slug={game.slug}
            kind="cover"
            alt=""
            sizes={COVER_SIZES}
            position={COVER_FOCUS[game.slug] ?? "50% 0%"}
          />
        </span>
      ) : (
        <>
          {art(game)}
          <span className="absolute inset-x-6 bottom-[114px] h-px bg-line" />
        </>
      )}
    </span>
  );
}

const OUTLINE = "text-transparent [-webkit-text-stroke:1.5px_rgba(238,240,246,.22)]";
const LIME_PART = "text-lime [-webkit-text-stroke:0]";
const BIG = "absolute whitespace-nowrap font-display font-extrabold leading-[0.9] tracking-[-0.05em]";

function art(game: Game) {
  switch (game.motif) {
    case "crosshair":
      return (
        <>
          <span className={`${BIG} ${OUTLINE} -left-[2.4cqw] top-[58px] text-[length:42cqw]`}>
            CS<span className={LIME_PART}>2</span>
          </span>
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            stroke="#C4F82A"
            strokeWidth="1.5"
            className="absolute right-6 top-6 opacity-80"
          >
            <circle cx="60" cy="60" r="44" />
            <circle cx="60" cy="60" r="22" strokeDasharray="3 5" />
            <path d="M60 4V36M60 84V116M4 60H36M84 60H116" />
          </svg>
        </>
      );
    case "lanes":
      return (
        <>
          <svg
            viewBox="0 0 420 290"
            fill="none"
            preserveAspectRatio="xMinYMin slice"
            className="absolute left-0 top-0 h-[290px] w-full"
          >
            <path d="M-10 300L430 -20" stroke="#C4F82A" strokeOpacity=".7" strokeWidth="1.5" strokeDasharray="6 8" />
            <path d="M-10 250L380 -20" stroke="#EEF0F6" strokeOpacity=".1" />
            <path d="M30 310L430 30" stroke="#EEF0F6" strokeOpacity=".1" />
            <circle cx="100" cy="220" r="9" stroke="#C4F82A" strokeWidth="1.5" />
            <circle cx="210" cy="140" r="9" stroke="#C4F82A" strokeWidth="1.5" />
            <circle cx="320" cy="60" r="9" fill="#C4F82A" stroke="#C4F82A" strokeWidth="1.5" />
          </svg>
          <span className={`${BIG} ${OUTLINE} left-[5.2cqw] top-[118px] text-[length:23.8cqw]`}>
            DOTA<span className={LIME_PART}>2</span>
          </span>
        </>
      );
    case "reticle":
      return (
        <>
          <svg width="220" height="220" viewBox="0 0 220 220" fill="none" className="absolute -right-[30px] top-[30px]">
            <path d="M110 6L214 110L110 214L6 110Z" stroke="#C4F82A" strokeOpacity=".2" strokeWidth="1.5" />
            <path d="M110 36L184 110L110 184L36 110Z" stroke="#C4F82A" strokeOpacity=".45" strokeWidth="1.5" />
            <path d="M110 66L154 110L110 154L66 110Z" stroke="#C4F82A" strokeOpacity=".8" strokeWidth="1.5" />
            <path d="M110 94L126 110L110 126L94 110Z" fill="#C4F82A" />
          </svg>
          <span className={`${BIG} ${OUTLINE} left-[5.2cqw] top-[76px] flex flex-col text-[length:21cqw]`}>
            <span>VALO</span>
            <span>
              RANT<span className={LIME_PART}>.</span>
            </span>
          </span>
        </>
      );
    default: {
      // any other favourite: outlined monogram + concentric rings
      const head = game.abbr.slice(0, -1);
      const tail = game.abbr.slice(-1);
      return (
        <>
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" stroke="#C4F82A" className="absolute -right-10 top-8">
            <circle cx="100" cy="100" r="96" strokeOpacity=".18" />
            <circle cx="100" cy="100" r="66" strokeOpacity=".4" strokeDasharray="4 6" />
            <circle cx="100" cy="100" r="34" strokeOpacity=".8" />
          </svg>
          <span className={`${BIG} ${OUTLINE} left-[5.2cqw] top-[96px] text-[length:30cqw]`}>
            {head}
            <span className={LIME_PART}>{tail}</span>
          </span>
        </>
      );
    }
  }
}
