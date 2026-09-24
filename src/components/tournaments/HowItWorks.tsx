"use client";

import { useRef } from "react";
import { gsap, MQ, EASE, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { HOW_IT_WORKS, TOURNAMENTS_PAGE } from "@/lib/data";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import { IconArrowRight } from "@/components/ui/Icon";
import { Placeholder } from "@/components/ui/Placeholder";
import NumberedHeading from "./NumberedHeading";
import { DecoCube, DecoRing } from "./Deco";

const H = HOW_IT_WORKS;
const LIFT = 22; // px between stacked plates (mockup)

/**
 * Isometric stack for step n (0-based): n + 1 plates under the numbered top plate.
 * Final state lives in inline styles (static / reduced-motion view); GSAP only animates
 * FROM an exploded state, so the stack assembles itself while scrolling.
 */
function PlateStack({ index, num }: { index: number; num: string }) {
  const last = index === 2;
  const under = index + 1; // base + index mids
  const topZ = under * LIFT;
  return (
    <div aria-hidden="true" className="relative flex h-[240px] items-center justify-center [perspective:900px]">
      {/* static isometric tilt (outer) + animated spin (inner) keep the mockup's rotateX(58) rotateZ(-40) order */}
      <div className="relative size-[168px] [transform-style:preserve-3d]" style={{ transform: "rotateX(58deg)" }}>
        <div data-spin className="absolute inset-0 [transform-style:preserve-3d]" style={{ transform: "rotate(-40deg)" }}>
          <div
            className="absolute inset-0 rounded-[14px] bg-black/55 blur-[14px]"
            style={{ transform: "translateZ(-4px)" }}
          />
          {Array.from({ length: under }, (_, k) => (
            <div
              key={k}
              data-plate
              className="absolute inset-0 box-border rounded-[14px] border border-lime/30 bg-surface/90"
              style={{ transform: `translateZ(${k * LIFT}px)` }}
            />
          ))}
          <div
            data-plate
            className="absolute inset-0 [transform-style:preserve-3d]"
            style={{ transform: `translateZ(${topZ}px)` }}
          >
            <div
              data-lift
              className={cn(
                "absolute inset-0 box-border flex items-center justify-center rounded-[14px] border",
                last
                  ? "border-lime bg-lime shadow-glow"
                  : "border-lime/70 bg-surface shadow-[0_0_24px_rgba(196,248,42,.16)]",
              )}
            >
              <span
                className={cn(
                  "font-display text-[56px] font-extrabold tracking-[-0.04em]",
                  last ? "text-ground" : "text-lime",
                )}
              >
                {num}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;
      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", list);
      const connector = sectionRef.current?.querySelector("[data-connector]") ?? null;
      const mm = gsap.matchMedia(sectionRef.current ?? undefined);

      // desktop: one scrubbed timeline — steps assemble one after another while scrolling
      mm.add(MQ.desktop, () => {
        const tl = gsap.timeline({
          defaults: { ease: EASE.none },
          scrollTrigger: { trigger: list, start: "top 85%", end: "top 20%", scrub: 0.8 },
        });
        if (connector) tl.from(connector, { scaleX: 0, transformOrigin: "0% 50%", duration: 1.6 }, 0);
        steps.forEach((step, i) => {
          const at = i * 0.4;
          tl.from(step.querySelector("[data-spin]"), { rotation: "-=110", duration: 1 }, at)
            .from(
              step.querySelectorAll("[data-plate]"),
              { z: (j: number) => `+=${160 + j * 70}`, opacity: 0, duration: 0.8, stagger: 0.1 },
              at,
            )
            .from(step.querySelector("[data-step-text]"), { y: 60, opacity: 0, duration: 0.6 }, at + 0.35);
        });
      });

      // mobile: light, triggered (not scrubbed) drop-in per step
      mm.add(MQ.mobile, () => {
        steps.forEach((step) => {
          gsap
            .timeline({ scrollTrigger: { trigger: step, start: "top 85%", once: true } })
            .from(step.querySelectorAll("[data-plate]"), {
              z: (j: number) => `+=${90 + j * 40}`,
              opacity: 0,
              duration: 0.9,
              ease: EASE.expo,
              stagger: 0.08,
            })
            .from(step.querySelector("[data-step-text]"), { y: 28, opacity: 0, duration: 0.7, ease: EASE.expo }, 0.2);
        });
      });

      // "4D": the numbered top plates keep breathing on their own clock — only while the list
      // is on screen (paused offscreen so the preserve-3d stacks stop compositing)
      mm.add(MQ.motion, () => {
        const breaths = gsap.utils.toArray<HTMLElement>("[data-lift]", list).map((el, i) =>
          gsap.to(el, { z: 16, duration: 2.25, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.75, paused: true }),
        );
        if (!breaths.length) return;
        ScrollTrigger.create({
          trigger: list,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => breaths.forEach((t) => (self.isActive ? t.play() : t.pause())),
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="rules"
      aria-labelledby="rules-title"
      className="section-y relative isolate overflow-hidden border-t border-line"
    >
      <BigOutlineWord word="ARENA" className="bottom-10 -left-6" speed={-0.35} />
      <DecoCube className="right-[8%] top-28" speed={0.45} size={52} />
      <DecoRing className="left-[38%] top-[46%]" speed={-0.3} rotate={50} size={120} />

      <div className="container-page relative z-10 flex flex-col gap-14">
        <NumberedHeading
          id="rules-title"
          eyebrow={H.eyebrow}
          title={H.title}
          aside={<p className="text-[17px] leading-relaxed text-muted">{H.lead}</p>}
        />

        <div className="relative">
          <div
            aria-hidden="true"
            data-connector
            className="absolute left-[16%] right-[16%] top-[120px] hidden border-t border-dashed border-line md:block"
          />
          <ol ref={listRef} className="relative grid gap-10 md:grid-cols-3 md:gap-6">
            {H.steps.map((s, i) => (
              <li key={s.num} data-step className="flex flex-col gap-6">
                <PlateStack index={i} num={s.num} />
                <div data-step-text className="flex flex-col gap-2.5 px-2">
                  <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                    {H.stepLabel} {s.num}
                  </p>
                  <h3 className="font-display text-[22px] font-bold leading-tight text-ink">{s.title}</h3>
                  <p className="text-[16px] leading-relaxed text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="text-[16px] leading-relaxed text-muted">{H.footnote}</p>
          {/* full rules document: TOURNAMENTS_PAGE.rulesHref. Until the URL is known ("#") it is
              shown as a non-link with a [HAVOLA] chip instead of a dead jump to the page top. */}
          {TOURNAMENTS_PAGE.rulesHref === "#" ? (
            <p className="inline-flex min-h-12 shrink-0 items-center gap-2.5 text-[16px] font-semibold text-muted">
              {H.rulesCta}
              <Placeholder>[HAVOLA]</Placeholder>
            </p>
          ) : (
            <a
              href={TOURNAMENTS_PAGE.rulesHref}
              className="inline-flex min-h-12 shrink-0 items-center gap-2.5 text-[16px] font-semibold text-lime transition-[filter] hover:brightness-110"
            >
              {H.rulesCta}
              <IconArrowRight />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
