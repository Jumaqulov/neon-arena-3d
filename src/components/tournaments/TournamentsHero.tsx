"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { gsap, MQ, EASE, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { PODIUM, TOURNAMENTS_PAGE, type PodiumPlace } from "@/lib/data";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/Icon";
import { Placeholder, PhText } from "@/components/ui/Placeholder";
import { CssGridFloor } from "@/components/three/fallbacks";
import HashLink from "./HashLink";

// three.js stays out of the route chunk: the scene loads client-only, after hydration.
const PodiumScene = dynamic(() => import("./PodiumScene"), {
  ssr: false,
  loading: () => <CssGridFloor className="absolute inset-x-0 bottom-0 h-[46%]" />,
});

const T = TOURNAMENTS_PAGE;

/** DOM order is 1-2-3 (reading order); CSS order shows the podium as 2-1-3. */
const PODIUM_BY_PLACE: readonly PodiumPlace[] = [...PODIUM].sort((a, b) => a.place - b.place);
const VISUAL_ORDER: Record<PodiumPlace["place"], string> = { 1: "order-2", 2: "order-1", 3: "order-3" };

const TITLE_WORDS = T.titleBottom.split(" ");
const TITLE_LIME = TITLE_WORDS[TITLE_WORDS.length - 1];
const TITLE_REST = TITLE_WORDS.slice(0, -1);

export default function TournamentsHero() {
  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { progress } = useScrollProgress(stageRef, { start: "top top", end: "bottom top" });
  const wide = useMediaQuery("(min-width: 1024px)");

  useGSAP(
    () => {
      const hero = heroRef.current;
      if (!hero) return;
      // scope: selector strings below resolve inside the hero only
      const mm = gsap.matchMedia(hero);

      // intro (any width, motion allowed): headline lines flip up, the rest rises in
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const f = mobile ? 0.5 : 1;
        gsap.set("[data-hero-line]", { transformPerspective: 900, transformOrigin: "50% 100%" });
        gsap
          .timeline({ defaults: { ease: EASE.expo } })
          .from("[data-hero-line]", {
            yPercent: 60,
            rotationX: -70 * f,
            opacity: 0,
            duration: 1.3,
            stagger: 0.12,
          })
          .from("[data-hero-fade]", { y: 36 * f, opacity: 0, duration: 1.1, stagger: 0.08 }, 0.3)
          .from("[data-hero-strip]", { yPercent: 100, opacity: 0, duration: 1 }, 0.7);
      });

      // desktop scroll: copy and podium separate in depth as the hero leaves
      mm.add(MQ.desktop, () => {
        const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true };
        gsap.to("[data-hero-copy]", {
          y: () => -window.innerHeight * 0.22,
          opacity: 0.15,
          ease: EASE.none,
          scrollTrigger: st,
        });
        gsap.to("[data-hero-label]", { y: () => -window.innerHeight * 0.35, ease: EASE.none, scrollTrigger: { ...st } });
      });

      // below lg the podium is also a visible list under the stage: cards flip up
      mm.add("(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-podium-card]", { transformPerspective: 900, transformOrigin: "50% 100%" });
        gsap.from("[data-podium-card]", {
          opacity: 0,
          y: 40,
          rotationX: -35,
          duration: 1,
          ease: EASE.expo,
          stagger: 0.1,
          scrollTrigger: { trigger: hero.querySelector("[data-podium-list]"), start: "top 90%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      aria-labelledby="hero-title"
      className="relative isolate flex flex-col overflow-hidden bg-[radial-gradient(ellipse_60%_55%_at_70%_30%,#121520_0%,#0A0B10_72%)] lg:min-h-[max(800px,100svh)] lg:justify-center"
    >
      {/* ---------- copy ---------- */}
      <div
        data-hero-copy
        className="container-page relative z-10 pb-8 pt-[calc(var(--header-h)+40px)] md:pt-[calc(var(--header-h)+56px)] lg:pb-36 lg:pt-[calc(var(--header-h)+56px)]"
      >
        <div className="flex max-w-[640px] flex-col gap-7 lg:max-w-[min(600px,48%)]">
          <p data-hero-fade className="eyebrow flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 shrink-0 bg-lime" />
            <span>
              <PhText text={T.eyebrow} />
            </span>
          </p>

          <h1 id="hero-title" className="flex flex-col gap-4 sm:gap-5">
            <span
              data-hero-line
              className="block font-display text-[18px] font-medium tracking-[0.02em] text-muted sm:text-[20px]"
            >
              {T.titleTop}
            </span>{" "}
            <span className="display-xl block text-ink">
              {TITLE_REST.map((w) => (
                <span key={w} data-hero-line className="block">
                  {w}{" "}
                </span>
              ))}
              <span data-hero-line className="block text-lime text-shadow-glow">
                {TITLE_LIME}
              </span>
            </span>
          </h1>

          <p data-hero-fade className="lead max-w-[520px]">
            {T.lead}
          </p>

          <div data-hero-fade className="flex flex-wrap items-center gap-3 sm:gap-4">
            <ButtonLink href="#list" size="lg" iconRight={<IconArrowRight />}>
              {T.primaryCta}
            </ButtonLink>
            <ButtonLink href="#rules" size="lg" variant="secondary">
              {T.secondaryCta}
            </ButtonLink>
          </div>

          <dl
            data-hero-fade
            className="grid max-w-[580px] grid-cols-3 gap-4 border-t border-line pt-6 sm:gap-8"
          >
            {T.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-2">
                <dt className="font-mono text-[12px] font-medium uppercase leading-snug tracking-[0.08em] text-muted">
                  {s.label}
                </dt>
                {/* chip inherits the size (0.875em): fits a 3-up row at 360px, 22px from sm */}
                <dd className="font-mono text-[16px] font-bold text-muted sm:text-[22px]">
                  <PhText text={s.value} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ---------- 3D podium stage ---------- */}
      <div
        ref={stageRef}
        className="relative h-[400px] sm:h-[480px] md:h-[540px] lg:absolute lg:inset-0 lg:h-auto"
      >
        <PodiumScene progress={progress} wide={wide} />
        <p
          id="podium-title"
          data-hero-label
          className="absolute right-[var(--page-gutter)] top-4 z-10 flex flex-col items-end gap-1.5 text-right font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted lg:right-[max(var(--page-gutter),calc((100%_-_1440px)/2_+_var(--page-gutter)))] lg:top-[calc(var(--header-h)+40px)]"
        >
          <span>{T.podiumTitle}</span>
          <Placeholder>{T.podiumDate}</Placeholder>
        </p>
      </div>

      {/* podium as real DOM: visible below lg, screen-reader only from lg (3D plates show it there) */}
      <ul
        data-podium-list
        aria-labelledby="podium-title"
        className="container-page relative z-10 grid grid-cols-3 gap-2 pb-8 sm:gap-4 lg:sr-only"
      >
        {PODIUM_BY_PLACE.map((p) => {
          const first = p.place === 1;
          return (
            <li
              key={p.place}
              data-podium-card
              className={cn(
                "flex flex-col items-center gap-2 rounded-card border bg-surface/90 px-2 py-4 text-center",
                VISUAL_ORDER[p.place],
                first ? "border-lime/60 shadow-glow" : "border-line",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "font-display text-[32px] font-extrabold leading-none",
                  first ? "text-lime text-shadow-glow" : "text-outline",
                )}
              >
                {p.place}
              </span>
              <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                {p.place}-o‘rin
              </span>
              <span className="text-[14px] font-semibold text-ink">{p.handle}</span>
              <span className="font-mono text-[12px] text-muted">
                <PhText text={`${p.points} ball`} />
              </span>
            </li>
          );
        })}
      </ul>

      {/* ---------- live strip ---------- */}
      <div
        id="jonli-efir"
        data-hero-strip
        className="relative z-10 border-t border-line bg-ground/90 lg:absolute lg:inset-x-0 lg:bottom-0"
      >
        <div className="container-page flex flex-wrap items-center gap-x-8 gap-y-2 py-4 lg:min-h-16 lg:flex-nowrap lg:py-2">
          <span className="inline-flex items-center gap-2.5 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-live shadow-[0_0_12px_rgba(255,90,78,.6)] animate-pulse-live"
            />
            {T.live.label}
          </span>
          <span className="text-[15px] font-medium text-ink">
            <PhText text={T.live.title} />
          </span>
          <span className="font-mono text-[14px] text-muted">
            <PhText text={T.live.score} />
          </span>
          <span className="font-mono text-[14px] text-muted">
            <PhText text={T.live.next} />
          </span>
          <span aria-hidden="true" className="hidden h-px flex-1 bg-line lg:block" />
          <HashLink
            href="#list"
            className="inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-lime transition-[filter] hover:brightness-110"
          >
            {T.live.cta}
            <IconArrowRight />
          </HashLink>
        </div>
      </div>
    </section>
  );
}
