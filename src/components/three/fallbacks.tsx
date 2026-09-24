import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Static/CSS-animated 3D compositions with NO three.js — Server-Component safe.
 * Use as <SceneCanvas fallback={…}> and as the `loading` of next/dynamic scene imports.
 * Animations stop automatically under prefers-reduced-motion (global CSS).
 */

export interface CssGridFloorProps {
  /** classes for the wrapper (positioning). Default "absolute inset-x-0 bottom-0 h-[45%]". */
  className?: string;
  /** animate the lines toward the viewer. Default true. */
  animate?: boolean;
}

/** CSS perspective grid floor (rotateX(72deg) plane with lime lines + far-edge fade). */
export function CssGridFloor({ className, animate = true }: CssGridFloorProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none overflow-hidden [perspective:700px] [perspective-origin:50%_0%]",
        className ?? "absolute inset-x-0 bottom-0 h-[45%]",
      )}
    >
      <div
        className={cn("grid-lines absolute -left-1/2 top-0 h-[160%] w-[200%]", animate && "animate-grid-move")}
        style={{ transformOrigin: "50% 0%", transform: "rotateX(72deg)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #0A0B10 0%, rgba(10,11,16,.72) 20%, rgba(10,11,16,0) 60%, rgba(10,11,16,0) 80%, #0A0B10 100%)",
        }}
      />
    </div>
  );
}

export interface CssHoloCubeProps {
  /** edge length in px. Default 220. */
  size?: number;
  /** spin. Default true. */
  animate?: boolean;
  className?: string;
  style?: CSSProperties;
}

const FACE_TRANSFORMS = [
  "rotateY(0deg)",
  "rotateY(90deg)",
  "rotateY(180deg)",
  "rotateY(-90deg)",
  "rotateX(90deg)",
  "rotateX(-90deg)",
];

/** CSS 3D holographic cube (translucent lime faces, glowing edges). */
export function CssHoloCube({ size = 220, animate = true, className, style }: CssHoloCubeProps) {
  const half = size / 2;
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none [perspective:900px]", className)}
      style={{ width: size, height: size, ...style }}
    >
      <div
        className={cn("relative size-full [transform-style:preserve-3d]", animate && "animate-spin-cube")}
        style={{ transform: "rotateX(-20deg) rotateY(-30deg)" }}
      >
        {FACE_TRANSFORMS.map((t) => (
          <div
            key={t}
            className="absolute inset-0 border border-lime/70"
            style={{
              transform: `${t} translateZ(${half}px)`,
              background: "rgba(196,248,42,.06)",
              boxShadow: "inset 0 0 40px rgba(196,248,42,.12)",
            }}
          />
        ))}
        <div
          className="absolute border border-lime/90"
          style={{
            inset: size * 0.34,
            background: "rgba(196,248,42,.16)",
            transform: "rotateX(45deg) rotateZ(45deg)",
            boxShadow: "0 0 24px rgba(196,248,42,.35)",
          }}
        />
      </div>
    </div>
  );
}
