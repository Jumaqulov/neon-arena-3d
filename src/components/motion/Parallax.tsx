"use client";

import { useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import type { MotionTag, PinnedContainer } from "./types";
import { resolvePinnedContainer } from "./types";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

export interface ParallaxProps extends HTMLAttributes<HTMLElement> {
  as?: MotionTag;
  /**
   * Travel as a fraction of HALF the viewport over the trigger's pass through the viewport
   * (from +speed to -speed). Positive = moves against the scroll (feels nearer / faster),
   * negative = drifts with the scroll (feels farther). Typical -0.3 … 0.6. Default 0.2.
   */
  speed?: number;
  /** Axis of travel. Default "y". */
  axis?: "x" | "y";
  /** Degrees; rotates (Z) from -rotate → +rotate across the range. Default 0. */
  rotate?: number;
  /** Optional [from, to] scale across the range. */
  scale?: [number, number];
  /** Multiplier applied below 768px. Default 0.5. */
  mobileFactor?: number;
  /** Timing driver: the parent element (default, robust) or this element. */
  trigger?: "parent" | "self";
  /** ScrollTrigger start. Default "top bottom". */
  start?: string;
  /** ScrollTrigger end. Default "bottom top". */
  end?: string;
  /**
   * The pinned ancestor, when the trigger sits inside a pinned section BELOW the pin start
   * (ScrollTrigger `pinnedContainer`). A selector string or a ref.
   */
  pinnedContainer?: PinnedContainer;
  children?: ReactNode;
}

/**
 * Scroll-scrubbed parallax (transform only). No-op under reduced motion.
 * GSAP owns this element's transform: don't combine with Tailwind translate/rotate/scale
 * utilities, Reveal or Tilt on the same node — nest them.
 */
export default function Parallax({
  as: Tag = "div",
  speed = 0.2,
  axis = "y",
  rotate = 0,
  scale,
  mobileFactor = 0.5,
  trigger = "parent",
  start = "top bottom",
  end = "bottom top",
  pinnedContainer,
  children,
  ...rest
}: ParallaxProps) {
  const ref = useRef<HTMLElement>(null);
  // polymorphic tag (typed as "div" for JSX; ref is a generic HTMLElement)
  const Comp = Tag as "div";
  const scaleFrom = scale?.[0];
  const scaleTo = scale?.[1];

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const trig = trigger === "parent" ? (el.parentElement ?? el) : el;
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const f = speed * (mobile ? mobileFactor : 1);
        const half = () => (axis === "y" ? window.innerHeight : window.innerWidth) * 0.5;
        const fromVars: gsap.TweenVars = { [axis]: () => f * half() };
        const toVars: gsap.TweenVars = {
          [axis]: () => -f * half(),
          ease: "none",
          scrollTrigger: {
            trigger: trig,
            start,
            end,
            scrub: true,
            invalidateOnRefresh: true,
            pinnedContainer: resolvePinnedContainer(pinnedContainer),
          },
        };
        if (rotate) {
          fromVars.rotation = -rotate;
          toVars.rotation = rotate;
        }
        if (scaleFrom !== undefined && scaleTo !== undefined) {
          fromVars.scale = scaleFrom;
          toVars.scale = scaleTo;
        }
        gsap.fromTo(el, fromVars, toVars);
      });
      return () => mm.revert();
    },
    {
      scope: ref,
      dependencies: [speed, axis, rotate, scaleFrom, scaleTo, mobileFactor, trigger, start, end, pinnedContainer],
    },
  );

  return (
    <Comp ref={ref as RefObject<HTMLDivElement>} {...rest}>
      {children}
    </Comp>
  );
}
