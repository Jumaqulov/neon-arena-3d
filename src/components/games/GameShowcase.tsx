"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { BOOKING_HREF, GAME_QUICK_FACTS, GAMES, getGame, type GameSlug } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";
import { cn } from "@/lib/cn";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ButtonLink } from "@/components/ui/Button";
import { GameArtImage } from "@/components/ui/GameArtImage";
import { PhText, Placeholder } from "@/components/ui/Placeholder";
import { IconArrowDown, IconArrowRight } from "@/components/ui/Icon";
import Reveal from "@/components/motion/Reveal";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import CssGameBox from "./CssGameBox";
import GameBreadcrumb from "./GameBreadcrumb";
import { BOX_BASE_YAW, BOX_YAW_RANGE, faceLabel, gameEyebrow, titleParts, zoneNames } from "./gameArt";

/** three.js stays out of the route chunk */
const GameBoxScene = dynamic(() => import("./GameBoxScene"), { ssr: false, loading: () => null });

/** sticky split layout (box left, copy right) from 1024px */
const LG_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const SM_MOTION = "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)";

function readout(p: number): string {
  const deg = Math.round(((BOX_BASE_YAW + p * BOX_YAW_RANGE) * 180) / Math.PI);
  return `${faceLabel(deg).toUpperCase()} · ${String(((deg % 360) + 360) % 360).padStart(3, "0")}°`;
}

/**
 * Key-art band: min(100vw, 1920px) wide × 400 / 480 / 620px tall (base / sm / lg). The 1920×620
 * art is height-bound in it (object-cover), so its rendered width is max(band width,
 * height × 1920/620) = 1239 / 1487 / 1920px — the source size at most, never enlarged.
 */
const HERO_ART_SIZES = "(min-width: 1024px) 1920px, (min-width: 640px) 1487px, 1239px";

/**
 * Horizontal focus (CSS object-position, for GameArtImage `position`) of each wide key art
 * (its characters) where the band crops the sides.
 */
const HERO_FOCUS: Partial<Record<GameSlug, string>> = {
  "counter-strike-2": "84% 50%",
  "dota-2": "56% 50%",
  pubg: "53% 50%",
  "apex-legends": "80% 50%",
};

const HUD_MONO = "font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted";
const CORNER = "absolute size-6 border-lime/40";

/**
 * /oyinlar/[slug] hero: breadcrumb, sticky WebGL game box (left) that turns with scroll —
 * cover → spine → back — while the copy, quick specs and the "back of the box" facts
 * scroll past on the right (parallax). Below 1024px the box sits between title and details.
 * Games with official artwork get their wide key art as a full-bleed backdrop (the page's
 * LCP image, preloaded) under a ground-colored scrim, drifting slower than the scroll.
 */
export default function GameShowcase({ slug }: { slug: GameSlug }) {
  const game = getGame(slug) ?? GAMES[0];
  const hasArt = !!getGameArt(game.slug);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const artBandRef = useRef<HTMLDivElement>(null);
  const artLayerRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const progress = useRef(0);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useGSAP(
    () => {
      const root = rootRef.current;
      const stage = stageRef.current;
      if (!root || !stage) return;
      const setP = (p: number) => {
        progress.current = p;
        if (readoutRef.current) readoutRef.current.textContent = readout(p);
      };

      const mm = gsap.matchMedia();

      // Key-art backdrop: drifts down at ~1/7 of the scroll speed while the band scrolls away
      // (transform only, never scaled). The gap it opens at the band top stays above the viewport.
      const band = artBandRef.current;
      const layer = artLayerRef.current;
      if (band && layer) {
        mm.add(MQ.motion, () => {
          gsap.fromTo(
            layer,
            { yPercent: 0 },
            { yPercent: 14, ease: "none", scrollTrigger: { trigger: band, start: "top top", end: "bottom top", scrub: true } },
          );
        });
      }

      // Desktop: the stage is sticky; the whole hero (copy + back facts) is the rotation track.
      mm.add(LG_MOTION, () => {
        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (s) => setP(s.progress),
          onRefresh: (s) => setP(s.progress),
        });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
        });
        tl.fromTo("[data-hud='chip-a']", { y: 0, x: 0 }, { y: -170, x: 28 }, 0)
          .fromTo("[data-hud='chip-b']", { y: 0, x: 0 }, { y: 150, x: -20 }, 0)
          .fromTo("[data-hud='frame']", { scale: 1 }, { scale: 1.06 }, 0)
          // specs parallax: each quick fact drifts at its own depth
          .fromTo(
            "[data-spec]",
            // perspective in the FROM vars is applied once (startAt), not tweened
            { y: 0, z: 0, transformPerspective: 900 },
            { y: (i: number) => -24 - i * 26, z: (i: number) => 20 + i * 30 },
            0,
          );
        return () => setP(0);
      });

      // Tablet / mobile: the stage is in flow; the box turns while it scrolls away.
      mm.add(SM_MOTION, () => {
        ScrollTrigger.create({
          trigger: stage,
          // clamp(): the stage is usually already past 60% on load → still start at 0 (cover facing you)
          start: "clamp(top 60%)",
          end: "bottom top",
          onUpdate: (s) => setP(s.progress),
          onRefresh: (s) => setP(s.progress),
        });
        gsap.fromTo(
          "[data-hud='chip-a']",
          { y: 24 },
          { y: -36, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.fromTo(
          "[data-hud='chip-b']",
          { y: -20 },
          { y: 30, ease: "none", scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: true } },
        );
        return () => setP(0);
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const title = titleParts(game.title);
  const zones = zoneNames(game);

  return (
    <div className="relative isolate overflow-x-clip bg-[radial-gradient(ellipse_900px_620px_at_27%_24%,#121520_0%,#0A0B10_72%)]">
      {hasArt ? (
        // Official key art behind the box and copy. Capped at its 1920px source width (edges
        // fade out beyond that) and faded into the ground at the bottom.
        <div
          ref={artBandRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto h-[400px] max-w-[1920px] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_50%,transparent)] sm:h-[480px] lg:h-[620px] min-[1920px]:[mask-composite:intersect] min-[1920px]:[mask-image:linear-gradient(to_bottom,#000_50%,transparent),linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
        >
          <div ref={artLayerRef} className="absolute inset-0">
            <GameArtImage
              slug={game.slug}
              kind="hero"
              alt=""
              sizes={HERO_ART_SIZES}
              preload
              position={HERO_FOCUS[game.slug]}
            />
          </div>
          {/* Functional scrim in the ground color: at 82% even a pure-white pixel of the art
              ends up dark enough for the muted 12px HUD text to keep ≥4.5:1 (≈5:1). */}
          <div className="absolute inset-0 bg-ground/[0.82]" />
        </div>
      ) : null}
      <BigOutlineWord word={game.abbr} className="bottom-[6%] left-0" speed={0.3} size="clamp(120px, 26vw, 380px)" />

      <div className="container-page relative z-10 pt-[calc(var(--header-h)+20px)] md:pt-[calc(var(--header-h)+28px)]">
        <GameBreadcrumb game={game} />
      </div>

      <section
        ref={rootRef}
        aria-labelledby="game-title"
        className="container-page relative z-10 grid grid-cols-1 gap-x-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]"
      >
        {/* ---------- 3D stage ---------- */}
        <div
          ref={stageRef}
          className="relative order-2 h-[clamp(400px,66svh,640px)] lg:order-none lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:h-auto"
        >
          <div className="relative h-full lg:sticky lg:top-[var(--header-h)] lg:h-[calc(100svh-var(--header-h))]">
            <div
              aria-hidden="true"
              className="absolute inset-0 [mask-image:radial-gradient(ellipse_78%_74%_at_50%_48%,#000_58%,transparent_100%)]"
            >
              <CssGameBox
                game={game}
                className={cn("transition-opacity duration-700", ready && "opacity-0")}
              />
              <GameBoxScene slug={game.slug} progress={progress} onReady={onReady} />
            </div>

            {/* HUD (decorative) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div data-hud="frame" className="absolute inset-2 sm:inset-6">
                <span className={cn(CORNER, "left-0 top-0 border-l border-t")} />
                <span className={cn(CORNER, "right-0 top-0 border-r border-t")} />
                <span className={cn(CORNER, "bottom-0 left-0 border-b border-l")} />
                <span className={cn(CORNER, "bottom-0 right-0 border-b border-r")} />
              </div>
              <p className={cn(HUD_MONO, "absolute left-10 top-3 sm:left-[76px] sm:top-[26px]")}>O‘yin qutisi · klub nashri</p>
              <p className={cn(HUD_MONO, "absolute left-10 top-8 text-lime sm:left-auto sm:right-[76px] sm:top-[26px]")}>
                <span ref={readoutRef}>{readout(0)}</span>
              </p>
              <p className={cn(HUD_MONO, "absolute bottom-3 left-10 flex items-center gap-2.5 sm:bottom-[26px] sm:left-[76px]")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="3" width="12" height="18" rx="6" />
                  <path d="M12 7v4" />
                </svg>
                <span className="hidden pointer-fine:inline">Kursorni yurgizing — quti buriladi</span>
                <span className="pointer-fine:hidden">Sahifani suring — quti aylanadi</span>
              </p>
              <div
                data-hud="chip-a"
                className="absolute right-[6%] top-[15%] flex h-8 items-center gap-2 whitespace-nowrap rounded-chip border border-lime/40 bg-ground/90 px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink sm:right-[12%]"
              >
                <span className="size-2 rounded-full bg-lime shadow-glow animate-pulse-live" />
                {game.abbr} · Klubda
              </div>
              <div
                data-hud="chip-b"
                className="absolute bottom-[22%] left-[4%] flex h-9 items-center gap-2.5 whitespace-nowrap rounded-chip border border-lime/40 bg-ground/90 px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink sm:left-[8%]"
              >
                FPS <Placeholder size="sm">[FPS]</Placeholder>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- title ---------- */}
        <div className="order-1 pt-6 lg:order-none lg:col-start-2 lg:row-start-1 lg:self-end lg:pt-[7svh]">
          <Reveal stagger={0.1} className="flex flex-col gap-6">
            <p className="flex items-center gap-3 font-mono text-[13px] font-bold uppercase leading-[1.4] tracking-[0.08em] text-ink">
              <span aria-hidden="true" className="h-0.5 w-7 bg-lime" />
              {gameEyebrow(game)}
            </p>
            <h1
              id="game-title"
              className="text-balance break-words font-display text-[length:clamp(36px,11vw,72px)] font-extrabold uppercase leading-[0.96] tracking-[-0.03em] text-ink lg:text-[length:clamp(48px,5.6vw,80px)]"
            >
              {title.head}
              {title.tail ? <span className="text-lime text-shadow-glow">{title.tail}</span> : null}
            </h1>
          </Reveal>
        </div>

        {/* ---------- details ---------- */}
        <div className="order-3 pt-2 lg:order-none lg:col-start-2 lg:row-start-2 lg:pb-[10svh] lg:pt-6">
          <Reveal stagger={0.08} delay={0.15} className="flex flex-col gap-7">
            <p className="max-w-[540px] text-[17px] leading-[1.55] text-muted">{game.description}</p>

            <div className="flex flex-col gap-3.5">
              <p className="inline-flex h-9 items-center gap-2.5 self-start rounded-chip border border-lime/40 bg-lime/[0.07] px-3.5 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink">
                <span aria-hidden="true" className="size-2 rounded-full bg-lime shadow-glow animate-pulse-live" />
                Klubda o‘rnatilgan
              </p>
              <div className="flex flex-wrap items-center gap-3.5">
                <span id="zones-label" className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">
                  Qaysi zonalarda
                </span>
                <ul aria-labelledby="zones-label" className="flex flex-wrap gap-2">
                  {zones.map((z) => (
                    <li
                      key={z}
                      className="inline-flex h-8 items-center rounded-chip border border-line bg-surface px-3 font-mono text-[13px] font-bold tracking-[0.06em] text-ink"
                    >
                      {z}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-3">
              {GAME_QUICK_FACTS.map((f, i) => (
                <div key={f.label} data-spec className={cn("flex flex-col gap-2", i === 2 && "col-span-2 sm:col-span-1")}>
                  <dt className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">{f.label}</dt>
                  <dd className="text-[15px] leading-[1.9] text-ink">
                    <PhText text={f.value} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-wrap gap-4">
              <ButtonLink
                href={BOOKING_HREF}
                size="lg"
                iconRight={<IconArrowRight />}
                className="w-full max-sm:px-5 max-sm:text-[15px] sm:w-auto"
              >
                Shu o‘yin uchun joy band qilish
              </ButtonLink>
              <ButtonLink href="/turnirlar" size="lg" variant="secondary" className="w-full sm:w-auto">
                Turnirga yozilish
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* ---------- back of the box ---------- */}
        <section
          aria-labelledby="box-back-title"
          className="order-4 mt-14 flex flex-col justify-center gap-10 border-t border-line py-14 lg:order-none lg:col-start-2 lg:row-start-3 lg:mt-0 lg:min-h-[calc(100svh-var(--header-h))] lg:border-t-0 lg:py-24"
        >
          <Reveal stagger={0.1} className="flex flex-col gap-5">
            <p className="eyebrow flex items-center gap-3">
              <span aria-hidden="true" className="h-0.5 w-7 bg-lime" />
              Klub nashri · orqa muqova
            </p>
            <h2
              id="box-back-title"
              className="display-lg text-balance text-ink"
              style={{ fontSize: "clamp(28px, 3.4vw, 48px)" }}
            >
              {game.tagline}
            </h2>
            <p className="max-w-[520px] text-[17px] leading-[1.55] text-muted">
              {hasArt
                ? "Klub nashri qutisi: oldida o‘yinning rasmiy muqovasi, qirrasida nom, orqasida shior."
                : "Klub nashri qutisi — bizning tipografik talqinimiz: oldida monogramma, qirrasida nom, orqasida shior."}{" "}
              O‘yinning o‘zi esa klub kompyuterida sizni kutmoqda.
            </p>
          </Reveal>

          <Reveal as="dl" variant="right" stagger={0.08} className="flex flex-col border-t border-line">
            {[
              { label: "Janr", value: game.genreLabel },
              { label: "Format", value: game.format },
              { label: "Zonalar", value: zones.join(", ") },
              { label: "Holat", value: "O‘rnatilgan, yangilab turiladi" },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-line py-4">
                <dt className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">
                  {row.label}
                </dt>
                <dd className="text-right font-display text-[17px] font-bold leading-[1.3] text-ink sm:text-[20px]">
                  {row.value}
                </dd>
              </div>
            ))}
          </Reveal>

          <div>
            <ButtonLink href="#bilib-oling" variant="secondary" iconRight={<IconArrowDown />}>
              Talablar va turnirlar
            </ButtonLink>
          </div>
        </section>
      </section>
    </div>
  );
}
