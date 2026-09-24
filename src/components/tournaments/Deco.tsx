import { cn } from "@/lib/cn";
import Parallax from "@/components/motion/Parallax";
import { CssHoloCube } from "@/components/three/fallbacks";

/**
 * Decorative parallax line-art for the tournaments sections (aria-hidden, pointer-events-none,
 * hidden below md). Each layer drifts at its own speed so sections read in depth while scrolling.
 * Place inside a `relative isolate overflow-hidden` section, behind `relative z-10` content.
 */

interface DecoProps {
  /** positioning classes, e.g. "left-[6%] top-24" */
  className?: string;
  /** Parallax speed (+ nearer / − farther) */
  speed?: number;
  /** degrees of Z rotation across the pass */
  rotate?: number;
}

const LAYER = "pointer-events-none absolute z-0 hidden md:block";

/** thin lime ring with a dashed inner orbit */
export function DecoRing({ className, speed = 0.3, rotate = 0, size = 180 }: DecoProps & { size?: number }) {
  return (
    <Parallax aria-hidden="true" speed={speed} rotate={rotate} className={cn(LAYER, className)}>
      <div className="relative rounded-full border border-lime/20" style={{ width: size, height: size }}>
        <div className="absolute inset-[18%] rounded-full border border-dashed border-lime/15" />
        <div className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime/60" />
      </div>
    </Parallax>
  );
}

/** HUD crosshair mark */
export function DecoCross({ className, speed = -0.2, rotate = 0 }: DecoProps) {
  return (
    <Parallax aria-hidden="true" speed={speed} rotate={rotate} className={cn(LAYER, className)}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" stroke="rgba(196,248,42,.4)" strokeWidth="1">
        <circle cx="36" cy="36" r="14" />
        <path d="M36 4v18M36 50v18M4 36h18M50 36h18" />
        <path d="M8 8h8M8 8v8M64 8h-8M64 8v8M8 64h8M8 64v-8M64 64h-8M64 64v-8" stroke="rgba(196,248,42,.25)" />
      </svg>
    </Parallax>
  );
}

/** small spinning wireframe cube (CSS 3D) */
export function DecoCube({ className, speed = 0.5, size = 56 }: DecoProps & { size?: number }) {
  return (
    <Parallax aria-hidden="true" speed={speed} className={cn(LAYER, className)}>
      <CssHoloCube size={size} />
    </Parallax>
  );
}
