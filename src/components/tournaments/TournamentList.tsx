"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { gsap, MQ, EASE, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import {
  TOURNAMENTS,
  TOURNAMENTS_PAGE,
  TOURNAMENT_GAME_FILTERS,
  TOURNAMENT_STATUS_FILTERS,
  type GameSlug,
  type TournamentStatus,
} from "@/lib/data";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import NumberedHeading from "./NumberedHeading";
import TournamentCard from "./TournamentCard";
import { DecoCross, DecoCube, DecoRing } from "./Deco";

const L = TOURNAMENTS_PAGE;

type GameFilter = "all" | GameSlug;
type StatusFilter = "all" | TournamentStatus;

const [COUNT_BEFORE, COUNT_AFTER] = L.resultCount.split("{n}");

export default function TournamentList() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const revealed = useRef(false);
  const mounted = useRef(false);

  const [game, setGame] = useState<GameFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [registered, setRegistered] = useState<Record<string, boolean>>({});

  const list = useMemo(
    () =>
      TOURNAMENTS.filter(
        (t) => (game === "all" || t.game === game) && (status === "all" || t.status === status),
      ),
    [game, status],
  );
  const filterKey = `${game}|${status}`;

  const toggle = useCallback((id: string) => {
    setRegistered((r) => ({ ...r, [id]: !r[id] }));
  }, []);

  // the reset button disappears with the empty state: hand focus to the first filter
  const firstPillRef = useRef<HTMLButtonElement>(null);
  const reset = () => {
    setGame("all");
    setStatus("all");
    requestAnimationFrame(() => firstPillRef.current?.focus());
  };

  /* cards flip in: first on scroll (staggered), then on every filter change */
  useGSAP(
    () => {
      const grid = gridRef.current;
      const section = sectionRef.current;
      const mm = gsap.matchMedia();

      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;

        if (grid) {
          const items = gsap.utils.toArray<HTMLElement>("[data-tcard]", grid);
          const bars = gsap.utils.toArray<HTMLElement>("[data-fill]", grid);
          if (items.length) {
            const persp = { transformPerspective: 1200, transformOrigin: "50% 100%" };
            const settled = { opacity: 1, x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0 };

            if (!revealed.current) {
              const from = mobile
                ? { opacity: 0, y: 48, rotationX: 22 }
                : { opacity: 0, y: 80, z: -220, rotationY: -38 };
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: grid,
                    start: "top 85%",
                    once: true,
                    onEnter: () => {
                      revealed.current = true;
                    },
                  },
                })
                .fromTo(
                  items,
                  { ...from, ...persp },
                  { ...settled, duration: 1.1, ease: EASE.expo, stagger: mobile ? 0.08 : 0.1 },
                )
                .fromTo(
                  bars,
                  { scaleX: 0, transformOrigin: "0% 50%" },
                  { scaleX: 1, duration: 1, ease: EASE.out, stagger: 0.1 },
                  0.35,
                );
            } else {
              // filter change: quick card-flip of the new set
              gsap.fromTo(
                items,
                mobile
                  ? { opacity: 0, y: 24, rotationX: 16, ...persp }
                  : { opacity: 0, y: 24, rotationY: -70, ...persp, transformOrigin: "50% 50%" },
                { ...settled, duration: 0.75, ease: EASE.out, stagger: 0.06 },
              );
              gsap.fromTo(
                bars,
                { scaleX: 0, transformOrigin: "0% 50%" },
                { scaleX: 1, duration: 0.8, delay: 0.2, ease: EASE.out, stagger: 0.06 },
              );
            }
          }
        }

        const empty = section?.querySelector("[data-empty]");
        if (empty && revealed.current) {
          gsap.from(empty, { opacity: 0, scale: 0.94, y: 24, duration: 0.6, ease: EASE.out });
        }
      });

      // the list height changed: re-measure every ScrollTrigger below it
      if (mounted.current) gsap.delayedCall(0.05, () => ScrollTrigger.refresh());
      mounted.current = true;

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [filterKey], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      id="list"
      aria-labelledby="list-title"
      className="section-y relative isolate overflow-hidden border-t border-line"
    >
      <BigOutlineWord word="TURNIR" className="-top-2 right-0" speed={-0.3} />
      <DecoRing className="left-[4%] top-[34%]" speed={0.35} rotate={40} size={160} />
      <DecoCross className="right-[6%] top-[58%]" speed={-0.25} rotate={-20} />
      <DecoCube className="bottom-[10%] left-[46%]" speed={0.6} size={48} />

      <div className="container-page relative z-10 flex flex-col gap-8">
        <NumberedHeading
          id="list-title"
          eyebrow={L.listEyebrow}
          title={L.listTitle}
          aside={
            <>
              <p className="text-[17px] leading-relaxed text-muted">{L.listLead}</p>
              <p aria-live="polite" className="eyebrow">
                {COUNT_BEFORE}
                <span className="text-ink">{list.length}</span>
                {COUNT_AFTER}
              </p>
            </>
          }
        />

        {/* filters */}
        <Reveal
          variant="zoom"
          className="flex flex-col gap-3 rounded-card border border-line bg-surface p-3 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
        >
          <div role="group" aria-label="O‘yin bo‘yicha saralash" className="flex flex-wrap gap-2">
            {TOURNAMENT_GAME_FILTERS.map((g, i) => {
              const on = game === g.id;
              return (
                <button
                  key={g.id}
                  ref={i === 0 ? firstPillRef : undefined}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGame(g.id)}
                  className={cn(
                    "h-11 rounded-btn border px-[18px] text-[14px] font-medium transition-[background-color,color,border-color] duration-200",
                    on
                      ? "border-lime bg-lime text-ground"
                      : "border-line bg-transparent text-muted hover:border-line-strong hover:text-ink",
                  )}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Holat bo‘yicha saralash"
            className="grid grid-cols-2 gap-1 rounded-[12px] border border-line bg-ground p-1 sm:flex"
          >
            {TOURNAMENT_STATUS_FILTERS.map((s) => {
              const on = status === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setStatus(s.id)}
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-[18px] text-[14px] font-medium transition-[background-color,color] duration-200",
                    on ? "bg-panel text-ink shadow-[inset_0_-2px_0_#C4F82A]" : "bg-transparent text-muted hover:text-ink",
                  )}
                >
                  {s.id === "jonli" ? (
                    <span aria-hidden="true" className="size-[7px] rounded-full bg-live animate-pulse-live" />
                  ) : null}
                  {s.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* cards */}
        {list.length > 0 ? (
          <ul ref={gridRef} role="list" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => (
              <li key={t.id} data-tcard className="flex">
                <TournamentCard t={t} registered={!!registered[t.id]} onToggle={toggle} />
              </li>
            ))}
          </ul>
        ) : (
          <div
            data-empty
            className="flex flex-col items-center gap-4 rounded-card border border-dashed border-line px-6 py-[72px] text-center"
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 32 32"
              fill="none"
              stroke="#7C8397"
              strokeWidth="1.75"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M16 3 L28 10 L28 22 L16 29 L4 22 L4 10 Z" />
              <path d="M4 10 L16 17 L28 10" />
              <path d="M16 17 L16 29" />
            </svg>
            <p className="font-display text-[22px] font-bold text-ink">{L.emptyTitle}</p>
            <p className="max-w-[460px] text-[16px] leading-relaxed text-muted">{L.emptyText}</p>
            <Button variant="secondary" onClick={reset}>
              {L.resetFilters}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
