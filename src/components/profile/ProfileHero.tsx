"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { BOOKING_HREF, PROFILE } from "@/lib/data";
import { EASE, gsap, MQ, useGSAP } from "@/lib/gsap";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PhText } from "@/components/ui/Placeholder";
import { IconArrowRight, IconClock, IconStar, IconTrophy } from "@/components/ui/Icon";
import { CssGridFloor } from "@/components/three/fallbacks";
import MemberCardStage from "./MemberCardStage";
import { IconCrown, IconPencil } from "./icons";
import { useProfile } from "./ProfileProvider";
import type { SceneAnchor } from "./sceneTypes";

// three.js stays out of the route chunk: the scene is its own client-only chunk
const ProfileScene = dynamic(() => import("./ProfileScene"), {
  ssr: false,
  loading: () => <CssGridFloor className="absolute inset-x-0 bottom-0 h-[46%]" />,
});

const STAT_ICONS = [IconClock, IconTrophy, IconCrown, IconStar] as const;
const [CRUMB_ROOT, CRUMB_TIER] = PROFILE.breadcrumb.split(" / ");
const HANDLE_CHARS = Array.from(PROFILE.handle);
/** visual XP fill only (the real value is the [XP] placeholder) */
const XP_FILL = "64%";
const XP_SEGMENTS =
  "repeating-linear-gradient(90deg, transparent 0 calc(10% - 2px), rgba(10,11,16,.55) calc(10% - 2px) 10%)";

/**
 * /profile hero: WebGL arena environment + the 3D member card (tilt, flip) on the left,
 * identity / level / XP / stat tiles on the right.
 *
 * Motion (GSAP, desktop + mobile, never under reduced motion):
 *  - intro: card flies in from depth, pedestal expands, handle letters flip up,
 *    stat tiles zoom in, XP bar fills
 *  - scroll (scrubbed, NOT pinned): the card turns away (rotateY -55°) and sinks back,
 *    the identity column rises faster (depth parallax), stat tiles tilt back at staggered
 *    depths, the 3D scene dollies forward and its cubes explode.
 */
export default function ProfileHero() {
  const heroRef = useRef<HTMLElement>(null);
  const sceneBoxRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const anchor = useRef<SceneAnchor>({ x: 0.28, y: 0.5, w: 0.3, h: 0.2 });
  const { progress } = useScrollProgress(heroRef, { start: "top top", end: "bottom top" });
  const { openSettings } = useProfile();

  // keep the 3D scene aligned with the DOM card (read in useFrame, no re-render)
  useEffect(() => {
    const box = sceneBoxRef.current;
    const card = cardRef.current;
    if (!box || !card) return;
    const measure = () => {
      const b = box.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      if (!b.width || !b.height) return;
      anchor.current = {
        x: (c.left + c.width / 2 - b.left) / b.width,
        y: (c.top + c.height / 2 - b.top) / b.height,
        w: c.width / b.width,
        h: c.height / b.height,
      };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(card);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const root = heroRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add({ motion: MQ.motion, desktop: MQ.desktop }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;

        // perspective is SET (not tweened): inside from() it would shrink with the rotation
        gsap.set(q("[data-hero='char']"), { transformPerspective: 600, transformOrigin: "50% 100%" });
        gsap.set(q("[data-hero='stat']"), { transformPerspective: 900, transformOrigin: "50% 100%" });

        /* ---- intro (time) ---- */
        gsap
          .timeline({ defaults: { ease: EASE.expo } })
          .from(q("[data-hero='card-fade-in']"), { autoAlpha: 0, duration: 1.1 }, 0)
          .from(
            q("[data-hero='card-intro']"),
            { rotationY: -42, rotationX: 22, z: desktop ? -520 : -260, duration: 2 },
            0,
          )
          .from(
            q("[data-hero='pedestal-intro']"),
            { scale: 0.35, autoAlpha: 0, duration: 1.6 },
            0.15,
          )
          .from(
            q("[data-hero='char']"),
            { yPercent: 115, rotationX: -75, autoAlpha: 0, stagger: 0.045, duration: 1.2 },
            0.1,
          )
          .from(q("[data-hero='id-item']"), { autoAlpha: 0, y: 36, stagger: 0.08, duration: 1.1 }, 0.3)
          .from(
            q("[data-hero='stat']"),
            { autoAlpha: 0, scale: 0.8, y: 46, stagger: 0.09, duration: 1.2 },
            0.45,
          )
          .from(
            q("[data-hero='xp-fill']"),
            { scaleX: 0, transformOrigin: "0% 50%", duration: 1.6, ease: EASE.inOut },
            0.6,
          );

        /* ---- scroll exit (scrubbed; different nodes/props than the intro) ---- */
        const exit = gsap.timeline({
          defaults: { ease: EASE.none, duration: 1 },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
        exit
          .to(
            q("[data-hero='card-scroll']"),
            {
              rotationY: desktop ? -55 : -32,
              rotationX: desktop ? 16 : 10,
              z: desktop ? -380 : -160,
              y: desktop ? 140 : 60,
            },
            0,
          )
          .to(q("[data-hero='card-fade-out']"), { autoAlpha: 0.2, duration: 0.65 }, 0.35)
          .to(
            q("[data-hero='pedestal-scroll']"),
            { scale: 0.55, autoAlpha: 0, y: 40, duration: 0.8 },
            0,
          );
        if (desktop) {
          exit
            .to(q("[data-hero='identity']"), { y: -150 }, 0)
            .to(q("[data-hero='stat']"), { rotationX: -32, z: (i: number) => -60 - i * 50 }, 0);
        }
      });

      return () => mm.revert();
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      aria-labelledby="profile-name"
      className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_85%_55%_at_50%_26%,#131623_0%,#0A0B10_72%)] pt-[var(--header-h)] lg:bg-[radial-gradient(ellipse_60%_75%_at_27%_48%,#131623_0%,#0A0B10_72%)]"
    >
      {/* 3D environment (decorative, aria-hidden inside SceneCanvas) */}
      <div
        ref={sceneBoxRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[620px] [mask-image:linear-gradient(180deg,#000_0%,#000_58%,transparent_94%)] sm:h-[720px] lg:inset-y-0 lg:h-auto lg:[mask-image:linear-gradient(90deg,#000_0%,#000_46%,transparent_88%)]"
      >
        <ProfileScene progress={progress} anchor={anchor} />
      </div>

      <BigOutlineWord word="PROFIL" tone="line" className="bottom-4 right-0" speed={0.25} />

      <div className="container-page relative z-10 grid items-center gap-12 pb-20 pt-8 md:pt-12 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14 lg:pb-16">
        <MemberCardStage cardRef={cardRef} />

        {/* identity + stats */}
        <div data-hero="identity" className="flex min-w-0 flex-col gap-7">
          <div className="flex flex-col gap-4">
            <p data-hero="id-item" className="eyebrow flex flex-wrap items-center gap-2.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-lime shadow-glow animate-pulse-live" />
              <span>{CRUMB_ROOT}</span>
              <span aria-hidden="true">/</span>
              <span className="text-lime">{CRUMB_TIER}</span>
            </p>
            <h1
              id="profile-name"
              className="font-display text-[clamp(44px,6vw,88px)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink"
            >
              <span className="sr-only">{PROFILE.handle}</span>
              <span aria-hidden="true" className="-mb-[0.14em] flex overflow-hidden pb-[0.14em]">
                {HANDLE_CHARS.map((ch, i) => (
                  <span key={i} data-hero="char" className="inline-block">
                    {ch}
                  </span>
                ))}
              </span>
            </h1>
            <p data-hero="id-item" className="lead max-w-[520px]">
              {PROFILE.lead}
            </p>
          </div>

          <div data-hero="id-item" className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-10 items-center gap-2.5 rounded-chip border border-line bg-surface px-3.5">
              <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                {PROFILE.level.label}
              </span>
              <span className="font-mono text-[15px] font-bold text-ink">
                <PhText text={PROFILE.level.value} />
              </span>
            </span>
            <span className="inline-flex h-10 items-center rounded-chip border border-lime/50 px-3.5 font-mono text-[12px] font-bold tracking-[0.1em] text-lime">
              {PROFILE.tierBadge}
            </span>
            <Link
              href="/tournaments"
              className="inline-flex min-h-11 items-center gap-2 px-1 text-[15px] font-medium text-ink no-underline transition-colors hover:text-lime"
            >
              {PROFILE.rank.label} <PhText text={PROFILE.rank.value} />
              <IconArrowRight size={18} />
            </Link>
          </div>

          <div data-hero="id-item" className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <span
                id="xp-label"
                className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted"
              >
                {PROFILE.xp.label}
              </span>
              <span className="font-mono text-[14px] font-bold tracking-[0.04em] text-ink">
                <PhText text={PROFILE.xp.value} />
              </span>
            </div>
            <div
              role="progressbar"
              aria-labelledby="xp-label"
              aria-valuetext={PROFILE.xp.value}
              className="relative h-3.5 overflow-hidden rounded-full border border-line bg-raised"
            >
              <div
                data-hero="xp-fill"
                className="absolute inset-y-0 left-0 rounded-full bg-lime shadow-glow"
                style={{ width: XP_FILL }}
              />
              <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: XP_SEGMENTS }} />
            </div>
            <span className="font-mono text-[12px] font-medium tracking-[0.06em] text-muted">
              <PhText text={PROFILE.xp.left} />
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3">
            {PROFILE.stats.map((stat, i) => {
              const Icon = STAT_ICONS[i % STAT_ICONS.length];
              return (
                <div
                  key={stat.label}
                  data-hero="stat"
                  className="flex flex-col gap-2 rounded-card border border-line bg-surface px-4 py-4 sm:px-5"
                >
                  <dt className="flex items-start justify-between gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                    <span className="min-w-0">{stat.label}</span>
                    <Icon className="shrink-0 text-lime" />
                  </dt>
                  <dd className="font-mono text-[24px] font-bold leading-[1.15] tracking-[0.02em] text-[#C9CEDB] sm:text-[28px]">
                    <PhText text={stat.value} />
                  </dd>
                </div>
              );
            })}
          </dl>

          <div data-hero="id-item" className="flex flex-wrap items-center gap-3">
            <ButtonLink href={BOOKING_HREF} size="lg" iconRight={<IconArrowRight />} className="max-sm:w-full">
              {PROFILE.actions.book}
            </ButtonLink>
            <Button
              variant="secondary"
              size="lg"
              iconLeft={<IconPencil />}
              onClick={openSettings}
              aria-controls="panel-settings"
              className="max-sm:w-full"
            >
              {PROFILE.actions.edit}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
