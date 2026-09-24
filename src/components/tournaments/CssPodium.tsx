import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { PODIUM } from "@/lib/data";
import { PhText } from "@/components/ui/Placeholder";
import { CssGridFloor, CssHoloCube } from "@/components/three/fallbacks";

/**
 * Static CSS-3D podium (port of the Tournaments mockup scene). No three.js, server-safe.
 * Used as the WebGL podium's fallback: no WebGL, or prefers-reduced-motion.
 * Decorative only (aria-hidden); the hero renders the podium as a real DOM list too.
 */

const EDGE = "rgba(196,248,42,.7)";
const EDGE_SOFT = "rgba(196,248,42,.3)";
const TOP_FILL = "rgba(196,248,42,.12)";
const SIDE_BG: CSSProperties = {
  backgroundColor: "#0D0F15",
  backgroundImage:
    "repeating-linear-gradient(0deg, rgba(196,248,42,.05) 0px, rgba(196,248,42,.05) 1px, transparent 1px, transparent 14px)",
};

interface BlockDef {
  place: 1 | 2 | 3;
  left: number;
  top: number;
  height: number;
  numeral: number;
}

/** 176px wide blocks; top face = 176px square lifted by height / 2 (from the mockup). */
const BLOCKS: readonly BlockDef[] = [
  { place: 2, left: 104, top: 400, height: 200, numeral: 96 },
  { place: 1, left: 292, top: 310, height: 290, numeral: 128 },
  { place: 3, left: 480, top: 460, height: 140, numeral: 76 },
];

/** plate anchors (px in the 760×760 scene) + float phase offsets */
const PLATE_POS: Record<1 | 2 | 3, { left: number; top: number; delay: string }> = {
  1: { left: 282, top: 180, delay: "0s" },
  2: { left: 94, top: 272, delay: "-2s" },
  3: { left: 470, top: 332, delay: "-4s" },
};

const BEAMS = [
  { left: 380, top: 246, height: 64 },
  { left: 192, top: 338, height: 62 },
  { left: 568, top: 398, height: 62 },
];

function Block({ place, left, top, height, numeral }: BlockDef) {
  const first = place === 1;
  return (
    <div className="absolute [transform-style:preserve-3d]" style={{ left, top, width: 176, height }}>
      {/* side */}
      <div
        className="absolute inset-0 box-border border"
        style={{ ...SIDE_BG, borderColor: EDGE_SOFT, transform: "rotateY(90deg) translateZ(88px)" }}
      />
      {/* top */}
      <div
        className="absolute left-0 box-border border"
        style={{
          top: (height - 176) / 2,
          width: 176,
          height: 176,
          background: TOP_FILL,
          borderColor: EDGE,
          transform: `rotateX(90deg) translateZ(${height / 2}px)`,
          boxShadow: first ? "0 0 24px rgba(196,248,42,.35)" : undefined,
        }}
      />
      {/* front */}
      <div
        className="absolute inset-0 box-border flex flex-col items-center justify-center gap-1 border bg-surface"
        style={{
          borderColor: EDGE,
          transform: "translateZ(88px)",
          boxShadow: first ? "inset 0 0 48px rgba(196,248,42,.06)" : undefined,
        }}
      >
        <span
          className={cn(
            "font-display font-extrabold leading-none",
            first ? "text-lime text-shadow-glow" : "text-outline",
          )}
          style={{ fontSize: numeral }}
        >
          {place}
        </span>
        <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
          {place}-o‘rin
        </span>
      </div>
    </div>
  );
}

export interface CssPodiumProps {
  className?: string;
}

export default function CssPodium({ className }: CssPodiumProps) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <CssGridFloor className="absolute inset-x-0 bottom-0 h-[46%]" />

      {/* 760×760 scene, scaled to the stage */}
      <div
        className="absolute left-1/2 top-1/2 size-[760px] -translate-x-1/2 -translate-y-1/2 scale-[.5] [perspective-origin:50%_35%] [perspective:1300px] sm:scale-[.62] lg:left-[70%] lg:top-[54%] lg:scale-[.78] xl:scale-[.9] 2xl:scale-100"
      >
        <div
          className="absolute inset-0 [transform-style:preserve-3d]"
          style={{ transform: "rotateX(-12deg) rotateY(-22deg)" }}
        >
          {/* stage discs */}
          <div
            className="absolute box-border rounded-full border"
            style={{
              left: 100,
              top: 320,
              width: 560,
              height: 560,
              borderColor: EDGE_SOFT,
              background: "rgba(196,248,42,.03)",
              transform: "rotateX(90deg)",
            }}
          />
          <div
            className="absolute box-border rounded-full border border-dashed"
            style={{ left: 190, top: 410, width: 380, height: 380, borderColor: EDGE_SOFT, transform: "rotateX(90deg)" }}
          />

          {BLOCKS.map((b) => (
            <Block key={b.place} {...b} />
          ))}

          {BEAMS.map((b) => (
            <div
              key={b.left}
              className="absolute w-px"
              style={{
                left: b.left,
                top: b.top,
                height: b.height,
                background: "linear-gradient(rgba(196,248,42,.75), rgba(196,248,42,0))",
              }}
            />
          ))}

          {/* hologram trophy */}
          <CssHoloCube size={52} className="absolute" style={{ left: 354, top: 88 }} />

          {/* player plates */}
          {PODIUM.map((p) => {
            const pos = PLATE_POS[p.place];
            const first = p.place === 1;
            return (
              <div key={p.place} className="absolute w-[196px]" style={{ left: pos.left, top: pos.top }}>
                <div className="animate-float" style={{ animationDelay: pos.delay }}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-[12px] border bg-surface/95 px-3.5 py-3 shadow-[0_18px_40px_rgba(0,0,0,.55)]",
                      first ? "border-lime/70" : "border-line",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full font-mono text-[12px] font-bold",
                        first ? "bg-lime text-ground" : "border border-lime/30 bg-raised text-ink",
                      )}
                    >
                      {p.initials}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-semibold text-ink">{p.handle}</span>
                      <span className="font-mono text-[12px] font-medium text-muted">
                        <PhText text={`${p.points} ball`} />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
