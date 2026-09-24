"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { gsap, MQ, EASE, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import {
  BOARD_TABS,
  LEADERBOARDS,
  LEADERBOARD_SECTION,
  POINT_RULES,
  TREND_LABEL,
  type BoardId,
  type Trend,
} from "@/lib/data";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import { IconArrowDown, IconArrowUp, IconTrendSame } from "@/components/ui/Icon";
import { PhText } from "@/components/ui/Placeholder";
import NumberedHeading from "./NumberedHeading";
import PointsCube from "./PointsCube";
import { DecoCross, DecoRing } from "./Deco";

const S = LEADERBOARD_SECTION;

const TREND_ICON: Record<Trend, typeof IconArrowUp> = {
  up: IconArrowUp,
  down: IconArrowDown,
  same: IconTrendSame,
};
const TREND_COLOR: Record<Trend, string> = { up: "text-lime", down: "text-muted", same: "text-dim" };

/** column alignment / widths, in LEADERBOARD_SECTION.columns order */
const COL_CLASS = ["w-16 text-left", "text-left", "text-left", "w-[120px] text-right", "w-[120px] text-right", "w-32 text-right"];

export default function Leaderboard() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const revealed = useRef(false);
  const [board, setBoard] = useState<BoardId>("umumiy");
  const data = LEADERBOARDS[board];

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = BOARD_TABS.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    setBoard(BOARD_TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  /* the table panel swings up out of a 3D tilt as it enters (desktop, scrubbed) */
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => {
        gsap.set(panel, { transformPerspective: 1400, transformOrigin: "50% 0%" });
        gsap.from(panel, {
          rotationX: 16,
          y: 90,
          ease: EASE.none,
          scrollTrigger: { trigger: panel, start: "top bottom", end: "top 40%", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  /* rows slide in from alternating sides: on first scroll-in, then on every board switch */
  useGSAP(
    () => {
      const tbody = tbodyRef.current;
      if (!tbody) return;
      const rows = gsap.utils.toArray<HTMLElement>("[data-lb-row]", tbody);
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion || rows.length === 0) return;
        const d = mobile ? 40 : 140;
        const side = (i: number) => (i % 2 ? 1 : -1);
        const persp = { transformPerspective: 1400, transformOrigin: "50% 50%" };
        const settled = { opacity: 1, x: 0, rotationY: 0 };

        if (!revealed.current) {
          gsap.fromTo(
            rows,
            { opacity: 0, x: (i: number) => side(i) * d, rotationY: (i: number) => (mobile ? 0 : -side(i) * 20), ...persp },
            {
              ...settled,
              duration: 1,
              ease: EASE.expo,
              stagger: 0.07,
              scrollTrigger: {
                trigger: tbody,
                start: "top 85%",
                once: true,
                onEnter: () => {
                  revealed.current = true;
                },
              },
            },
          );
        } else {
          gsap.fromTo(
            rows,
            { opacity: 0, x: (i: number) => side(i) * d * 0.45, rotationY: 0, ...persp },
            { ...settled, duration: 0.6, ease: EASE.out, stagger: 0.035 },
          );
        }
      });
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [board], revertOnUpdate: true },
  );

  return (
    <section
      ref={sectionRef}
      id="reyting"
      aria-labelledby="board-title"
      className="section-y relative isolate overflow-hidden border-t border-line bg-ground-2"
    >
      <BigOutlineWord word="REYTING" className="top-6 left-0" speed={0.3} tone="line" />
      <DecoCross className="left-[44%] top-20" speed={0.3} rotate={25} />
      <DecoRing className="-right-10 bottom-[18%]" speed={-0.2} rotate={-30} size={220} />

      <div className="container-page relative z-10 flex flex-col gap-12">
        <NumberedHeading
          id="board-title"
          eyebrow={S.eyebrow}
          title={S.title}
          aside={
            <>
              <div
                role="tablist"
                aria-label="Reyting turi"
                className="flex w-fit gap-1 rounded-[12px] border border-line bg-ground p-1"
              >
                {BOARD_TABS.map((tab, i) => {
                  const on = tab.id === board;
                  return (
                    <button
                      key={tab.id}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`board-tab-${tab.id}`}
                      aria-selected={on}
                      aria-controls="board-panel"
                      tabIndex={on ? 0 : -1}
                      onClick={() => setBoard(tab.id)}
                      onKeyDown={(e) => onTabKey(e, i)}
                      className={cn(
                        "h-11 min-w-24 rounded-lg px-5 text-[14px] font-medium transition-[background-color,color] duration-200",
                        on ? "bg-panel text-ink shadow-[inset_0_-2px_0_#C4F82A]" : "bg-transparent text-muted hover:text-ink",
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <p className="eyebrow">
                <PhText text={S.updated} />
              </p>
            </>
          }
        />

        <div className="flex flex-col gap-12 xl:flex-row xl:items-start">
          {/* points system */}
          <Reveal
            as="aside"
            variant="left"
            aria-labelledby="points-title"
            className="flex flex-col gap-6 xl:order-first xl:w-[320px] xl:shrink-0"
          >
            <div
              aria-hidden="true"
              className="relative h-[200px] overflow-hidden rounded-card border border-line bg-surface"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(196,248,42,.05) 0px, rgba(196,248,42,.05) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(196,248,42,.05) 0px, rgba(196,248,42,.05) 1px, transparent 1px, transparent 24px)",
              }}
            >
              <Parallax speed={0.12} className="absolute left-1/2 top-14 -ml-11 [perspective:900px]">
                <PointsCube />
              </Parallax>
              <span className="absolute bottom-3.5 left-4 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                {POINT_RULES.eyebrow}
              </span>
            </div>
            <h3 id="points-title" className="display-sm text-ink">
              {POINT_RULES.title}
            </h3>
            <ul className="flex flex-col">
              {POINT_RULES.items.map((it) => (
                <li
                  key={it.label}
                  className="flex min-h-12 items-center justify-between gap-4 border-b border-line text-[15px] text-ink"
                >
                  {it.label}
                  <span className="font-mono text-[14px] text-muted">
                    <PhText text={it.value} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[15px] leading-relaxed text-muted">
              <PhText text={POINT_RULES.note} />
            </p>
          </Reveal>

          {/* season table */}
          <div ref={panelRef} className="relative order-first min-w-0 flex-1 xl:order-none">
            <Parallax
              aria-hidden="true"
              speed={0.05}
              className="pointer-events-none absolute -bottom-3.5 -right-3.5 left-3.5 top-3.5 hidden rounded-card border border-lime/30 sm:block"
            />
            <div className="relative flex flex-col gap-4 rounded-card border border-line bg-surface px-3 pb-5 pt-2 shadow-[0_24px_60px_rgba(0,0,0,.45)] sm:px-6">
              <div
                role="tabpanel"
                id="board-panel"
                aria-labelledby={`board-tab-${board}`}
                tabIndex={0}
                className="overflow-x-auto rounded-lg md:overflow-visible"
              >
                <table className="w-full min-w-[600px] border-collapse text-[15px]">
                  <caption className="sr-only">{S.caption.replace("{board}", data.label)}</caption>
                  <thead>
                    <tr>
                      {S.columns.map((c, i) => (
                        <th
                          key={c}
                          scope="col"
                          className={cn(
                            "h-[52px] border-b border-line px-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted",
                            COL_CLASS[i],
                          )}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody ref={tbodyRef}>
                    {data.rows.map((r, i) => {
                      const top = r.rank <= 3;
                      const cell = cn("px-2", i < data.rows.length - 1 && "border-b border-[#1C1F2A]");
                      const TrendIcon = TREND_ICON[r.trend];
                      return (
                        <tr key={`${board}-${r.rank}`} data-lb-row className="transition-colors duration-200 hover:bg-raised/60">
                          <td className={cn(cell, "h-16")}>
                            <span
                              className={cn(
                                "inline-flex size-9 items-center justify-center rounded-lg border font-mono text-[14px] font-bold",
                                top ? "border-lime bg-lime text-ground" : "border-line bg-transparent text-muted",
                                r.rank === 1 && "shadow-glow",
                              )}
                            >
                              {r.rank}
                            </span>
                          </td>
                          <th scope="row" className={cn(cell, "text-left font-normal")}>
                            <span className="flex items-center gap-3">
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "grid size-9 shrink-0 place-items-center rounded-full border bg-raised font-mono text-[11px] font-bold text-ink",
                                  top ? "border-lime/30" : "border-line",
                                )}
                              >
                                {r.initials}
                              </span>
                              <span className={cn("text-ink", top ? "font-semibold" : "font-medium")}>{r.handle}</span>
                            </span>
                          </th>
                          <td className={cn(cell, "text-muted")}>{r.game}</td>
                          <td className={cn(cell, "text-right font-mono text-[14px] text-muted")}>
                            <PhText text={r.wins} />
                          </td>
                          <td className={cn(cell, "text-right font-mono text-[14px] font-bold text-muted")}>
                            <PhText text={r.points} />
                          </td>
                          <td className={cn(cell, "text-right")}>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 font-mono text-[14px]",
                                TREND_COLOR[r.trend],
                              )}
                            >
                              <TrendIcon size={18} />
                              <span className="sr-only">{TREND_LABEL[r.trend]}</span>
                              {r.trend === "same" ? <span aria-hidden="true">{r.delta}</span> : <PhText text={r.delta} />}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="px-2 font-mono text-[13px] font-medium uppercase tracking-[0.06em] text-muted">
                {S.footnote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
