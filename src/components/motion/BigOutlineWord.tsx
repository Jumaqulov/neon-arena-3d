"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export interface BigOutlineWordProps {
  /** e.g. "ARENA", "ZONA", "O‘YIN", "TURNIR", "REYTING", "PROFIL" */
  word: string;
  /** positioning classes, e.g. "top-10 -left-8" or "bottom-0 right-0". Default "top-8 left-0". */
  className?: string;
  /** drift strength (fraction of half viewport). Default 0.35. Negative flips direction. */
  speed?: number;
  /** drift axis. Default "x". */
  axis?: "x" | "y";
  /** stroke color: faint lime (default) or hairline grey. */
  tone?: "lime" | "line";
  /** CSS font-size. Default "clamp(96px, 22vw, 320px)". */
  size?: string;
  style?: CSSProperties;
}

/**
 * Huge outlined decorative word behind a section, drifting with scroll (parallax).
 * aria-hidden, pointer-events-none, z-0. The PARENT section must be
 * `relative isolate overflow-hidden` (or overflow-x-clip) and its content `relative z-10`.
 * Trigger = the parent element.
 */
export default function BigOutlineWord({
  word,
  className,
  speed = 0.35,
  axis = "x",
  tone = "lime",
  size = "clamp(96px, 22vw, 320px)",
  style,
}: BigOutlineWordProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const trig = el.parentElement ?? el;
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const f = speed * (mobile ? 0.5 : 1);
        const half = () => (axis === "x" ? window.innerWidth : window.innerHeight) * 0.5;
        gsap.fromTo(
          el,
          { [axis]: () => f * half() },
          {
            [axis]: () => -f * half(),
            ease: "none",
            scrollTrigger: {
              trigger: trig,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [speed, axis] },
  );

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-0 select-none whitespace-nowrap font-display font-extrabold uppercase leading-none tracking-[-0.04em] text-transparent",
        className ?? "top-8 left-0",
      )}
      style={{
        fontSize: size,
        WebkitTextStroke: tone === "lime" ? "1px rgba(196,248,42,.16)" : "1px #262A38",
        ...style,
      }}
    >
      {word}
    </span>
  );
}
