"use client";

import { useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import type { MotionTag, PinnedContainer } from "./types";
import { resolvePinnedContainer } from "./types";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

export type RevealVariant = "rise" | "flip" | "zoom" | "left" | "right" | "coin" | "fade";

/**
 * "from" states (desktop). Mobile halves distances.
 * OPACITY (not autoAlpha): content waiting for its entrance stays in the accessibility tree
 * and keyboard-focusable; focusing it scrolls it into view, which plays the entrance.
 */
const FROM: Record<RevealVariant, gsap.TweenVars> = {
  rise: { opacity: 0, y: 110, rotationX: 24, scale: 0.96 },
  flip: { opacity: 0, y: 80, z: -220, rotationY: -38 },
  zoom: { opacity: 0, scale: 0.82, y: 60 },
  left: { opacity: 0, x: -160, rotationY: 30 },
  right: { opacity: 0, x: 160, rotationY: -30 },
  coin: { opacity: 0, rotationY: 180, scale: 0.6 },
  fade: { opacity: 0, y: 24 },
};

function scaled(variant: RevealVariant, f: number): gsap.TweenVars {
  const out: gsap.TweenVars = { ...FROM[variant] };
  if (f === 1) return out;
  if (typeof out.x === "number") out.x *= f;
  if (typeof out.y === "number") out.y *= f;
  if (typeof out.z === "number") out.z *= f;
  if (typeof out.rotationX === "number") out.rotationX *= f;
  if (typeof out.rotationY === "number" && variant !== "coin") out.rotationY *= f;
  return out;
}

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** element to render. Default "div". */
  as?: MotionTag;
  /** 3D entrance. Default "rise". */
  variant?: RevealVariant;
  /** seconds (triggered mode only). Default 0. */
  delay?: number;
  /** animate DIRECT CHILDREN one after another. true = 0.08s, or a number of seconds. */
  stagger?: boolean | number;
  /** tie progress to scroll (scrubbed) instead of playing once. Default false. */
  scrub?: boolean;
  /** ScrollTrigger start. Default "top 85%". */
  start?: string;
  /** ScrollTrigger end (scrub mode only). Default "top 40%". */
  end?: string;
  /** seconds (triggered mode). Default 1.1. */
  duration?: number;
  /** play only once (triggered mode). Default true; false = reverse when scrolling back above. */
  once?: boolean;
  /**
   * Change this (e.g. to the active filter) to re-run the entrance, so children added after
   * a filter change animate too (useful with `stagger` on filtered lists).
   */
  replayKey?: string | number;
  /**
   * The pinned ancestor, when this element sits inside a pinned section BELOW the pin start
   * (ScrollTrigger `pinnedContainer`). A selector string or a ref.
   */
  pinnedContainer?: PinnedContainer;
  children?: ReactNode;
}

/**
 * Scroll-triggered 3D entrance. Content is fully visible in SSR HTML and under reduced
 * motion; the "from" state is applied on the client only when motion is allowed.
 * Sets transformPerspective up front (NOT in the from-vars, where GSAP would tween it
 * 1200 → 0 alongside the rotation), so no perspective parent is required.
 *
 * NOTE: GSAP owns this element's (or, with `stagger`, its children's) transform & opacity.
 * Don't put Tailwind translate/rotate/scale utilities or <Tilt> on the same element —
 * nest instead: <Reveal><Tilt>…</Tilt></Reveal>.
 */
export default function Reveal({
  as: Tag = "div",
  variant = "rise",
  delay = 0,
  stagger = false,
  scrub = false,
  start = "top 85%",
  end = "top 40%",
  duration = 1.1,
  once = true,
  replayKey,
  pinnedContainer,
  children,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  // polymorphic tag (typed as "div" for JSX; ref is a generic HTMLElement)
  const Comp = Tag as "div";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const targets: Element[] = stagger ? Array.from(el.children) : [el];
        if (targets.length === 0) return;
        const each = typeof stagger === "number" ? stagger : stagger ? 0.08 : 0;
        gsap.set(targets, { transformPerspective: 1200, transformOrigin: "50% 100%" });
        gsap.from(targets, {
          ...scaled(variant, mobile ? 0.5 : 1),
          duration,
          delay: scrub ? 0 : delay,
          ease: scrub ? "none" : "expo.out",
          stagger: each,
          scrollTrigger: {
            trigger: el,
            start,
            end: scrub ? end : undefined,
            scrub: scrub ? true : false,
            toggleActions: once ? "play none none none" : "play none none reverse",
            once: once && !scrub,
            pinnedContainer: resolvePinnedContainer(pinnedContainer),
          },
        });
      });
      return () => mm.revert();
    },
    {
      scope: ref,
      dependencies: [variant, delay, stagger, scrub, start, end, duration, once, replayKey, pinnedContainer],
      // replay = tear the previous entrance down first (otherwise matchMedia + triggers stack up)
      revertOnUpdate: true,
    },
  );

  return (
    <Comp ref={ref as RefObject<HTMLDivElement>} {...rest}>
      {children}
    </Comp>
  );
}
