"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import { BOOKING_HREF, GAMES, GENRES, ZONES } from "@/lib/data";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { scrollAndFocus } from "@/lib/scroll-store";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrowDown, IconArrowRight } from "@/components/ui/Icon";
import Reveal from "@/components/motion/Reveal";
import { CssGridFloor } from "@/components/three/fallbacks";
import { genreCounts, type GenreFilter } from "./gameArt";
import { requestGenre } from "./genreBus";

/** three.js stays out of the route chunk */
const ShelfScene = dynamic(() => import("./ShelfScene"), {
  ssr: false,
  loading: () => <CssGridFloor />,
});

const LG_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

/**
 * /games hero: every game box on a holographic ring (WebGL). Time spins the ring,
 * scroll spins it faster, pushes the boxes apart and lifts the camera (4D); the headline
 * tilts back into depth. Genre chips jump to the catalog with that genre selected.
 */
export default function LibraryHero() {
  const rootRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const split = useMediaQuery("(min-width: 1024px)");
  const counts = useMemo(() => genreCounts(GAMES), []);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom top",
          onUpdate: (s) => {
            progress.current = s.progress;
          },
          onRefresh: (s) => {
            progress.current = s.progress;
          },
        });
        return () => {
          progress.current = 0;
        };
      });
      mm.add(LG_MOTION, () => {
        gsap.set("[data-hero-copy]", { transformPerspective: 1200, transformOrigin: "50% 0%" });
        gsap.to("[data-hero-copy]", {
          y: -90,
          z: -160,
          rotationX: 16,
          autoAlpha: 0.2,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-hud]", {
          y: 60,
          autoAlpha: 0,
          ease: "none",
          scrollTrigger: { trigger: root, start: "top top", end: "40% top", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const jump = (g: GenreFilter) => {
    requestGenre(g);
    scrollAndFocus("#katalog");
  };

  return (
    <section
      ref={rootRef}
      aria-labelledby="library-title"
      className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_1100px_700px_at_72%_40%,#121520_0%,#0A0B10_70%)] lg:flex lg:min-h-[max(100svh,760px)] lg:items-center"
    >
      <div className="container-page relative z-10 pb-10 pt-[calc(var(--header-h)+48px)] lg:pb-24 lg:pt-[calc(var(--header-h)+40px)]">
        <div data-hero-copy className="max-w-[720px]">
          <Reveal stagger={0.1} className="flex flex-col gap-7">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden="true" className="size-2 shrink-0 rotate-45 bg-lime shadow-glow" />
              Katalog · {GAMES.length} ta o‘yin · {GENRES.length} janr
            </p>
            {/* "KUTUBXONASI" ≈ 8.95em wide in Unbounded 800 → 9vw keeps it inside 328px at 360px */}
            <h1 id="library-title" className="display-xl text-ink" style={{ fontSize: "clamp(30px, 9vw, 76px)" }}>
              <span className="block">O‘yinlar</span>
              <span className="block text-outline">kutubxonasi</span>
            </h1>
            <p className="lead max-w-[560px]">
              Klub kompyuterlari va konsollarida o‘rnatilgan o‘yinlar. Har birining sahifasida — zonalar, talablar va yaqin
              turnirlar.
            </p>
            <div className="flex flex-col gap-3">
              <p id="hero-genres" className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">
                Janrga o‘tish
              </p>
              <div role="group" aria-labelledby="hero-genres" className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => jump(g)}
                    className="inline-flex h-11 items-center gap-2 rounded-btn border border-line bg-surface/80 px-4 text-[15px] font-medium text-ink backdrop-blur-sm transition-[border-color,color] duration-200 hover:border-lime/60 hover:text-lime"
                  >
                    {g}
                    <span className="font-mono text-[12px] font-bold tracking-[0.04em] text-muted">{counts[g]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="#katalog" size="lg" iconRight={<IconArrowDown />} className="w-full sm:w-auto">
                Katalogni ko‘rish
              </ButtonLink>
              <ButtonLink href={BOOKING_HREF} size="lg" variant="secondary" iconRight={<IconArrowRight />} className="w-full sm:w-auto">
                Joy band qilish
              </ButtonLink>
            </div>
            <dl className="grid max-w-[480px] grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                { label: "O‘yinlar", value: GAMES.length },
                { label: "Janrlar", value: GENRES.length },
                { label: "Zonalar", value: ZONES.length },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1.5">
                  <dt className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">{s.label}</dt>
                  <dd className="font-display text-[28px] font-extrabold leading-none text-ink">{String(s.value).padStart(2, "0")}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {/* WebGL ring of boxes: under the copy on phones/tablets, behind-right on desktop */}
      <div aria-hidden="true" className="relative h-[54svh] min-h-[340px] max-h-[560px] lg:absolute lg:inset-0 lg:h-auto lg:max-h-none">
        <ShelfScene progress={progress} split={split} />
        {/* keeps the headline legible where boxes pass behind it (desktop) */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[58%] bg-linear-to-r from-ground/85 via-ground/45 to-transparent lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-ground" />
        <div
          data-hero-hud
          className="pointer-events-none absolute bottom-6 right-[var(--page-gutter)] hidden items-center gap-3 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted lg:flex"
        >
          <span className="size-2 rounded-full bg-lime shadow-glow animate-pulse-live" />
          360° · Kutubxona aylanadi — pastga suring
        </div>
      </div>
    </section>
  );
}
