/**
 * Home-only copy and art data that is not (yet) part of src/lib/data.ts.
 * Ported 1:1 from REF/Main.dc.html. Facts stay [PLACEHOLDERS].
 */
import type { GameSlug, ZoneId } from "@/lib/data";

/** lime #C4F82A with alpha */
export const lime = (a: number): string => `rgba(196,248,42,${+a.toFixed(3)})`;

/* ------------------------------------------------------------------ */
/* Isometric zone art (zone cards)                                     */
/* ------------------------------------------------------------------ */

/** A box on the zone card's iso plane (px): x/y position, w×d footprint, h height, z lift, hi = lime highlight. */
export interface IsoBlockDef {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  z: number;
  hi?: boolean;
}

const bootcampBlocks: IsoBlockDef[] = [{ x: 0, y: 34, w: 150, d: 44, h: 10, z: 0 }];
for (let m = 0; m < 5; m++) bootcampBlocks.push({ x: 5 + m * 29, y: 40, w: 24, d: 5, h: 28, z: 10, hi: true });

export const ZONE_BLOCKS: Record<ZoneId, readonly IsoBlockDef[]> = {
  standart: [
    { x: 14, y: 24, w: 122, d: 62, h: 10, z: 0 },
    { x: 34, y: 30, w: 82, d: 6, h: 40, z: 10, hi: true },
    { x: 44, y: 56, w: 62, d: 12, h: 3, z: 10 },
  ],
  vip: [
    { x: 6, y: 20, w: 138, d: 70, h: 10, z: 0 },
    { x: 14, y: 26, w: 98, d: 6, h: 44, z: 10, hi: true },
    { x: 118, y: 30, w: 20, d: 34, h: 34, z: 10 },
    { x: 36, y: 58, w: 60, d: 12, h: 3, z: 10 },
  ],
  bootcamp: bootcampBlocks,
  konsol: [
    { x: 14, y: 18, w: 122, d: 26, h: 14, z: 0 },
    { x: 8, y: 22, w: 134, d: 5, h: 40, z: 14, hi: true },
    { x: 54, y: 66, w: 40, d: 26, h: 10, z: 0 },
  ],
};

/* ------------------------------------------------------------------ */
/* Games gallery depth layout (pinned horizontal scroll)               */
/* ------------------------------------------------------------------ */

/** per-cover depth (px, translateZ) and vertical offset — covers sit on different planes. */
export const GAME_DEPTH: readonly { z: number; y: number }[] = [
  { z: 40, y: 0 },
  { z: -140, y: 46 },
  { z: 90, y: -28 },
  { z: -60, y: 34 },
  { z: 20, y: -40 },
  { z: -170, y: 52 },
  { z: 70, y: -12 },
  { z: -90, y: 24 },
];

/* ------------------------------------------------------------------ */
/* Games gallery: official cover art (games with art in gameImages)    */
/* ------------------------------------------------------------------ */

/**
 * `sizes` for a cover tile — its real rendered width in every layout mode:
 *  - mobile swipe row: li `w-[74vw] max-w-[300px]`
 *  - reduced motion ≥768px: static shelf grid, 2 cols (gutter 40, gap 24), 4 cols from lg,
 *    gutter 80 from xl, inside the 1440px container
 *  - pinned 3D shelf: `clamp(220px, min(20vw, 34svh), 320px)` (HomeStyles); 34svh is the
 *    limit when the viewport is wider than 17:10.
 */
export const GAME_COVER_SIZES = [
  "(max-width: 405px) 74vw",
  "(max-width: 767.98px) 300px",
  "(prefers-reduced-motion: reduce) and (max-width: 1023.98px) calc(50vw - 52px)",
  "(prefers-reduced-motion: reduce) and (max-width: 1279.98px) calc(25vw - 38px)",
  "(prefers-reduced-motion: reduce) and (max-width: 1439.98px) calc(25vw - 58px)",
  "(prefers-reduced-motion: reduce) 302px",
  "(min-aspect-ratio: 17/10) and (max-height: 647px) 220px",
  "(min-aspect-ratio: 17/10) and (max-height: 941px) 34vh",
  "(min-aspect-ratio: 17/10) 320px",
  "(max-width: 1100px) 220px",
  "(max-width: 1600px) 20vw",
  "320px",
].join(", ");

/**
 * Focal point (object-position) of each 2:3 cover inside the tile's art window, which ranges
 * from ~1:1 (pinned shelf) to ~5:2 (reduced-motion 2-col grid). Chosen so the crop is always
 * clean: CS2 / Apex / MK1 keep their logo whole, Dota 2 / PUBG keep the characters and drop
 * the bottom logo entirely instead of cutting it (the title is in the caption strip anyway).
 * CSS object-position values, passed to GameArtImage `position` (so the blur preview matches).
 */
export const GAME_COVER_FOCUS: Partial<Record<GameSlug, string>> = {
  valorant: "50% 0%",
  fortnite: "50% 0%",
  "ea-sports-fc": "50% 0%",
  "counter-strike-2": "50% 0%",
  "dota-2": "50% 20%",
  pubg: "50% 10%",
  "apex-legends": "50% 47%",
  "mortal-kombat-1": "50% 55%",
};

/* ------------------------------------------------------------------ */
/* Tournament teaser: extruded "5V5" layers                            */
/* ------------------------------------------------------------------ */

export const EXTRUDE_LAYERS = 7;
