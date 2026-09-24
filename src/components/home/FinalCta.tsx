"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { BOOKING_LABEL, FINAL_CTA } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/Icon";
import { CssGridFloor } from "@/components/three/fallbacks";

const FinalCtaScene = dynamic(() => import("./FinalCtaScene"), {
  ssr: false,
  loading: () => <CssGridFloor className="absolute inset-x-0 bottom-0 h-[62%]" />,
});

/**
 * SENING NAVBATING — final call to action. The WebGL camera dives and rushes over the grid as
 * the section scrolls in (grid speed tied to scroll velocity); the headline lines rise in 3D.
 */
export default function FinalCta() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom bottom",
          onUpdate: (self) => {
            progress.current = self.progress;
          },
          onRefresh: (self) => {
            progress.current = self.progress;
          },
        });
      });

      mm.add(MQ.desktop, () => {
        gsap.fromTo(
          ".cta-line",
          { yPercent: 80, rotationX: -60, opacity: 0, transformPerspective: 900, transformOrigin: "50% 100%" },
          {
            yPercent: 0,
            rotationX: 0,
            opacity: 1,
            ease: "none",
            stagger: 0.18,
            scrollTrigger: { trigger: el, start: "top 80%", end: "top 25%", scrub: true },
          },
        );
        gsap.from(".cta-fade", {
          y: 36,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 45%", once: true },
        });
      });

      mm.add(MQ.mobile, () => {
        gsap.from(".cta-line, .cta-fade", {
          y: 40,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 75%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="cta-title"
      className="relative isolate flex min-h-[600px] items-center justify-center overflow-hidden border-t border-line py-24 md:min-h-[90svh] md:py-28"
    >
      <FinalCtaScene progress={progress} className="absolute inset-0" />
      {/* soft ground-colour vignette so the copy always reads over the grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_62%_48%_at_50%_46%,rgba(10,11,16,.88)_0%,rgba(10,11,16,.55)_45%,rgba(10,11,16,0)_75%)]"
      />

      <div className="container-page relative z-10 flex flex-col items-center gap-8 text-center">
        <p className="cta-fade font-mono text-[13px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-lime">
          {FINAL_CTA.eyebrow}
        </p>
        <h2 id="cta-title" className="display-2xl text-ink">
          {FINAL_CTA.titleLines.map((line, i) => (
            <span key={line} className="block overflow-visible">
              <span className={i === FINAL_CTA.titleLines.length - 1 ? "cta-line block text-lime text-shadow-glow" : "cta-line block"}>
                {line}
              </span>
            </span>
          ))}
        </h2>
        <p className="cta-fade text-[17px] leading-[1.55] text-muted md:text-[19px]">{FINAL_CTA.lead}</p>
        <div className="cta-fade">
          <ButtonLink href="#booking" size="lg" iconRight={<IconArrowRight />}>
            {BOOKING_LABEL}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
