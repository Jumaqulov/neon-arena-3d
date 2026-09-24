import Link from "next/link";
import type { Game, GameSlug } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";
import { cn } from "@/lib/cn";
import Tilt from "@/components/motion/Tilt";
import { GameArtImage } from "@/components/ui/GameArtImage";
import { IconArrowRight } from "@/components/ui/Icon";
import MotifArt from "./MotifArt";
import { gameIndex } from "./gameArt";

/**
 * Rendered card width in GameFilterGrid (1 col → sm 2 → lg 3 → xl 4, gap 24px, page gutter
 * 16 / 24 / 40 / 80px, container max 1440px). The portrait cover is always width-bound in the
 * art window (top 71% of the card), so this is also the rendered image width.
 */
const COVER_SIZES =
  "(min-width: 1440px) 302px, (min-width: 1280px) calc(25vw - 58px), (min-width: 1024px) calc(33.33vw - 43px), (min-width: 768px) calc(50vw - 52px), (min-width: 640px) calc(50vw - 36px), calc(100vw - 32px)";

/** Same, for a cover zoomed to 108% of the card width from xl up (`zoomXl`). */
const COVER_SIZES_ZOOM_XL =
  "(min-width: 1440px) 327px, (min-width: 1280px) calc(27vw - 63px), (min-width: 1024px) calc(33.33vw - 43px), (min-width: 768px) calc(50vw - 52px), (min-width: 640px) calc(50vw - 36px), calc(100vw - 32px)";

interface CoverFrame {
  /** CSS object-position (see GameArtImage `position`) */
  position: string;
  /** extra classes on the image, e.g. per-breakpoint `--art-pos` values */
  className?: string;
  /** from xl up, widen the image box to 108% of the card (sides cropped 4%) */
  zoomXl?: boolean;
}

/**
 * Crop of each 600×900 cover in the art window (71% of the card height). The cover is
 * width-bound, so the window shows 600 × windowH / cardW source rows: from ~267 (single column
 * at 639px) to ~683 (xl at 1280px). Each crop keeps the faces and either the whole logo or none
 * of it over that whole range (source rows in the comments). Default: centred (Apex's logo sits
 * mid-cover at 330–530 and stays whole at every size).
 */
const COVER_FRAME: Partial<Record<GameSlug, CoverFrame>> = {
  // These covers carry their wordmark at the top; keep it inside the art window.
  valorant: { position: "50% 0%" },
  fortnite: { position: "50% 0%" },
  "ea-sports-fc": { position: "50% 0%" },
  // logo 55–150 + the operator below it
  "counter-strike-2": { position: "50% 0%" },
  // Legion Commander; the logo starts at 690 and the window never reaches past 683
  "dota-2": { position: "50% 0%" },
  // helmet + rifle; the badge starts at 645. At xl (1280–1345px) an unzoomed window would show
  // up to 683 rows, so the image is zoomed 1.08× there: ≤ 632 rows, the logo stays out.
  pubg: { position: "50% 0%", zoomXl: true },
  // Liu Kang (headband 240) + wordmark 485–535 ("1" 440–590). At 42% the wordmark is whole
  // whenever the window is ≥ ~340 rows tall; the short, wide single-column windows
  // (488–639px viewports) can't hold face + logo, so there the crop stops above the logo.
  "mortal-kombat-1": {
    position: "var(--art-pos)",
    className: "[--art-pos:50%_42%] min-[488px]:max-sm:[--art-pos:50%_14%]",
  },
};

/** monogram size, relative to the card width (the parent <li> is an @container) */
function monoClass(abbr: string): string {
  if (abbr.length <= 2) return "text-[length:min(120px,38cqw)]";
  if (abbr.length === 3) return "text-[length:min(86px,28cqw)]";
  return "text-[length:min(64px,21cqw)]";
}

const MONO_LAYER =
  "absolute inset-x-[22px] top-[29%] flex h-[41%] items-end whitespace-nowrap font-display font-extrabold leading-[.8] tracking-[-0.04em]";

/**
 * Game cover card. Games with official artwork show their real cover in the art window; the
 * rest keep our typographic cover (motif + monogram). Pointer tilt with layered depth:
 * outlined monogram at 14px, solid monogram at 56px, labels at 30px.
 * Put it inside an element with `@container` (the grid <li>).
 */
export default function GameCard({ game }: { game: Game }) {
  const mono = monoClass(game.abbr);
  const hasArt = !!getGameArt(game.slug);
  const frame = COVER_FRAME[game.slug];
  return (
    <Tilt
      max={9}
      scale={1.02}
      glare
      className="group/card h-[380px] rounded-card shadow-[0_24px_40px_-28px_rgba(0,0,0,.9)] transition-shadow duration-300 hover:shadow-[0_44px_70px_-30px_rgba(0,0,0,.95),0_0_36px_rgba(196,248,42,.16)] sm:h-[400px] xl:h-[420px]"
    >
      <Link
        href={`/oyinlar/${game.slug}`}
        aria-label={`${game.title}, ${game.genre} — o‘yin sahifasi`}
        className="absolute inset-0 block rounded-card text-ink no-underline [transform-style:preserve-3d]"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 overflow-hidden rounded-card border border-line bg-surface transition-colors duration-300 group-hover/card:border-lime/75 group-focus-within/card:border-lime/75"
        >
          {hasArt ? (
            // the title is rendered as text below → decorative image (alt="")
            <span className="absolute inset-x-0 top-0 h-[71%] overflow-hidden">
              <span className={cn("absolute inset-0", frame?.zoomXl && "xl:inset-x-[-4%]")}>
                <GameArtImage
                  slug={game.slug}
                  kind="cover"
                  alt=""
                  sizes={frame?.zoomXl ? COVER_SIZES_ZOOM_XL : COVER_SIZES}
                  position={frame?.position}
                  className={cn(
                    frame?.className,
                    "transition-transform duration-500 ease-out motion-safe:group-hover/card:scale-[1.03]",
                  )}
                />
              </span>
            </span>
          ) : (
            <MotifArt motif={game.motif} className="absolute inset-x-0 top-0 h-[71%] w-full text-lime" />
          )}
          <span className="absolute inset-x-0 top-[71%] h-px bg-line" />
        </span>

        {/* over official artwork the chips would sit on the game's logo, so there the genre
            moves into the caption row below and the index is dropped */}
        {hasArt ? null : (
          <>
            <span className="absolute left-5 top-5 inline-flex h-7 items-center rounded-chip border border-line bg-ground/85 px-2.5 font-mono text-[12px] font-bold uppercase leading-none tracking-[0.08em] text-ink [transform:translateZ(30px)]">
              {game.genre}
            </span>
            <span
              aria-hidden="true"
              className="absolute right-5 top-6 font-mono text-[12px] font-medium leading-[1.4] tracking-[0.08em] text-muted [transform:translateZ(30px)]"
            >
              {gameIndex(game.slug)}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                MONO_LAYER,
                mono,
                "text-transparent [-webkit-text-stroke:1px_#C4F82A] [transform:translateZ(14px)_translate(6px,6px)]",
              )}
            >
              {game.abbr}
            </span>
            <span aria-hidden="true" className={cn(MONO_LAYER, mono, "text-ink [transform:translateZ(56px)]")}>
              {game.abbr}
            </span>
          </>
        )}

        <span className="absolute inset-x-6 top-[76%] flex flex-col gap-3 [transform:translateZ(30px)]">
          <span className="font-display text-[20px] font-bold leading-[1.2] tracking-[-0.01em] text-ink">{game.title}</span>
          <span className="flex items-center justify-between gap-3 font-mono text-[12px] font-medium leading-[1.4] tracking-[0.08em] text-muted transition-colors duration-300 group-hover/card:text-lime">
            {hasArt ? (
              <>
                <span className="inline-flex h-7 shrink-0 items-center rounded-chip border border-line px-2.5 font-bold uppercase leading-none text-ink">
                  {game.genre}
                </span>
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  O‘YIN SAHIFASI
                  <IconArrowRight className="transition-transform duration-300 group-hover/card:translate-x-1" />
                </span>
              </>
            ) : (
              <>
                O‘YIN SAHIFASI
                <IconArrowRight className="transition-transform duration-300 group-hover/card:translate-x-1" />
              </>
            )}
          </span>
        </span>
      </Link>
    </Tilt>
  );
}
