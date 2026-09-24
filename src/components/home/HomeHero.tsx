"use client";

import dynamic from "next/dynamic";
import { Fragment, useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, PIN_PRIORITY, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { HERO, HERO_HUD, HERO_HZ_PANEL } from "@/lib/data";
import { scrollToTarget } from "@/lib/scroll-store";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ButtonLink } from "@/components/ui/Button";
import { PhText } from "@/components/ui/Placeholder";
import { IconArrowRight, IconCpu } from "@/components/ui/Icon";
import HeroSceneFallback from "./HeroSceneFallback";

/** canvas box: a stage under the copy below 1024px, full-bleed behind everything from 1024px */
const SCENE_BOX = "absolute inset-x-0 bottom-0 h-[400px] sm:h-[460px] lg:inset-y-0 lg:h-auto";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <HeroSceneFallback className={SCENE_BOX} />,
});

/** pin + heavy scrub only on large screens (the split layout fits one viewport there) */
const LG_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const SM_MOTION = "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)";

/* ---- headline split into letters (precomputed once: global index drives the intro delay) ---- */
interface TitleChar {
  ch: string;
  i: number;
}
const TITLE_LINES: TitleChar[][][] = (() => {
  let i = 0;
  return HERO.titleLines.map((line) =>
    line.split(" ").map((word) => Array.from(word).map((ch) => ({ ch, i: i++ }))),
  );
})();

const [STAT_PCS, STAT_HZ, STAT_HOURS, HUD_GPU, HUD_HALL] = HERO_HUD;
const STATS = [STAT_PCS, STAT_HZ, STAT_HOURS];

const delay = (s: number): CSSProperties => ({ animationDelay: `${+s.toFixed(3)}s` });

export default function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const pinned = useRef(false);
  const split = useMediaQuery("(min-width: 1024px)");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      // Desktop: pin the hero; scroll drives camera dolly + cube explode (3D) and flies the
      // headline letters / HUD panels up and away.
      mm.add(LG_MOTION, () => {
        pinned.current = true;
        const chars = gsap.utils.toArray<HTMLElement>(".hero-char", el);
        // set perspective up front: inside the tween vars GSAP would tween it 0 → 700 too
        gsap.set(chars, { transformPerspective: 700 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 1.1)}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: PIN_PRIORITY,
            onUpdate: (self) => {
              progress.current = self.progress;
            },
            onRefresh: (self) => {
              progress.current = self.progress;
            },
          },
        });
        tl.to(
          chars,
          {
            yPercent: (i: number) => -150 - (i % 5) * 38,
            z: (i: number) => 140 + (i % 4) * 90,
            rotationX: (i: number) => (i % 2 ? 78 : -58),
            rotationZ: (i: number) => ((i * 37) % 23) - 11,
            opacity: 0,
            duration: 0.55,
            stagger: { each: 0.018 },
          },
          0.04,
        )
          .to(".hero-fade", { y: -70, opacity: 0, duration: 0.4, stagger: 0.05 }, 0.12)
          .to(
            ".hud-fly",
            {
              y: (i: number) => -180 - i * 70,
              z: (i: number) => 180 + i * 150,
              opacity: 0,
              duration: 0.7,
            },
            0,
          )
          .to({}, { duration: 0.2 });

        // pointer tilt of the floating HUD cluster (mouse only)
        const scene = hud.current;
        let detach = () => {};
        if (scene) {
          gsap.set(scene, { rotationX: 4, rotationY: -12 });
          const rx = gsap.quickTo(scene, "rotationX", { duration: 0.8, ease: "power3" });
          const ry = gsap.quickTo(scene, "rotationY", { duration: 0.8, ease: "power3" });
          const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const px = e.clientX / window.innerWidth - 0.5;
            const py = e.clientY / window.innerHeight - 0.5;
            rx(4 - py * 14);
            ry(-12 + px * 18);
          };
          const onLeave = () => {
            rx(4);
            ry(-12);
          };
          el.addEventListener("pointermove", onMove);
          el.addEventListener("pointerleave", onLeave);
          detach = () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
          };
        }
        return () => {
          detach();
          pinned.current = false;
        };
      });

      // Mobile / tablet: no pin. The stage under the copy explodes as it scrolls through.
      mm.add(SM_MOTION, () => {
        ScrollTrigger.create({
          trigger: stage.current ?? el,
          start: "top 45%",
          end: "bottom top",
          onUpdate: (self) => {
            progress.current = self.progress;
          },
          onRefresh: (self) => {
            progress.current = self.progress;
          },
        });
        return () => {
          progress.current = 0;
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  // keyboard focus on the (possibly flown-away) copy → bring the hero back to its rest state
  const onFocusCapture = () => {
    if (pinned.current && progress.current > 0.02) scrollToTarget(0, { offset: 0 });
  };

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_900px_640px_at_72%_40%,#151824_0%,#0A0B10_72%)] lg:h-[100svh] lg:min-h-[640px]"
    >
      <HeroScene progress={progress} split={split} className={SCENE_BOX} />

      <div
        className="container-page relative z-10 flex flex-col pt-[calc(var(--header-h)+40px)] lg:h-full lg:justify-center lg:pb-8 lg:pt-[var(--header-h)]"
        onFocusCapture={onFocusCapture}
      >
        <div className="flex max-w-[760px] flex-col gap-6 lg:max-w-[600px] lg:gap-[clamp(16px,3svh,32px)] xl:max-w-[720px]">
          <div className="na-fade-up" style={delay(0.1)}>
            <p className="hero-fade eyebrow flex w-fit items-center gap-3">
              <span aria-hidden="true" className="size-2 shrink-0 rotate-45 bg-lime shadow-glow" />
              <span>
                <PhText text={HERO.eyebrow} />
              </span>
            </p>
          </div>

          <h1
            id="hero-title"
            className="font-display text-[clamp(44px,min(7.2vw,10.5svh),112px)] font-extrabold uppercase leading-[0.96] tracking-[-0.03em] text-ink"
          >
            <span className="sr-only">{HERO.titleLines.join(" ")}</span>
            <span aria-hidden="true" className="block">
              {TITLE_LINES.map((words, li) => (
                <span key={li} className={cn("block", li === TITLE_LINES.length - 1 && "text-lime text-shadow-glow")}>
                  {words.map((chars, wi) => (
                    <Fragment key={wi}>
                      <span className="inline-block whitespace-nowrap">
                        {chars.map(({ ch, i }) => (
                          <span key={i} className="hero-char inline-block">
                            <span className="na-char-in inline-block origin-[50%_100%]" style={delay(0.2 + i * 0.035)}>
                              {ch}
                            </span>
                          </span>
                        ))}
                      </span>
                      {wi < words.length - 1 ? " " : null}
                    </Fragment>
                  ))}
                </span>
              ))}
            </span>
          </h1>

          <div className="na-fade-up" style={delay(0.55)}>
            <p className="hero-fade max-w-[560px] text-[17px] leading-[1.55] text-muted md:text-[19px]">
              <PhText text={HERO.lead} />
            </p>
          </div>

          <div className="na-fade-up" style={delay(0.7)}>
            <div className="hero-fade flex flex-wrap items-center gap-4">
              <ButtonLink href={HERO.primaryCta.href} size="lg" iconRight={<IconArrowRight />}>
                {HERO.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={HERO.secondaryCta.href} size="lg" variant="secondary">
                {HERO.secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          <div className="na-fade-up" style={delay(0.85)}>
            <dl className="hero-fade grid max-w-[600px] grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-3 lg:max-w-[500px] xl:max-w-[600px]">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-1.5">
                  <dt className="text-[14px] leading-[1.4] text-muted">{s.label}</dt>
                  <dd className="font-mono text-[18px] font-bold leading-[1.3] text-ink">
                    <PhText text={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* HUD read-outs as plain cards below 1024px (the 3D cluster takes over from lg) */}
        <ul className="mt-10 grid gap-3 sm:grid-cols-3 lg:hidden">
          <li>
            <HudCard>
              <GpuPanel />
            </HudCard>
          </li>
          <li>
            <HudCard>
              <HzPanel />
            </HudCard>
          </li>
          <li>
            <HudCard>
              <HallPanel />
            </HudCard>
          </li>
        </ul>

        {/* stage for the canvas under the copy (mobile / tablet) */}
        <div ref={stage} aria-hidden="true" className="h-[400px] sm:h-[460px] lg:hidden" />
      </div>

      {/* 3D HUD cluster floating around the WebGL cube (≥1024px) */}
      <div className="pointer-events-none absolute right-0 top-1/2 z-10 hidden h-[560px] w-[440px] -translate-y-[44%] [perspective:1100px] lg:block xl:right-[3%] xl:h-[620px] xl:w-[600px]">
        <span aria-hidden="true" className="absolute left-0 top-0 size-7 border-l border-t border-lime/70" />
        <span aria-hidden="true" className="absolute bottom-0 right-0 size-7 border-b border-r border-lime/70" />
        <div ref={hud} className="relative size-full [transform-style:preserve-3d]" style={{ transform: "rotateX(4deg) rotateY(-12deg)" }}>
          <HudFloat left="0%" top="12%" width={236} z={120} intro={1.0} float={6} floatDelay={0}>
            <GpuPanel corner="tl" />
          </HudFloat>
          <HudFloat right="5%" top="44%" width={250} z={200} intro={1.15} float={7} floatDelay={-2.5}>
            <HzPanel corner="br" />
          </HudFloat>
          <HudFloat left="14%" top="80%" width={270} z={70} intro={1.3} float={5.5} floatDelay={-1.2}>
            <HallPanel />
          </HudFloat>
        </div>
      </div>

      {/* soft floor fade into the next section */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-linear-to-b from-transparent to-ground" />
    </section>
  );
}

/* ------------------------------------------------------------------ */

interface HudFloatProps {
  left?: string;
  right?: string;
  top: string;
  width: number;
  /** translateZ depth (px) */
  z: number;
  /** intro delay (s) */
  intro: number;
  /** float period (s) */
  float: number;
  floatDelay: number;
  children: ReactNode;
}

/** position (static Z) → GSAP scroll layer (.hud-fly) → CSS float (time) → panel */
function HudFloat({ left, right, top, width, z, intro, float, floatDelay, children }: HudFloatProps) {
  return (
    <div
      className="na-fade-up absolute [transform-style:preserve-3d]"
      style={{ left, right, top, width, transform: `translateZ(${z}px)`, ...delay(intro) }}
    >
      <div className="hud-fly [transform-style:preserve-3d]">
        <div className="animate-float" style={{ animationDuration: `${float}s`, animationDelay: `${floatDelay}s` }}>
          <div className="relative flex flex-col gap-2.5 rounded-card border border-line bg-surface/92 px-[18px] py-4 shadow-[0_24px_48px_rgba(0,0,0,.5)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function HudCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-full flex-col gap-2 rounded-card border border-line bg-surface/90 px-4 py-4">
      {children}
    </div>
  );
}

function Corner({ at }: { at: "tl" | "br" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute size-4 border-lime",
        at === "tl" ? "-left-px -top-px rounded-tl-card border-l-2 border-t-2" : "-bottom-px -right-px rounded-br-card border-b-2 border-r-2",
      )}
    />
  );
}

const hudLabel = "font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted";

function GpuPanel({ corner }: { corner?: "tl" }) {
  return (
    <>
      {corner ? <Corner at={corner} /> : null}
      <p className={cn(hudLabel, "flex items-center justify-between gap-3")}>
        <span>{HUD_GPU.label}</span>
        <IconCpu className="text-lime" />
      </p>
      <p className="font-mono text-[17px] font-bold leading-[1.3] text-ink">
        <PhText text={HUD_GPU.value} chipClassName="text-[15px] font-bold text-ink" />
      </p>
      <div aria-hidden="true" className="h-1 rounded-sm bg-[repeating-linear-gradient(90deg,rgba(196,248,42,.7)_0_10px,transparent_10px_14px)]" />
    </>
  );
}

function HzPanel({ corner }: { corner?: "br" }) {
  return (
    <>
      {corner ? <Corner at={corner} /> : null}
      <p className={hudLabel}>{HERO_HZ_PANEL.label}</p>
      <p className="flex items-baseline gap-2">
        <span className="font-mono text-[20px] font-bold leading-[1.2] text-ink">
          <PhText text={HERO_HZ_PANEL.value} chipClassName="text-[17px] font-bold text-ink" />
        </span>
        <span className="font-display text-[18px] font-bold leading-none text-lime">{HERO_HZ_PANEL.unit}</span>
      </p>
    </>
  );
}

function HallPanel() {
  return (
    <>
      <p className={hudLabel}>{HUD_HALL.label}</p>
      <p className="flex items-center gap-2.5 text-[16px] font-semibold leading-[1.3] text-ink">
        <span aria-hidden="true" className="size-2.5 shrink-0 animate-pulse-live rounded-full bg-lime shadow-glow" />
        <span>
          <PhText text={HUD_HALL.value} />
        </span>
      </p>
    </>
  );
}
