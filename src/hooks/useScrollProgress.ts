"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/** A mutable number box read inside rAF / R3F useFrame (never causes React renders). */
export type ProgressRef = { current: number };

export interface ScrollProgressOptions {
  /** ScrollTrigger start. Default "top bottom" (element top hits viewport bottom). */
  start?: string;
  /** ScrollTrigger end. Default "bottom top" (element bottom leaves viewport top). */
  end?: string;
  /** Optional callback on every update (progress 0..1). The returned `velocity` ref holds px/s. */
  onUpdate?: (progress: number) => void;
}

/**
 * Exposes 0..1 scroll progress of `target` through the viewport as a ref.
 * Read `progress.current` inside useFrame / rAF. Works with Lenis (ScrollTrigger is synced).
 *
 *   const sectionRef = useRef<HTMLElement>(null);
 *   const { progress } = useScrollProgress(sectionRef, { start: "top top", end: "bottom top" });
 *   // pass `progress` into a 3D scene: <HoloCube explode={progress} />
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  options: ScrollProgressOptions = {},
): { progress: ProgressRef; velocity: ProgressRef } {
  const progress = useRef(0);
  const velocity = useRef(0);
  const { start = "top bottom", end = "bottom top", onUpdate } = options;
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start,
      end,
      onUpdate: (self) => {
        progress.current = self.progress;
        velocity.current = self.getVelocity();
        onUpdateRef.current?.(self.progress);
      },
      onRefresh: (self) => {
        progress.current = self.progress;
      },
    });
    progress.current = st.progress;
    return () => st.kill();
  }, [target, start, end]);

  return { progress, velocity };
}
