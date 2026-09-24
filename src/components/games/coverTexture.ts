/**
 * Canvas-drawn typographic textures for the WebGL game box (client only — imported
 * exclusively by the lazily loaded R3F scene files, never by a route chunk).
 * Everything is drawn in "cover px" (360×480 like the CSS box) and scaled by `s`.
 * Games with official artwork swap the front face for the real cover (loadCoverPhoto).
 */
import { getImageProps, type StaticImageData } from "next/image";
import {
  CanvasTexture,
  ClampToEdgeWrapping,
  Color,
  MeshBasicMaterial,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from "three";
import type { Game } from "@/lib/data";
import { BLOOM_THRESHOLD_TEXT } from "@/components/three/colors";
import { BOX_PX, MOTIFS, bandFitsWordmark, coverBand, coverMonoSize, coverSubtitle, monogramParts } from "./gameArt";

/** world units per cover px */
export const UNIT = 0.0075;
export const BOX_W = BOX_PX.w * UNIT;
export const BOX_H = BOX_PX.h * UNIT;
export const BOX_D = BOX_PX.d * UNIT;

const INK = "#EEF0F6";
const MUTED = "#A3A9BC";
const LIME = "#C4F82A";
const GROUND = "#0A0B10";

interface Face {
  ctx: CanvasRenderingContext2D;
  tex: CanvasTexture;
  w: number;
  h: number;
  s: number;
}

export interface BoxTextureSet {
  faces: { side: Face; spine: Face; top: Face; bottom: Face; front: Face; back: Face };
  /** BoxGeometry material order: +x, −x, +y, −y, +z, −z */
  materials: MeshBasicMaterial[];
}

/* ---------------- fonts ---------------- */

function families() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  const display = v("--font-unbounded");
  const mono = v("--font-jetbrains");
  return {
    display: `${display ? `${display}, ` : ""}"Arial Black", sans-serif`,
    mono: `${mono ? `${mono}, ` : ""}Consolas, monospace`,
  };
}

/** Resolves once the display/mono weights used on the textures are loaded (never rejects). */
export async function ensureFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const f = families();
  try {
    await Promise.all([
      document.fonts.load(`800 100px ${f.display}`),
      document.fonts.load(`700 26px ${f.display}`),
      document.fonts.load(`700 12px ${f.mono}`),
      document.fonts.load(`500 12px ${f.mono}`),
    ]);
    await document.fonts.ready;
  } catch {
    /* fall back to whatever is available */
  }
}

/* ---------------- canvas helpers ---------------- */

function makeFace(w: number, h: number, s: number): Face {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(2, Math.round(w * s));
  canvas.height = Math.max(2, Math.round(h * s));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  return { ctx, tex, w, h, s };
}

function begin(f: Face, fill: string) {
  const { ctx, s } = f;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  ctx.setLineDash([]);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  spacing(ctx, 0);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, f.w, f.h);
}

function spacing(ctx: CanvasRenderingContext2D, px: number) {
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in c) c.letterSpacing = `${px}px`;
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawMotif(ctx: CanvasRenderingContext2D, game: Game, x: number, y: number, k: number) {
  const motif = MOTIFS[game.motif];
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.strokeStyle = LIME;
  ctx.fillStyle = LIME;
  ctx.lineJoin = "round";
  for (const s of motif.shapes) {
    const p = new Path2D(s.d);
    ctx.globalAlpha = s.opacity ?? 1;
    ctx.lineWidth = s.width ?? 1.25;
    ctx.setLineDash(s.dash ? [s.dash[0], s.dash[1]] : []);
    if (s.fill) ctx.fill(p);
    if (s.stroke !== false) ctx.stroke(p);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ---------------- faces ---------------- */

function paintFront(f: Face, game: Game, fam: ReturnType<typeof families>) {
  const { ctx } = f;
  begin(f, "#0D0F16");
  // hairline grid
  ctx.fillStyle = "rgba(238,240,246,0.03)";
  for (let x = 24; x < 360; x += 24) ctx.fillRect(x, 0, 1, 480);
  for (let y = 24; y < 480; y += 24) ctx.fillRect(0, y, 360, 1);
  // hatch band
  ctx.save();
  ctx.translate(290, 53);
  ctx.rotate((38 * Math.PI) / 180);
  ctx.beginPath();
  ctx.rect(-140, -13, 280, 26);
  ctx.clip();
  ctx.fillStyle = "rgba(196,248,42,0.385)";
  for (let x = -140; x < 140; x += 9) ctx.fillRect(x, -13, 2, 26);
  ctx.restore();
  // motif, focal point on the hologram
  const motif = MOTIFS[game.motif];
  const k = 0.97;
  drawMotif(ctx, game, 180 - motif.focus[0] * k, 196 - motif.focus[1] * k, k);
  // header row
  ctx.font = `700 12px ${fam.mono}`;
  spacing(ctx, 0.96);
  ctx.textBaseline = "top";
  ctx.fillStyle = INK;
  ctx.fillText("NEON ARENA", 20, 20);
  ctx.textAlign = "right";
  ctx.fillStyle = LIME;
  ctx.fillText("KLUB NASHRI", 340, 20);
  ctx.textAlign = "left";
  // monogram
  const { head, tail } = monogramParts(game.abbr);
  let size = coverMonoSize(game.abbr);
  const setMono = () => {
    ctx.font = `800 ${size}px ${fam.display}`;
    spacing(ctx, -0.05 * size);
  };
  setMono();
  const full = ctx.measureText(game.abbr).width;
  if (full > 318) {
    size = Math.floor((size * 318) / full);
    setMono();
  }
  ctx.textBaseline = "alphabetic";
  const baseY = 384;
  // outlined lime echo (layered depth, like the library cards)
  ctx.strokeStyle = "rgba(196,248,42,0.85)";
  ctx.lineWidth = 1.5;
  ctx.strokeText(game.abbr, 24, baseY + 6);
  ctx.fillStyle = INK;
  ctx.fillText(head, 18, baseY);
  const headW = head ? ctx.measureText(head).width : 0;
  ctx.shadowColor = "rgba(196,248,42,0.45)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = LIME;
  ctx.fillText(tail, 18 + headW, baseY);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  // subtitle
  ctx.font = `500 12px ${fam.mono}`;
  spacing(ctx, 0.96);
  ctx.textBaseline = "top";
  ctx.fillStyle = MUTED;
  ctx.fillText(coverSubtitle(game), 20, 402, 320);
  // lime band
  ctx.fillStyle = LIME;
  ctx.fillRect(0, 436, 360, 44);
  ctx.font = `700 12px ${fam.mono}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = GROUND;
  const roomy = bandFitsWordmark(game);
  ctx.fillText(coverBand(game), 20, 459, roomy ? 220 : 320);
  if (roomy) {
    ctx.textAlign = "right";
    ctx.fillText("NEON ARENA", 340, 459);
    ctx.textAlign = "left";
  }
  f.tex.needsUpdate = true;
}

function paintBack(f: Face, game: Game, fam: ReturnType<typeof families>) {
  const { ctx } = f;
  begin(f, "#0D0F16");
  ctx.font = `700 12px ${fam.mono}`;
  spacing(ctx, 0.96);
  ctx.textBaseline = "top";
  ctx.fillStyle = LIME;
  ctx.fillText("NEON ARENA · KLUB NASHRI", 28, 30);
  // tagline
  ctx.font = `700 26px ${fam.display}`;
  spacing(ctx, -0.52);
  const lines = wrapLines(ctx, game.tagline.toUpperCase(), 304);
  const lh = 30;
  const y0 = 232 - (lines.length * lh) / 2;
  ctx.fillStyle = INK;
  lines.forEach((ln, i) => ctx.fillText(ln, 28, y0 + i * lh, 304));
  // barcode (deterministic per game)
  const rand = rng(hash(game.slug));
  ctx.fillStyle = "rgba(238,240,246,0.75)";
  let x = 28;
  while (x < 330) {
    const bw = 1 + Math.floor(rand() * 3);
    ctx.fillRect(x, 396, Math.min(bw, 332 - x), 56);
    x += bw + 2 + Math.floor(rand() * 4);
  }
  f.tex.needsUpdate = true;
}

function paintSpine(f: Face, game: Game, fam: ReturnType<typeof families>) {
  const { ctx } = f;
  begin(f, "#0B0D13");
  ctx.fillStyle = LIME;
  ctx.fillRect(14, 14, 20, 20);
  ctx.save();
  ctx.translate(24, 240);
  ctx.rotate(Math.PI / 2);
  ctx.font = `700 15px ${fam.display}`;
  spacing(ctx, 0.9);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.fillText(game.title.toUpperCase(), 0, 0, 370);
  ctx.restore();
  ctx.save();
  ctx.translate(14, 446);
  ctx.scale(20 / 32, 20 / 32);
  ctx.strokeStyle = LIME;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D("M16 3 28 10v12L16 29 4 22V10z"));
  ctx.stroke(new Path2D("M4 10l12 7 12-7M16 17v12"));
  ctx.restore();
  f.tex.needsUpdate = true;
}

function paintSide(f: Face) {
  const { ctx } = f;
  begin(f, "#0B0D13");
  ctx.fillStyle = "rgba(238,240,246,0.07)";
  for (let y = 0; y < 480; y += 6) ctx.fillRect(0, y, 48, 1);
  f.tex.needsUpdate = true;
}

function paintTop(f: Face) {
  const { ctx } = f;
  begin(f, "#13161F");
  ctx.fillStyle = "rgba(196,248,42,0.4)";
  ctx.fillRect(16, 23.5, 328, 1);
  f.tex.needsUpdate = true;
}

function paintBottom(f: Face) {
  begin(f, "#07080C");
  f.tex.needsUpdate = true;
}

/* ---------------- public API ---------------- */

/** BoxGeometry material index of the +z (cover) face */
const FRONT = 4;
const FRONT_TINT = 0.93;
/**
 * Tint of the official cover. The front material is unlit and not tone mapped, so the
 * brightest photo pixel reaches linear luminance = tint: keeping it just under
 * BLOOM_THRESHOLD_TEXT means bloom never blows out the art (only the LIME_HDR lines glow).
 */
const PHOTO_TINT = Math.min(FRONT_TINT, BLOOM_THRESHOLD_TEXT - 0.02);

/**
 * Creates the six face canvases + materials. `s` = canvas px per cover px
 * (2 = crisp hero box, 1 = shelf). Paint with paintBoxTextures().
 */
export function createBoxTextures(s: number): BoxTextureSet {
  const { w, h, d } = BOX_PX;
  const edgeS = Math.max(1, s);
  const faces = {
    side: makeFace(d, h, Math.min(edgeS, 1.5)),
    spine: makeFace(d, h, edgeS),
    top: makeFace(w, d, Math.min(edgeS, 1.5)),
    bottom: makeFace(w, d, 0.5),
    front: makeFace(w, h, s),
    back: makeFace(w, h, s),
  };
  const mat = (tex: Texture, tint: number) =>
    new MeshBasicMaterial({ map: tex, color: new Color(tint, tint, tint), toneMapped: false });
  const materials = [
    mat(faces.side.tex, 0.78),
    mat(faces.spine.tex, 0.9),
    mat(faces.top.tex, 0.85),
    mat(faces.bottom.tex, 0.7),
    mat(faces.front.tex, FRONT_TINT),
    mat(faces.back.tex, 0.9),
  ];
  return { faces, materials };
}

/**
 * URL of the optimized (AVIF/WebP) cover at the smallest configured width ≥ `px`, through
 * the Next image optimizer. It is the same URL next/image lists in a srcset, so the texture
 * can reuse the <img> download of the CSS stand-in box. The optimizer never enlarges, so a
 * width above the source (600px) still returns the source size.
 */
export function coverPhotoUrl(img: StaticImageData, px: number): string {
  const { props } = getImageProps({
    src: img,
    alt: "",
    width: px,
    height: Math.round((px * img.height) / img.width),
  });
  // srcSet = "<url> 1x, <url> 2x" (URLs are encoded: no spaces or commas) → take the 1x candidate
  const first = props.srcSet?.split(", ")[0]?.split(" ")[0];
  return first || props.src || img.src;
}

/** Fit a portrait cover onto the 3:4 box face like `object-fit: cover` (centred, never stretched). */
function fitToFace(tex: Texture, anisotropy: number) {
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = anisotropy;
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  const img = tex.image as { width: number; height: number; naturalWidth?: number; naturalHeight?: number };
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const face = BOX_PX.w / BOX_PX.h;
  const ratio = iw && ih ? iw / ih : face;
  if (ratio < face) {
    // taller than the face (2:3 cover on a 3:4 face): crop top and bottom equally
    const k = ratio / face;
    tex.repeat.set(1, k);
    tex.offset.set(0, (1 - k) / 2);
  } else {
    const k = face / ratio;
    tex.repeat.set(k, 1);
    tex.offset.set((1 - k) / 2, 0);
  }
  tex.needsUpdate = true;
}

/**
 * Loads the official cover as a face-fitted sRGB texture. Returns a cancel function: after
 * cancel, a texture that arrives late is disposed and no callback runs. The caller owns
 * (and disposes) the texture passed to `onLoad`.
 */
export function loadCoverPhoto(
  url: string,
  anisotropy: number,
  onLoad: (tex: Texture) => void,
  onError: () => void,
): () => void {
  let alive = true;
  new TextureLoader().load(
    url,
    (tex) => {
      if (!alive) {
        tex.dispose();
        return;
      }
      fitToFace(tex, anisotropy);
      onLoad(tex);
    },
    undefined,
    () => {
      if (alive) onError();
    },
  );
  return () => {
    alive = false;
  };
}

/** Show the official cover on the front face (null = back to the canvas-drawn typographic cover). */
export function setFrontPhoto(set: BoxTextureSet, photo: Texture | null): void {
  const m = set.materials[FRONT];
  m.map = photo ?? set.faces.front.tex;
  m.color.setScalar(photo ? PHOTO_TINT : FRONT_TINT);
  m.needsUpdate = true;
}

export function paintBoxTextures(set: BoxTextureSet, game: Game): void {
  const fam = families();
  paintFront(set.faces.front, game, fam);
  paintBack(set.faces.back, game, fam);
  paintSpine(set.faces.spine, game, fam);
  paintSide(set.faces.side);
  paintTop(set.faces.top);
  paintBottom(set.faces.bottom);
}

export function disposeBoxTextures(set: BoxTextureSet): void {
  for (const f of Object.values(set.faces)) f.tex.dispose();
  for (const m of set.materials) m.dispose();
}

/** Diagonal light band (for the cover sheen sweep). Transparent edges → clamp outside. */
export function createSheenTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createLinearGradient(0, size, size, 0);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.42, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,0.9)");
    g.addColorStop(0.58, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new CanvasTexture(canvas);
  tex.wrapS = ClampToEdgeWrapping;
  tex.wrapT = ClampToEdgeWrapping;
  return tex;
}

/** Soft radial blob (floor glow / contact shadow). */
export function createRadialTexture(stops: ReadonlyArray<[number, string]>): CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    for (const [o, c] of stops) g.addColorStop(o, c);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
