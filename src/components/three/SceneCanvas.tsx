"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* ---------- WebGL support (cached, hydration-safe) ---------- */
let webglSupport: boolean | null = null;
function detectWebGL(): boolean {
  if (webglSupport !== null) return webglSupport;
  try {
    const c = document.createElement("canvas");
    webglSupport = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
const noopSubscribe = () => () => {};
/** true when the browser can create a WebGL context (false on the server / first hydration pass). */
export function useWebGLSupport(): boolean {
  return useSyncExternalStore(noopSubscribe, detectWebGL, () => false);
}

export interface SceneCanvasProps
  extends Omit<CanvasProps, "children" | "frameloop" | "dpr" | "fallback" | "style" | "className"> {
  /** R3F scene content (lights, NeonGrid, HoloCube, Effects …) */
  children: ReactNode;
  /** classes for the wrapper div. Default "absolute inset-0". */
  className?: string;
  style?: CSSProperties;
  /**
   * DOM shown when WebGL is unavailable, during SSR / before mount, and (with
   * reducedMotion="fallback") under prefers-reduced-motion. Use CssGridFloor / CssHoloCube.
   */
  fallback?: ReactNode;
  /** Reduced motion behaviour: "still" = render one static frame (default), "fallback" = show `fallback`. */
  reducedMotion?: "still" | "fallback";
  /** device-pixel-ratio range on desktop. Default [1, 1.75]. */
  dpr?: [number, number];
  /** device-pixel-ratio range below 768px. Default [1, 1.25]. */
  mobileDpr?: [number, number];
  /** keep rendering even when scrolled offscreen (e.g. a pinned section). Default false. */
  alwaysRender?: boolean;
  /** IntersectionObserver rootMargin for the offscreen pause. Default "200px 0px". */
  rootMargin?: string;
}

const DEFAULT_CAMERA: NonNullable<CanvasProps["camera"]> = {
  position: [0, 1.6, 8],
  fov: 45,
  near: 0.1,
  far: 200,
};

/**
 * antialias is chosen per device below: every scene mounts <Effects>, whose EffectComposer
 * renders into its own MSAA target on desktop — default-framebuffer MSAA would be paid twice.
 * On mobile <Effects> returns null, so the canvas keeps native antialiasing there.
 */
const DEFAULT_GL = {
  antialias: true,
  powerPreference: "high-performance",
  alpha: true,
} satisfies NonNullable<CanvasProps["gl"]>;

/**
 * Client-only R3F <Canvas> wrapper:
 *  - dpr [1, 1.75] (mobile [1, 1.25]); gl { antialias (mobile only — desktop AA comes from the
 *    EffectComposer), powerPreference: 'high-performance', alpha }
 *  - frameloop "always" while on screen, "never" when offscreen (IntersectionObserver)
 *  - reduced motion → frameloop "demand" (one still frame) or the DOM fallback
 *  - no WebGL → DOM fallback
 *  - wrapper is aria-hidden: always provide DOM text equivalents elsewhere.
 * Import it ONLY from a scene file that is itself loaded with next/dynamic({ ssr: false }).
 */
export default function SceneCanvas({
  children,
  className,
  style,
  fallback = null,
  reducedMotion = "still",
  dpr = [1, 1.75],
  mobileDpr = [1, 1.25],
  alwaysRender = false,
  rootMargin = "200px 0px",
  camera = DEFAULT_CAMERA,
  gl,
  ...rest
}: SceneCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const webgl = useWebGLSupport();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  const showFallback = !webgl || (reduced && reducedMotion === "fallback");
  const frameloop: CanvasProps["frameloop"] = reduced
    ? "demand"
    : alwaysRender || inView
      ? "always"
      : "never";

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={cn("pointer-events-none", className ?? "absolute inset-0")}
      style={style}
    >
      {showFallback ? (
        fallback
      ) : (
        <Canvas
          frameloop={frameloop}
          dpr={isMobile ? mobileDpr : dpr}
          camera={camera}
          gl={gl ?? { ...DEFAULT_GL, antialias: isMobile }}
          fallback={fallback}
          {...rest}
        >
          {children}
        </Canvas>
      )}
    </div>
  );
}
