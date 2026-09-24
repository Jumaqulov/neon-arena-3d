"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Thin lime bar fixed at the very top of the viewport showing page scroll progress. */
export default function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        bar.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: true, invalidateOnRefresh: true },
        },
      );
    },
    { scope: bar },
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
    >
      <div
        ref={bar}
        className="h-full w-full bg-lime shadow-glow"
        style={{ transform: "scaleX(0)", transformOrigin: "0 50%" }}
      />
    </div>
  );
}
