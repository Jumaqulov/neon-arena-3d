import type { CSSProperties } from "react";
import type { Game } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";
import { cn } from "@/lib/cn";
import { GameArtImage } from "@/components/ui/GameArtImage";
import MotifArt from "./MotifArt";
import {
  BOX_PX,
  MOTIFS,
  MOTIF_VIEWBOX,
  bandFitsWordmark,
  coverBand,
  coverMonoSize,
  coverSubtitle,
  monogramParts,
} from "./gameArt";

/**
 * Rendered width of the 360px cover face: the stage scales the box by .56 / .68 / .78 / .88
 * (below), plus ~2% for the face's translateZ under the 1400px perspective. The 2:3 cover is
 * width-bound on the 3:4 face, so this is the image width too.
 */
const COVER_SIZES = "(min-width: 1280px) 320px, (min-width: 1024px) 284px, (min-width: 640px) 248px, 204px";

const MONO: CSSProperties = {
  fontFamily: "var(--font-jetbrains), Consolas, monospace",
  letterSpacing: ".08em",
  lineHeight: 1.4,
};
const EDGE = "rgba(196,248,42,.7)";
const EDGE_SOFT = "rgba(196,248,42,.4)";
const FACE: CSSProperties = { position: "absolute", boxSizing: "border-box", backfaceVisibility: "hidden" };

export interface CssGameBoxProps {
  game: Game;
  className?: string;
  /** gentle float (CSS). Default true. */
  animate?: boolean;
}

/** Our typographic cover (games without official artwork): hatch band, motif, monogram, lime band. */
function TypographicCover({ game }: { game: Game }) {
  const { head, tail } = monogramParts(game.abbr);
  const mono = coverMonoSize(game.abbr);
  const motif = MOTIFS[game.motif];
  const k = 0.97;
  const motifLeft = 180 - motif.focus[0] * k;
  const motifTop = 196 - motif.focus[1] * k;

  return (
    <>
      <div
        style={{
          position: "absolute",
          right: -70,
          top: 40,
          width: 280,
          height: 26,
          transform: "rotate(38deg)",
          background: "repeating-linear-gradient(90deg, rgba(196,248,42,.55) 0 2px, transparent 2px 9px)",
          opacity: 0.7,
        }}
      />
      <MotifArt
        motif={game.motif}
        className="absolute text-lime"
        style={{ left: motifLeft, top: motifTop, width: MOTIF_VIEWBOX.w * k, height: MOTIF_VIEWBOX.h * k }}
      />
      <div
        style={{
          ...MONO,
          position: "absolute",
          left: 20,
          right: 20,
          top: 18,
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 700,
          fontSize: 12,
          color: "#EEF0F6",
        }}
      >
        <span>NEON ARENA</span>
        <span style={{ color: "#C4F82A" }}>KLUB NASHRI</span>
      </div>
      <div
        className="font-display"
        style={{
          position: "absolute",
          left: 18,
          bottom: 96,
          fontWeight: 800,
          fontSize: mono,
          lineHeight: 0.8,
          letterSpacing: "-.05em",
          color: "#EEF0F6",
          whiteSpace: "nowrap",
        }}
      >
        {head}
        <span style={{ color: "#C4F82A", textShadow: "0 0 18px rgba(196,248,42,.45)" }}>{tail}</span>
      </div>
      <div
        style={{
          ...MONO,
          position: "absolute",
          left: 20,
          right: 20,
          bottom: 62,
          fontWeight: 500,
          fontSize: 12,
          color: "#A3A9BC",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        {coverSubtitle(game)}
      </div>
      <div
        style={{
          ...MONO,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 44,
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#C4F82A",
          color: "#0A0B10",
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{coverBand(game)}</span>
        {bandFitsWordmark(game) ? <span>NEON ARENA</span> : null}
      </div>
    </>
  );
}

/**
 * High-quality CSS 3D game box (cover, spine, back) — the no-WebGL fallback and the loading
 * state of the R3F box. The cover is the game's official artwork when it has one, our
 * typographic cover otherwise. Server-safe; decorative (aria-hidden, so the art is alt="").
 */
export default function CssGameBox({ game, className, animate = true }: CssGameBoxProps) {
  const { w, h, d } = BOX_PX;
  const half = d / 2;
  const hasArt = !!getGameArt(game.slug);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 grid place-items-center", className)}>
      <div className="scale-[.56] sm:scale-[.68] lg:scale-[.78] xl:scale-[.88]" style={{ perspective: 1400, perspectiveOrigin: "50% 40%" }}>
        <div className={cn(animate && "animate-float")} style={{ width: w, height: h, transformStyle: "preserve-3d" }}>
          <div
            className={cn(animate && "motion-safe:animate-sway")}
            style={{
              position: "relative",
              width: w,
              height: h,
              transformStyle: "preserve-3d",
              transform: "rotateX(-10deg) rotateY(26deg)",
            }}
          >
            {/* FRONT */}
            <div
              style={{
                ...FACE,
                left: 0,
                top: 0,
                width: w,
                height: h,
                transform: `translateZ(${half}px)`,
                transformStyle: "preserve-3d",
                background: "#0D0F16",
                border: `1px solid ${EDGE}`,
                borderRadius: 4,
                boxShadow: "0 0 60px rgba(196,248,42,.14)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                  borderRadius: 3,
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(238,240,246,.025) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, rgba(238,240,246,.025) 0 1px, transparent 1px 24px)",
                }}
              >
                {/* lime scan line sweeping down the cover (mockup); hidden under reduced motion */}
                {animate ? (
                  <div
                    className="motion-safe:animate-scan"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      height: 2,
                      zIndex: 2,
                      opacity: 0,
                      background: "#C4F82A",
                      boxShadow: "0 0 14px rgba(196,248,42,.7)",
                    }}
                  />
                ) : null}
                {hasArt ? (
                  // official cover (2:3) on the 3:4 face: object-cover crops top/bottom equally,
                  // exactly like the WebGL box's UV fit, so the hand-off is seamless. The 10% ground
                  // tint matches the WebGL cover, which is dimmed to stay under the bloom threshold.
                  <>
                    <GameArtImage slug={game.slug} kind="cover" alt="" sizes={COVER_SIZES} />
                    <div style={{ position: "absolute", inset: 0, background: "rgba(10,11,16,.1)" }} />
                  </>
                ) : (
                  <TypographicCover game={game} />
                )}
              </div>
              {/* hologram reticle popping out of the typographic cover (not over official art) */}
              {hasArt ? null : (
                <div
                  className="text-lime"
                  style={{
                    position: "absolute",
                    left: 130,
                    top: 146,
                    width: 100,
                    height: 100,
                    transform: "translateZ(46px)",
                    filter: "drop-shadow(0 0 8px currentColor)",
                  }}
                >
                  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <circle cx="50" cy="50" r="30" />
                    <path d="M50 4v24M50 72v24M4 50h24M72 50h24" />
                    <circle cx="50" cy="50" r="2.5" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>

            {/* BACK */}
            <div
              style={{
                ...FACE,
                left: 0,
                top: 0,
                width: w,
                height: h,
                padding: 28,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: `rotateY(180deg) translateZ(${half}px)`,
                background: "#0D0F16",
                border: `1px solid ${EDGE}`,
                borderRadius: 4,
              }}
            >
              <div style={{ ...MONO, fontWeight: 700, fontSize: 12, color: "#C4F82A" }}>NEON ARENA · KLUB NASHRI</div>
              <div
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: 26,
                  lineHeight: 1.15,
                  letterSpacing: "-.02em",
                  textTransform: "uppercase",
                  color: "#EEF0F6",
                }}
              >
                {game.tagline}
              </div>
              <div
                style={{
                  height: 56,
                  background:
                    "repeating-linear-gradient(90deg, #EEF0F6 0 2px, transparent 2px 5px, #EEF0F6 5px 6px, transparent 6px 11px)",
                  opacity: 0.75,
                }}
              />
            </div>

            {/* SPINE (left) */}
            <div
              style={{
                ...FACE,
                left: (w - d) / 2,
                top: 0,
                width: d,
                height: h,
                padding: "14px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                transform: `rotateY(-90deg) translateZ(${w / 2}px)`,
                background: "#0B0D13",
                border: `1px solid ${EDGE}`,
              }}
            >
              <div style={{ width: 20, height: 20, background: "#C4F82A" }} />
              <div
                className="font-display"
                style={{
                  writingMode: "vertical-rl",
                  fontWeight: 700,
                  fontSize: 15,
                  lineHeight: 1,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  color: "#EEF0F6",
                  whiteSpace: "nowrap",
                }}
              >
                {game.title}
              </div>
              <svg className="text-lime" width="20" height="20" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                <path d="M16 3 28 10v12L16 29 4 22V10z" />
                <path d="M4 10l12 7 12-7M16 17v12" />
              </svg>
            </div>

            {/* RIGHT SIDE */}
            <div
              style={{
                ...FACE,
                left: (w - d) / 2,
                top: 0,
                width: d,
                height: h,
                transform: `rotateY(90deg) translateZ(${w / 2}px)`,
                background: "#0B0D13",
                backgroundImage: "repeating-linear-gradient(0deg, rgba(238,240,246,.07) 0 1px, transparent 1px 6px)",
                border: `1px solid ${EDGE}`,
              }}
            />

            {/* TOP */}
            <div
              style={{
                ...FACE,
                left: 0,
                top: (h - d) / 2,
                width: w,
                height: d,
                transform: `rotateX(90deg) translateZ(${h / 2}px)`,
                background: "#13161F",
                border: `1px solid ${EDGE}`,
              }}
            >
              <div style={{ position: "absolute", left: 16, right: 16, top: d / 2 - 1, height: 1, background: EDGE_SOFT }} />
            </div>

            {/* BOTTOM */}
            <div
              style={{
                ...FACE,
                left: 0,
                top: (h - d) / 2,
                width: w,
                height: d,
                transform: `rotateX(-90deg) translateZ(${h / 2}px)`,
                background: "#07080C",
                border: `1px solid ${EDGE_SOFT}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
