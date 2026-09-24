/**
 * Games area — pure helpers + typographic cover-art data (server-safe, no three.js, no DOM).
 * The same motif primitives feed the SVG covers (MotifArt), the CSS 3D box and the
 * canvas textures of the WebGL box, so every surface shows identical art.
 */
import { GAMES, getZone, type Game, type GameGenre, type GameMotif, type GameSlug } from "@/lib/data";

/* ------------------------------------------------------------------ */
/* Motif primitives (viewBox 0 0 302 300, stroke = currentColor)       */
/* ------------------------------------------------------------------ */

export interface MotifShape {
  /** SVG path data (also fed to canvas Path2D) */
  d: string;
  opacity?: number;
  /** stroke dash pattern */
  dash?: readonly [number, number];
  /** stroke width in viewBox units. Default 1.25 */
  width?: number;
  /** fill with currentColor */
  fill?: boolean;
  /** draw the outline too (default true) */
  stroke?: boolean;
}

export interface Motif {
  shapes: readonly MotifShape[];
  /** focal point in viewBox units — the hologram reticle floats over it on the box cover */
  focus: readonly [number, number];
}

export const MOTIF_VIEWBOX = { w: 302, h: 300 } as const;

const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0z`;
const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;

export const MOTIFS: Record<GameMotif, Motif> = {
  // Counter-Strike 2 — the crosshair from the hero cover
  crosshair: {
    focus: [190, 124],
    shapes: [
      { d: circ(190, 124, 96), opacity: 0.25 },
      { d: circ(190, 124, 68), opacity: 0.55, dash: [3, 7] },
      { d: circ(190, 124, 32), opacity: 0.8 },
      { d: "M190 16v68M190 164v68M82 124h68M230 124h68", opacity: 0.9 },
      { d: "M122 56l11 11M258 56l-11 11M122 192l11-11M258 192l-11-11", opacity: 0.5 },
      { d: "M190 26v7M190 215v7M92 124h7M281 124h7", opacity: 0.9, width: 3 },
    ],
  },
  // Dota 2 — three lanes across a square map
  lanes: {
    focus: [184, 128],
    shapes: [
      { d: rect(96, 40, 176, 176), opacity: 0.35 },
      { d: "M104 208 264 48", opacity: 0.9 },
      { d: "M112 56c38 54 98 94 144 144", opacity: 0.6, dash: [2, 6] },
      { d: rect(84, 204, 24, 24), opacity: 0.9, fill: true },
      { d: rect(260, 28, 24, 24), opacity: 0.9 },
      {
        d: [circ(96, 128, 4), circ(184, 216, 4), circ(148, 164, 4), circ(272, 128, 4), circ(184, 40, 4), circ(220, 92, 4)].join(""),
      },
    ],
  },
  // Valorant — reticle
  reticle: {
    focus: [204, 118],
    shapes: [
      { d: circ(204, 118, 92), opacity: 0.3 },
      { d: circ(204, 118, 56), opacity: 0.7, dash: [3, 6] },
      { d: circ(204, 118, 22), opacity: 0.9 },
      { d: circ(204, 118, 3), fill: true },
      { d: "M204 10v76M204 150v76M96 118h76M236 118h66", opacity: 0.85 },
      { d: "M150 64l10 10M258 64l-10 10M150 172l10-10M258 172l-10-10", opacity: 0.5 },
    ],
  },
  // PUBG — shrinking play zones
  rings: {
    focus: [196, 112],
    shapes: [
      { d: circ(176, 130, 112), opacity: 0.45, dash: [4, 7] },
      { d: circ(196, 112, 66), opacity: 0.75 },
      { d: circ(210, 100, 26) },
      { d: "M12 262 292 20", opacity: 0.55, dash: [2, 9] },
      { d: "M204 94l12 12M216 94l-12 12", width: 1.75 },
    ],
  },
  // EA Sports FC — pitch in perspective
  pitch: {
    focus: [151, 158],
    shapes: [
      { d: "M34 280h234l-42-244H76z", opacity: 0.75 },
      { d: "M55 158h192", opacity: 0.6 },
      { d: ell(151, 158, 42, 20), opacity: 0.6 },
      { d: circ(151, 158, 2.5), fill: true },
      { d: "M104 280l6-36h82l6 36", opacity: 0.6 },
      { d: "M118 36l2 16h62l2-16", opacity: 0.6 },
    ],
  },
  // Fortnite — build ramps
  build: {
    focus: [170, 150],
    shapes: [
      { d: "M40 250h52v-52h52v-52h52v-52h52v-52", opacity: 0.9, width: 1.5 },
      { d: "M92 250v-52M144 250v-104M196 250v-156M248 250v-208", opacity: 0.3 },
      { d: "M40 250h256", opacity: 0.45 },
      { d: "M40 250 248 42", opacity: 0.55, dash: [2, 8] },
      { d: rect(144, 146, 52, 52), opacity: 0.35 },
      { d: rect(242, 30, 14, 14), opacity: 0.9, fill: true },
    ],
  },
  // Apex Legends — rising chevrons
  chevrons: {
    focus: [190, 140],
    shapes: [
      { d: circ(190, 140, 118), opacity: 0.3, dash: [4, 7] },
      { d: "M110 170l80-80 80 80", opacity: 0.9, width: 1.5 },
      { d: "M110 210l80-80 80 80", opacity: 0.55 },
      { d: "M110 250l80-80 80 80", opacity: 0.3 },
      { d: "M190 56l9 9-9 9-9-9z", opacity: 0.9, fill: true },
    ],
  },
  // Mortal Kombat 1 — crossed slashes + health bars
  slash: {
    focus: [158, 170],
    shapes: [
      { d: "M22 280 206 44", opacity: 0.9, width: 2 },
      { d: "M280 270 110 62", opacity: 0.7, width: 2 },
      { d: "M64 290 236 70", opacity: 0.35 },
      { d: rect(20, 64, 116, 8), opacity: 0.8 },
      { d: rect(20, 64, 80, 8), opacity: 0.8, fill: true, stroke: false },
      { d: rect(166, 64, 116, 8), opacity: 0.8 },
      { d: rect(208, 64, 74, 8), opacity: 0.8, fill: true, stroke: false },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Copy helpers                                                        */
/* ------------------------------------------------------------------ */

export type GenreFilter = "all" | GameGenre;

export const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

/** "01".."08" — position in the full library */
export function gameIndex(slug: GameSlug): string {
  return pad2(GAMES.findIndex((g) => g.slug === slug) + 1);
}

/** cover monogram size (px on the 360×480 cover) — shared by the CSS box and the canvas texture */
export function coverMonoSize(abbr: string): number {
  if (abbr.length <= 2) return 150;
  if (abbr.length === 3) return 120;
  return 92;
}

/** Monogram split: everything but the last glyph in ink, the last glyph in lime ("CS" + "2"). */
export function monogramParts(abbr: string): { head: string; tail: string } {
  return { head: abbr.slice(0, -1), tail: abbr.slice(-1) };
}

/** Title split for the h1: last word lime when the title has several words. */
export function titleParts(title: string): { head: string; tail: string } {
  const i = title.lastIndexOf(" ");
  if (i === -1) return { head: title, tail: "" };
  return { head: title.slice(0, i + 1), tail: title.slice(i + 1) };
}

/** Hero eyebrow / cover chips, e.g. ["Shuter", "5v5", "Raqobatli"] */
export function gameEyebrow(game: Game): string {
  return [game.genre, game.format, "Raqobatli"].join(" · ");
}

/** Cover subtitle, e.g. "COUNTER-STRIKE 2 · RAQOBATLI" */
export function coverSubtitle(game: Game): string {
  return `${game.title} · Raqobatli`.toUpperCase();
}

/** Cover lime band, e.g. "SHUTER · 5V5" */
export function coverBand(game: Game): string {
  return `${game.genre} · ${game.format}`.toUpperCase();
}

/** the band also fits the "NEON ARENA" wordmark only when the genre/format line is short */
export function bandFitsWordmark(game: Game): boolean {
  return coverBand(game).length <= 20;
}

export function zoneNames(game: Game): string[] {
  return game.zones.map((z) => getZone(z).name);
}

/** Tournament series rows for the "Turnirlar" tab (formats follow the game's format). */
export function cupRows(game: Game): ReadonlyArray<{ idx: string; format: string; first: boolean }> {
  const f = game.format.toLowerCase();
  let formats: string[];
  if (f.includes("5v5")) formats = ["5V5 · Jamoaviy", "2V2 · Juftliklar", "5V5 · Aralash jamoalar"];
  else if (f.includes("1v1")) formats = ["1V1 · Yakkama-yakka", "1V1 · Olimpiya tizimi", "1V1 · Guruh bosqichi"];
  else if (f.includes("to‘rtlik")) formats = ["TO‘RTLIK · Jamoaviy", "JUFTLIK · Juftliklar", "YAKKA · Yakkama-yakka"];
  else if (f.includes("uchlik")) formats = ["UCHLIK · Jamoaviy", "UCHLIK · Aralash jamoalar", "JUFTLIK · Juftliklar"];
  else formats = [`${game.format.toUpperCase()} · Klub kubogi`];
  return formats.map((format, i) => ({ idx: pad2(i + 1), format, first: i === 0 }));
}

/** Counts per genre inside a list of games (for filter pills). */
export function genreCounts(games: readonly Game[]): Record<GenreFilter, number> {
  const out: Record<GenreFilter, number> = { all: games.length, Shuter: 0, MOBA: 0, Sport: 0, "Batl royal": 0, Fayting: 0 };
  for (const g of games) out[g.genre] += 1;
  return out;
}

/* ------------------------------------------------------------------ */
/* Box geometry / scroll mapping (shared by the DOM HUD and the scene) */
/* ------------------------------------------------------------------ */

/** cover size in px (the CSS box) — the WebGL box uses the same proportions */
export const BOX_PX = { w: 360, h: 480, d: 48 } as const;
/** start yaw (rad): the cover faces you, spine peeking on the left */
export const BOX_BASE_YAW = 0.45;
/** yaw added over the scroll range: front → spine → back */
export const BOX_YAW_RANGE = 2.94;

/** Human label of the face turned to the viewer for a given yaw (deg). */
export function faceLabel(deg: number): string {
  const d = ((deg % 360) + 360) % 360;
  if (d < 60 || d >= 300) return "Old muqova";
  if (d < 140) return "Qirra";
  if (d < 220) return "Orqa muqova";
  return "Yon tomon";
}
