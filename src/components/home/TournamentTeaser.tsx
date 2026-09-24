"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { NEXT_TOURNAMENT } from "@/lib/data";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import Tilt from "@/components/motion/Tilt";
import { ButtonLink } from "@/components/ui/Button";
import { PhText } from "@/components/ui/Placeholder";
import { IconArrowRight, IconTrophy } from "@/components/ui/Icon";
import { EXTRUDE_LAYERS, lime } from "./content";

const LAYERS = Array.from({ length: EXTRUDE_LAYERS }, (_, li) => li);
/** base depth of layer li (px): front layer at +60, each next one 12px deeper */
const depth = (li: number) => 60 - li * 12;

/**
 * KEYINGI TURNIR — a layered 3D card. On desktop the whole card swings through the viewport
 * (scrubbed) while its layers separate in depth: the extruded "5V5" slices fan apart, the
 * trophy comes forward, the dashed ring drops back. The slices keep floating on a timer ("4D").
 */
export default function TournamentTeaser() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
        tl.fromTo(card.current, { rotationX: 26, rotationY: -14, y: 110, z: -90 }, { rotationX: -8, rotationY: 7, y: -50, z: 0 }, 0)
          .fromTo(".cup-layer", { z: (i: number) => depth(i) * 0.3 }, { z: (i: number) => depth(i) * 2.8 - i * 8 }, 0)
          .fromTo(".cup-trophy", { z: 20, rotationY: -35 }, { z: 170, rotationY: 25 }, 0)
          .fromTo(".cup-ring", { z: -140, scale: 0.8 }, { z: 10, scale: 1.12 }, 0);
      });
      mm.add(MQ.mobile, () => {
        gsap.set(card.current, { transformPerspective: 1200 });
        gsap.from(card.current, {
          opacity: 0,
          y: 60,
          rotationX: 16,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: card.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="cup-title" className="relative isolate overflow-hidden pb-20 pt-8 md:pb-28 xl:pb-[112px]">
      <BigOutlineWord word="TURNIR" className="left-0 top-2" speed={0.4} />

      <div className="container-page relative z-10">
        <div className="[perspective:1600px] [perspective-origin:50%_0%]">
          <div ref={card} className="[transform-style:preserve-3d]" style={{ transform: "rotateX(7deg) rotateY(-4deg)" }}>
            <Tilt
              as="article"
              max={5}
              scale={1.01}
              className="flex flex-col rounded-card border border-line bg-surface shadow-[0_60px_120px_rgba(0,0,0,.6)] lg:min-h-[440px] lg:flex-row"
            >
              <span aria-hidden="true" className="absolute -left-px -top-px size-7 rounded-tl-card border-l-2 border-t-2 border-lime" />
              <span aria-hidden="true" className="absolute -bottom-px -right-px size-7 rounded-br-card border-b-2 border-r-2 border-lime" />

              {/* copy layer */}
              <div className="flex min-w-0 flex-1 flex-col justify-between gap-8 p-6 [transform:translateZ(24px)] sm:p-8 lg:px-12 lg:py-12 xl:px-14">
                <div className="flex flex-col gap-4">
                  <p className="flex items-center gap-2.5 font-mono text-[13px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-lime">
                    <span aria-hidden="true" className="size-2 shrink-0 rotate-45 bg-lime" />
                    {NEXT_TOURNAMENT.eyebrow}
                  </p>
                  <h2
                    id="cup-title"
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 font-display text-[clamp(34px,5vw,64px)] font-extrabold uppercase leading-none tracking-[-0.03em] text-ink"
                  >
                    <span>{NEXT_TOURNAMENT.name}</span>
                    <PhText text={NEXT_TOURNAMENT.namePh} chipClassName="px-3 py-1 text-[clamp(20px,2.4vw,34px)] font-bold tracking-[0.02em]" />
                  </h2>
                  <p className="max-w-[560px] text-[17px] leading-[1.55] text-muted">{NEXT_TOURNAMENT.lead}</p>
                </div>

                <dl className="grid grid-cols-2 gap-6 border-y border-line py-5 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {NEXT_TOURNAMENT.facts.map((f) => (
                    <div key={f.label} className="flex flex-col gap-1.5">
                      <dt className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">{f.label}</dt>
                      <dd className="text-[17px] font-semibold leading-[1.4] text-ink">
                        <PhText text={f.value} chipClassName="text-[14px] font-medium" />
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="flex flex-col gap-2">
                    <p className="text-[15px] leading-[1.4] text-muted">
                      <PhText text={NEXT_TOURNAMENT.teams} chipClassName="text-[14px]" />
                    </p>
                    <div
                      aria-hidden="true"
                      className="h-3 w-64 max-w-full rounded-[3px] border border-[#363C50] bg-[repeating-linear-gradient(90deg,transparent_0_15px,#363C50_15px_16px)]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <ButtonLink href="/turnirlar" variant="secondary">
                      {NEXT_TOURNAMENT.allCta}
                    </ButtonLink>
                    <ButtonLink href="/turnirlar" iconRight={<IconArrowRight />}>
                      {NEXT_TOURNAMENT.registerCta}
                    </ButtonLink>
                  </div>
                </div>
              </div>

              {/* depth art: extruded 5V5 + ring + trophy */}
              <div
                aria-hidden="true"
                className="relative h-[260px] shrink-0 border-t border-line [transform-style:preserve-3d] sm:h-[300px] lg:h-auto lg:w-[420px] lg:border-l lg:border-t-0"
              >
                <div
                  className="cup-ring na-spin-slow absolute left-1/2 top-1/2 -ml-[110px] -mt-[110px] size-[220px] rounded-full border border-dashed lg:-ml-40 lg:-mt-40 lg:size-80"
                  style={{ borderColor: lime(0.35), transform: "translateZ(-30px)" }}
                />
                <div className="absolute inset-0 animate-float [transform-style:preserve-3d]">
                  {LAYERS.map((li) => (
                    <p
                      key={li}
                      className="cup-layer absolute inset-0 m-0 flex items-center justify-center font-display text-[clamp(88px,11vw,132px)] font-extrabold leading-none tracking-[-0.04em] text-transparent"
                      style={{
                        transform: `translateZ(${depth(li)}px)`,
                        WebkitTextStroke: li === 0 ? "2px #C4F82A" : `1px ${lime(Math.max(0.08, 0.55 - li * 0.08))}`,
                        textShadow: li === 0 ? `0 0 30px ${lime(0.3)}` : undefined,
                      }}
                    >
                      5V5
                    </p>
                  ))}
                </div>
                <div className="cup-trophy absolute bottom-6 right-6 size-[84px] text-lime lg:bottom-8 lg:right-9" style={{ transform: "translateZ(90px)" }}>
                  <IconTrophy size={84} strokeWidth={0.8} />
                </div>
              </div>
            </Tilt>
          </div>
        </div>
      </div>
    </section>
  );
}
