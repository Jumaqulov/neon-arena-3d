"use client";

import { useRef } from "react";
import { ACHIEVEMENTS, PROFILE } from "@/lib/data";
import { EASE, gsap, MQ, useGSAP } from "@/lib/gsap";
import { PhText } from "@/components/ui/Placeholder";
import AchievementCoin from "./AchievementCoin";

const A = PROFILE.achievementsSection;

export interface AchievementsPanelProps {
  flipped: Readonly<Record<string, boolean>>;
  onToggle: (id: string) => void;
}

/**
 * "Yutuqlar" tab: 8 achievement coins. On scroll (or when the tab opens in view) the tiles
 * rise and each coin spins in like a tossed coin landing (rotateY −540° → 0), staggered.
 */
export default function AchievementsPanel({ flipped, onToggle }: AchievementsPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const [grid] = q("[data-ach='grid']");
        gsap.from(q("[data-ach='head']"), {
          opacity: 0,
          y: mobile ? 24 : 48,
          duration: 1,
          ease: EASE.expo,
          scrollTrigger: { trigger: root, start: "top 88%", once: true },
        });
        if (!grid) return;
        gsap
          .timeline({ scrollTrigger: { trigger: grid, start: "top 85%", once: true } })
          .from(
            q("[data-ach='tile']"),
            { opacity: 0, y: mobile ? 30 : 70, duration: 1.1, ease: EASE.expo, stagger: 0.08 },
            0,
          )
          .from(
            q("[data-ach='spin']"),
            {
              rotationY: mobile ? -360 : -540,
              scale: 0.5,
              duration: mobile ? 1.5 : 2,
              ease: "power4.out",
              stagger: 0.08,
            },
            0,
          );
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} className="flex flex-col gap-8">
      <div data-ach="head" className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-[22px] font-bold leading-[1.2] tracking-[-0.01em] sm:text-[24px]">
            {A.title}
          </h3>
          <p className="text-[16px] leading-[1.55] text-muted">{A.lead}</p>
        </div>
        <p className="inline-flex h-10 shrink-0 items-center gap-2.5 self-start rounded-chip border border-line bg-surface px-3.5 font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-muted sm:self-auto">
          <PhText text={A.count} />
        </p>
      </div>

      <ul data-ach="grid" className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a, i) => (
          <li key={a.id} className="flex">
            <AchievementCoin achievement={a} index={i} flipped={!!flipped[a.id]} onToggle={() => onToggle(a.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
