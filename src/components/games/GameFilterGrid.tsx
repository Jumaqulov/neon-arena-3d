"use client";

import { useEffect, useMemo, useRef, useState, type FocusEvent } from "react";
import { ALL_LABEL, GENRES, getGame, type Game, type GameSlug } from "@/lib/data";
import { cn } from "@/lib/cn";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import GameCard from "./GameCard";
import { genreCounts, type GenreFilter } from "./gameArt";
import { onGenreRequest } from "./genreBus";

const FILTERS: readonly GenreFilter[] = ["all", ...GENRES];

export interface GameFilterGridProps {
  /** games to list (resolved from data on the client) */
  slugs: readonly GameSlug[];
  /** follow genre requests from the breadcrumb / hero chips (genreBus). Default false. */
  listen?: boolean;
}

/**
 * Genre filter pills (aria-pressed) + live count + 3D card grid.
 * Cards flip in staggered as rows enter the viewport, and flip in again on every filter change.
 */
export default function GameFilterGrid({ slugs, listen = false }: GameFilterGridProps) {
  const games = useMemo(() => slugs.map((s) => getGame(s)).filter((g): g is Game => !!g), [slugs]);
  const counts = useMemo(() => genreCounts(games), [games]);
  const [genre, setGenre] = useState<GenreFilter>("all");
  const visible = genre === "all" ? games : games.filter((g) => g.genre === genre);

  const rootRef = useRef<HTMLDivElement>(null);
  const prevGenre = useRef<GenreFilter>(genre);

  useEffect(() => {
    if (!listen) return;
    return onGenreRequest((g) => setGenre(g));
  }, [listen]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const changed = prevGenre.current !== genre;
      prevGenre.current = genre;
      if (changed) ScrollTrigger.refresh();

      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);
        if (!cards.length) return;
        const f = mobile ? 0.5 : 1;
        // opacity (not autoAlpha): cards are links — they must stay in the tab order and the
        // accessibility tree while waiting for their scroll-triggered entrance.
        const from = {
          opacity: 0,
          y: 80 * f,
          z: -220 * f,
          rotationY: -38 * f,
          transformPerspective: 1200,
          transformOrigin: "50% 100%",
        };
        const to = { opacity: 1, y: 0, z: 0, rotationY: 0, ease: "expo.out", overwrite: true };

        if (changed) {
          gsap.fromTo(cards, from, { ...to, duration: 0.85, stagger: 0.06 });
        } else {
          gsap.set(cards, from);
          ScrollTrigger.batch(cards, {
            start: "top 90%",
            once: true,
            onEnter: (batch) => gsap.to(batch, { ...to, duration: 1.1, stagger: 0.09 }),
          });
        }
      });
      return () => mm.revert();
    },
    // revertOnUpdate: each genre change tears down the previous matchMedia / batch triggers
    // instead of stacking them (old triggers would keep tweening removed <li>s).
    { scope: rootRef, dependencies: [genre], revertOnUpdate: true },
  );

  // A card focused by keyboard before its batch fired must never stay transparent.
  const onFocusCapture = (e: FocusEvent<HTMLUListElement>) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    if (card && Number(getComputedStyle(card).opacity) < 1) {
      gsap.to(card, { opacity: 1, y: 0, z: 0, rotationY: 0, duration: 0.4, ease: "expo.out", overwrite: true });
    }
  };

  const countLabel = `${genre === "all" ? "Barcha janrlar" : genre} · ${visible.length} ta o‘yin`;

  return (
    <div ref={rootRef} className="flex flex-col gap-8 md:gap-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div role="group" aria-label="Janr bo‘yicha saralash" className="flex flex-wrap gap-2.5 sm:gap-3">
          {FILTERS.map((id) => {
            const on = genre === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setGenre(id)}
                className={cn(
                  "inline-flex h-11 items-center gap-2.5 rounded-btn border px-4 text-[15px] font-medium transition-[filter,border-color,background-color,color] duration-200 hover:brightness-110 sm:h-12 sm:px-5",
                  on ? "border-lime bg-lime text-ground" : "border-line bg-surface text-ink hover:border-dim",
                )}
              >
                {id === "all" ? ALL_LABEL : id}
                <span
                  className={cn(
                    "font-mono text-[12px] font-bold tracking-[0.04em]",
                    on ? "text-ground" : "text-muted",
                  )}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="font-mono text-[13px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">
          {countLabel}
        </p>
      </div>

      {visible.length ? (
        <ul onFocusCapture={onFocusCapture} className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((g) => (
            <li key={g.slug} data-card className="@container">
              <GameCard game={g} />
            </li>
          ))}
        </ul>
      ) : (
        <p
          role="status"
          className="rounded-card border border-dashed border-line-strong p-8 text-center text-[17px] leading-[1.55] text-muted md:p-12"
        >
          Bu janrda hozircha o‘yin yo‘q. Boshqa janrni tanlang yoki «{ALL_LABEL}» tugmasini bosing.
        </p>
      )}
    </div>
  );
}
