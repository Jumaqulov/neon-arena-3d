"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import type { MotionTag } from "./types";
import { cn } from "@/lib/cn";
import { useCanHover } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface TiltProps extends HTMLAttributes<HTMLElement> {
  as?: MotionTag;
  /** max rotation in degrees. Default 10. */
  max?: number;
  /** hover scale. Default 1.02. */
  scale?: number;
  /** perspective in px. Default 1000. */
  perspective?: number;
  /** soft highlight following the pointer. Default false. */
  glare?: boolean;
  /** force off. */
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * Pointer-driven 3D tilt with spring easing (rAF, CSS transform only).
 * No-op on touch / coarse pointers and under reduced motion.
 * The element is `relative` + `transform-style: preserve-3d` — give children depth with
 * e.g. `className="[transform:translateZ(40px)]"`.
 * Exposes CSS vars --tilt-mx / --tilt-my (0%..100%) and --tilt-active (0|1).
 * Tilt owns this element's inline `transform` — never put Reveal/Parallax on the same node.
 */
export default function Tilt({
  as: Tag = "div",
  max = 10,
  scale = 1.02,
  perspective = 1000,
  glare = false,
  disabled = false,
  className,
  style,
  children,
  onPointerMove,
  onPointerLeave,
  onPointerEnter,
  ...rest
}: TiltProps) {
  const ref = useRef<HTMLElement>(null);
  // polymorphic tag (typed as "div" for JSX; ref is a generic HTMLElement)
  const Comp = Tag as "div";
  const canHover = useCanHover();
  const reduced = useReducedMotion();
  const enabled = canHover && !reduced && !disabled;

  const target = useRef({ rx: 0, ry: 0, s: 1 });
  const current = useRef({ rx: 0, ry: 0, s: 1 });
  const raf = useRef(0);
  const perspectiveRef = useRef(perspective);

  useEffect(() => {
    perspectiveRef.current = perspective;
  }, [perspective]);

  const step = useCallback(function step() {
    const el = ref.current;
    if (!el) {
      raf.current = 0;
      return;
    }
    const c = current.current;
    const t = target.current;
    const k = 0.14;
    c.rx += (t.rx - c.rx) * k;
    c.ry += (t.ry - c.ry) * k;
    c.s += (t.s - c.s) * k;
    el.style.transform = `perspective(${perspectiveRef.current}px) rotateX(${c.rx.toFixed(3)}deg) rotateY(${c.ry.toFixed(3)}deg) scale(${c.s.toFixed(4)})`;
    const settled =
      Math.abs(t.rx - c.rx) < 0.01 && Math.abs(t.ry - c.ry) < 0.01 && Math.abs(t.s - c.s) < 0.0005;
    raf.current = settled ? 0 : requestAnimationFrame(step);
  }, []);

  const kick = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(step);
  }, [step]);

  useEffect(() => {
    const el = ref.current;
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
      if (el) el.style.transform = "";
    };
  }, []);

  const handleMove = (e: ReactPointerEvent<HTMLElement>) => {
    onPointerMove?.(e);
    if (!enabled || e.pointerType === "touch") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    target.current = { rx: -(py - 0.5) * 2 * max, ry: (px - 0.5) * 2 * max, s: scale };
    el.style.setProperty("--tilt-mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--tilt-my", `${(py * 100).toFixed(1)}%`);
    kick();
  };

  const handleEnter = (e: ReactPointerEvent<HTMLElement>) => {
    onPointerEnter?.(e);
    if (!enabled) return;
    e.currentTarget.style.setProperty("--tilt-active", "1");
  };

  const handleLeave = (e: ReactPointerEvent<HTMLElement>) => {
    onPointerLeave?.(e);
    e.currentTarget.style.setProperty("--tilt-active", "0");
    target.current = { rx: 0, ry: 0, s: 1 };
    if (enabled) kick();
  };

  const baseStyle: CSSProperties = {
    transformStyle: "preserve-3d",
    ...style,
  };

  return (
    <Comp
      ref={ref as RefObject<HTMLDivElement>}
      className={cn("relative", className)}
      style={baseStyle}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
      {...rest}
    >
      {children}
      {glare && enabled ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: "var(--tilt-active, 0)",
            background:
              "radial-gradient(420px circle at var(--tilt-mx, 50%) var(--tilt-my, 50%), rgba(238,240,246,.07), transparent 60%)",
          }}
        />
      ) : null}
    </Comp>
  );
}
