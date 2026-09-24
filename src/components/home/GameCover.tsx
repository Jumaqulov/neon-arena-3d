import Link from "next/link";
import type { CSSProperties } from "react";
import type { Game, GameMotif } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";
import { GameArtImage } from "@/components/ui/GameArtImage";
import { GAME_COVER_FOCUS, GAME_COVER_SIZES, lime } from "./content";

/* Our own geometric cover motifs for games without official art — ported from Main.dc.html. */
const L: CSSProperties = { position: "absolute", boxSizing: "border-box", pointerEvents: "none" };

const ART: Record<GameMotif, readonly [CSSProperties, CSSProperties]> = {
  crosshair: [
    { ...L, right: -60, top: -40, width: 230, height: 230, borderRadius: "50%", border: `1px solid ${lime(0.45)}` },
    {
      ...L,
      right: -60,
      top: -40,
      width: 230,
      height: 230,
      background: `linear-gradient(${lime(0.35)},${lime(0.35)}) 50% 0 / 1px 100% no-repeat, linear-gradient(${lime(0.35)},${lime(0.35)}) 0 50% / 100% 1px no-repeat`,
    },
  ],
  lanes: [
    { ...L, right: -40, top: -10, width: 180, height: 180, border: `1px solid ${lime(0.45)}`, transform: "rotate(45deg)" },
    {
      ...L,
      right: 6,
      top: 36,
      width: 88,
      height: 88,
      background: `repeating-linear-gradient(45deg, ${lime(0.4)} 0 1px, transparent 1px 9px)`,
      transform: "rotate(45deg)",
    },
  ],
  reticle: [
    { ...L, right: 0, top: 0, width: 210, height: 190, background: lime(0.08), clipPath: "polygon(100% 0, 100% 100%, 0 0)" },
    {
      ...L,
      right: 28,
      top: 26,
      width: 110,
      height: 110,
      background: `repeating-linear-gradient(90deg, ${lime(0.4)} 0 1px, transparent 1px 11px)`,
      clipPath: "polygon(100% 0, 100% 100%, 0 0)",
    },
  ],
  rings: [
    {
      ...L,
      right: -80,
      top: -80,
      width: 280,
      height: 280,
      borderRadius: "50%",
      background: `repeating-radial-gradient(circle, transparent 0 21px, ${lime(0.3)} 21px 22px)`,
    },
    { ...L, right: 54, top: 54, width: 12, height: 12, borderRadius: "50%", background: "#C4F82A", boxShadow: `0 0 18px ${lime(0.6)}` },
  ],
  pitch: [
    {
      ...L,
      right: 22,
      top: 22,
      width: 160,
      height: 110,
      border: `1px solid ${lime(0.45)}`,
      background: `linear-gradient(${lime(0.45)},${lime(0.45)}) 50% 0 / 1px 100% no-repeat`,
    },
    { ...L, right: 77, top: 52, width: 50, height: 50, borderRadius: "50%", border: `1px solid ${lime(0.45)}` },
  ],
  build: [
    {
      ...L,
      right: -30,
      top: -20,
      width: 220,
      height: 200,
      background: `repeating-linear-gradient(0deg, ${lime(0.28)} 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, ${lime(0.28)} 0 1px, transparent 1px 32px)`,
      transform: "skewY(-18deg)",
    },
    { ...L, right: 20, top: 70, width: 170, height: 1, background: lime(0.7), transform: "rotate(-32deg)", boxShadow: `0 0 12px ${lime(0.5)}` },
  ],
  chevrons: [
    {
      ...L,
      right: 44,
      top: 34,
      width: 90,
      height: 90,
      borderTop: `1px solid ${lime(0.6)}`,
      borderLeft: `1px solid ${lime(0.6)}`,
      transform: "rotate(45deg)",
    },
    {
      ...L,
      right: 44,
      top: 74,
      width: 90,
      height: 90,
      borderTop: `1px solid ${lime(0.35)}`,
      borderLeft: `1px solid ${lime(0.35)}`,
      transform: "rotate(45deg)",
    },
  ],
  slash: [
    { ...L, right: 30, top: 14, width: 150, height: 150, borderRadius: "50%", border: `1px solid ${lime(0.45)}` },
    { ...L, right: 100, top: -40, width: 1, height: 280, background: lime(0.6), transform: "rotate(28deg)", boxShadow: `0 0 12px ${lime(0.4)}` },
  ],
};

/** monogram size by length, capped by the cover width (container query units) */
function abbrSize(abbr: string): string {
  if (abbr.length <= 2) return "min(96px, 34cqw)";
  if (abbr.length === 3) return "min(78px, 27cqw)";
  return "min(62px, 21cqw)";
}

/** Tile frame shared by both cover kinds: size, hairline border, lift toward the viewer on hover / focus. */
const FRAME =
  "na-game-cover @container relative flex h-[300px] flex-col overflow-hidden rounded-card border border-line bg-surface shadow-[0_18px_40px_rgba(0,0,0,.35)] transition-[translate,border-color,box-shadow] duration-300 ease-spring group-hover/cover:border-lime/60 group-hover/cover:shadow-card-hover group-hover/cover:[translate:0_0_44px] group-focus-visible/cover:border-lime/60 md:h-[256px]";

/**
 * Game cover linking to the game page. `.game-3d` is the node GSAP turns in 3D while the
 * gallery scrolls; the inner card lifts toward the viewer on hover / focus.
 * Games with official artwork show the real cover; the others keep the typographic cover.
 */
export default function GameCover({ game, n }: { game: Game; n: number }) {
  const num = String(n).padStart(2, "0");
  return (
    <Link href={`/oyinlar/${game.slug}`} className="group/cover block rounded-card no-underline">
      <div className="game-3d">
        {getGameArt(game.slug) ? <ArtCover game={game} num={num} /> : <TypeCover game={game} num={num} />}
      </div>
    </Link>
  );
}

/**
 * Official portrait cover (object-cover, per-game focal point, never stretched) above an opaque
 * caption strip. The logo is in the art, so there is no monogram; the title stays real text in
 * the strip (so the image is decorative: alt=""). The caption sits below the art, not on it, so
 * it never hides part of a logo and the text keeps full contrast (ink / muted on surface).
 */
function ArtCover({ game, num }: { game: Game; num: string }) {
  return (
    <div className={FRAME}>
      <div className="relative min-h-0 flex-1 bg-ground">
        <GameArtImage slug={game.slug} kind="cover" alt="" sizes={GAME_COVER_SIZES} position={GAME_COVER_FOCUS[game.slug]} />
      </div>
      <div className="flex shrink-0 flex-col gap-1 border-t border-line px-[18px] pb-4 pt-3.5 transition-colors duration-300 group-hover/cover:border-lime/60 group-focus-visible/cover:border-lime/60">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="text-[17px] font-semibold leading-[1.3] text-ink">{game.title}</h3>
          <span aria-hidden="true" className="shrink-0 pt-[3px] font-mono text-[12px] font-medium leading-[1.4] tracking-[0.08em] text-muted">
            {num}
          </span>
        </div>
        <p className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">{game.genreLabel}</p>
      </div>
    </div>
  );
}

/** Our own typographic cover (geometric motif + monogram) for games without official art. */
function TypeCover({ game, num }: { game: Game; num: string }) {
  const [artA, artB] = ART[game.motif];
  return (
    <div className={`${FRAME} justify-between p-[22px]`}>
      <div aria-hidden="true" style={artA} />
      <div aria-hidden="true" style={artB} />
      <span aria-hidden="true" className="relative font-mono text-[12px] font-medium leading-[1.4] tracking-[0.08em] text-muted">
        {num}
      </span>
      <p
        aria-hidden="true"
        className="relative m-0 font-display font-extrabold leading-none tracking-[-0.04em]"
        style={
          game.outlined
            ? { fontSize: abbrSize(game.abbr), color: "transparent", WebkitTextStroke: "1.5px #C4F82A" }
            : { fontSize: abbrSize(game.abbr), color: "#EEF0F6" }
        }
      >
        {game.abbr}
      </p>
      <div className="relative flex flex-col gap-1">
        <h3 className="text-[17px] font-semibold leading-[1.3] text-ink">{game.title}</h3>
        <p className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">
          {game.genreLabel}
        </p>
      </div>
    </div>
  );
}
