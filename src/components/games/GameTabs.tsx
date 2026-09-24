"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { BOOKING_HREF, GAME_FEATURES, GAME_SPECS, GAME_TABS, GAMES, getGame, type GameSlug } from "@/lib/data";
import { cn } from "@/lib/cn";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ButtonLink } from "@/components/ui/Button";
import { PhText, Placeholder } from "@/components/ui/Placeholder";
import { IconArrowRight } from "@/components/ui/Icon";
import Tilt from "@/components/motion/Tilt";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import { CssHoloCube } from "@/components/three/fallbacks";
import GameSectionHeading from "./GameSectionHeading";
import { cupRows } from "./gameArt";

type TabId = (typeof GAME_TABS)[number]["id"];

const MONO_LABEL = "font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted";

/** Feature icons from the mockup (refresh / mouse / team). */
const FEATURE_ICONS: readonly ReactNode[] = [
  <>
    <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" />
    <path d="M4 4v4h4" />
    <path d="M4 13a8 8 0 0 0 14.3 4.9L20 16" />
    <path d="M20 20v-4h-4" />
  </>,
  <>
    <rect x="6" y="3" width="12" height="18" rx="6" />
    <path d="M12 3v7" />
    <path d="M6 10h12" />
  </>,
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
    <path d="M15.5 4.6a3.5 3.5 0 0 1 0 6.8" />
    <path d="M17.5 14.3c2.4.6 4 2.7 4 5.7" />
  </>,
];

/**
 * "Kelishdan oldin bilib oling": tabs Klubda / Talablar / Turnirlar (roles + roving tabindex +
 * Arrow/Home/End). The active panel flips in on first view and zooms in on every tab change.
 */
export default function GameTabs({ slug }: { slug: GameSlug }) {
  const game = getGame(slug) ?? GAMES[0];
  const [tab, setTab] = useState<TabId>("klub");
  const rootRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const prevTab = useRef<TabId>(tab);
  const cups = cupRows(game);

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = GAME_TABS.length;
    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = (i + 1) % n;
        break;
      case "ArrowLeft":
        next = (i - 1 + n) % n;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = n - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setTab(GAME_TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const changed = prevTab.current !== tab;
      prevTab.current = tab;
      if (changed) ScrollTrigger.refresh();
      const panel = root.querySelector<HTMLElement>(`#panel-${tab}`);
      if (!panel) return;

      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, mobile: MQ.mobile }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean };
        if (!motion) return;
        const items = gsap.utils.toArray<HTMLElement>(panel.querySelectorAll("[data-anim]"));
        if (!items.length) return;
        const f = mobile ? 0.5 : 1;
        if (changed) {
          gsap.fromTo(
            items,
            { opacity: 0, y: 40 * f, scale: 0.94, rotationX: 10 * f, transformPerspective: 1200, transformOrigin: "50% 100%" },
            { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 0.75, ease: "expo.out", stagger: 0.07, overwrite: true },
          );
        } else {
          gsap.set(items, { transformPerspective: 1200, transformOrigin: "50% 100%" });
          // opacity (not autoAlpha): panel items hold links — keep them focusable while waiting
          gsap.from(items, {
            opacity: 0,
            y: 90 * f,
            z: -200 * f,
            rotationY: -30 * f,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.1,
            scrollTrigger: { trigger: panel, start: "top 85%", once: true },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [tab], revertOnUpdate: true },
  );

  return (
    <section
      ref={rootRef}
      id="bilib-oling"
      aria-labelledby="about-title"
      className="section-y relative isolate overflow-hidden border-t border-line"
    >
      <BigOutlineWord word="KLUB" className="-top-4 right-0" speed={-0.25} tone="line" />
      <div className="container-page relative z-10 flex flex-col gap-10">
        <GameSectionHeading
          num="01"
          label={`Klubda ${game.abbr}`}
          id="about-title"
          title="Kelishdan oldin bilib oling"
          lead="Klub nimalarni taklif qiladi, kompyuterlar qanday va yaqin turnirlar qachon — hammasi shu yerda. Bo‘limni tanlang."
        />

        <div className="-mx-[var(--page-gutter)] overflow-x-auto px-[var(--page-gutter)] no-scrollbar sm:mx-0 sm:overflow-visible sm:px-0">
          <div
            role="tablist"
            aria-label={`${game.title} haqida`}
            className="inline-flex gap-1.5 rounded-card border border-line bg-surface p-1.5 sm:gap-2 sm:p-2"
          >
            {GAME_TABS.map((t, i) => {
              const on = t.id === tab;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-controls={`panel-${t.id}`}
                  aria-selected={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className={cn(
                    "inline-flex h-12 shrink-0 items-center gap-2.5 rounded-btn px-4 font-display text-[13px] font-bold uppercase tracking-[0.02em] transition-[background-color,color,box-shadow] duration-200 sm:h-14 sm:gap-3.5 sm:px-7 sm:text-[15px]",
                    on
                      ? "bg-panel text-ink shadow-[inset_0_-2px_0_#C4F82A,0_12px_28px_-14px_rgba(0,0,0,.9)]"
                      : "text-muted hover:text-ink",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn("hidden font-mono text-[12px] font-bold tracking-[0.08em] sm:inline", on ? "text-lime" : "text-muted")}
                  >
                    {t.num}
                  </span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Klubda ---------- */}
        <div role="tabpanel" id="panel-klub" aria-labelledby="tab-klub" tabIndex={0} hidden={tab !== "klub"}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {GAME_FEATURES.map((f, i) => (
              <div key={f.num} data-anim>
                <Tilt
                  as="article"
                  max={7}
                  glare
                  className="flex h-full flex-col gap-6 rounded-card border border-line bg-surface p-7 transition-colors duration-300 hover:border-lime/45 md:p-8"
                >
                  <div className="flex items-start justify-between [transform-style:preserve-3d]">
                    <div aria-hidden="true" className="relative size-[72px] [transform-style:preserve-3d]">
                      <div className="absolute left-2 top-2 size-16 rounded-btn border border-lime/40" />
                      <div className="absolute left-0 top-0 flex size-16 items-center justify-center rounded-btn border border-lime bg-raised text-lime [transform:translateZ(36px)]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          {FEATURE_ICONS[i % FEATURE_ICONS.length]}
                        </svg>
                      </div>
                    </div>
                    <span
                      aria-hidden="true"
                      className="font-display text-[48px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_#7C8397] [transform:translateZ(20px)]"
                    >
                      {f.num}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="font-display text-[20px] font-bold leading-[1.2] tracking-[-0.01em] text-ink md:text-[22px]">{f.title}</h3>
                    <p className="text-[16px] leading-[1.55] text-muted">{f.text}</p>
                  </div>
                  <p className={cn(MONO_LABEL, "mt-auto flex flex-wrap items-center gap-2.5 border-t border-line pt-4 leading-[1.6]")}>
                    <PhText text={f.meta} />
                  </p>
                </Tilt>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Talablar ---------- */}
        <div role="tabpanel" id="panel-talab" aria-labelledby="tab-talab" tabIndex={0} hidden={tab !== "talab"}>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
            <div data-anim className="overflow-hidden rounded-card border border-line bg-surface lg:col-span-2">
              <div role="region" aria-labelledby="specs-caption" tabIndex={0} className="overflow-x-auto focus-visible:outline-offset-[-4px]">
                <table className="w-full min-w-[560px] border-collapse text-[16px] leading-[1.4] text-ink">
                  <caption
                    id="specs-caption"
                    className="border-b border-line px-6 py-5 text-left font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-muted [caption-side:top] md:px-7"
                  >
                    {game.title} · talablar va klub kompyuterlari
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col" className={cn(MONO_LABEL, "w-[30%] px-6 py-4 text-left md:px-7")}>
                        Komponent
                      </th>
                      <th scope="col" className={cn(MONO_LABEL, "w-[35%] px-6 py-4 text-left md:px-7")}>
                        Minimal talablar
                      </th>
                      <th
                        scope="col"
                        className="w-[35%] bg-raised px-6 py-4 text-left font-mono text-[12px] font-bold uppercase leading-[1.4] tracking-[0.08em] text-lime md:px-7"
                      >
                        Bizning kompyuterlar
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {GAME_SPECS.map((r) => (
                      <tr key={r.component} className="border-t border-line">
                        <th scope="row" className="px-6 py-[18px] text-left text-[16px] font-semibold md:px-7">
                          {r.component}
                        </th>
                        <td className="px-6 py-[18px] md:px-7">
                          <PhText text={r.min} />
                        </td>
                        <td className="bg-raised px-6 py-[18px] md:px-7">
                          <PhText text={r.club} chipClassName="text-[#C9CEDB] border-[#4A5064]" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div data-anim className="flex flex-col gap-5 rounded-card border border-line bg-surface p-7 md:p-8">
              <div aria-hidden="true" className="flex h-20 items-center pl-4">
                <CssHoloCube size={64} />
              </div>
              <h3 className="font-display text-[20px] font-bold leading-[1.2] tracking-[-0.01em] text-ink md:text-[22px]">
                Uydagi kompyuter tortmayaptimi?
              </h3>
              <p className="text-[16px] leading-[1.55] text-muted">
                Jadvalning o‘ng ustuni — klubda siz o‘tiradigan kompyuter. Keling va <Placeholder>[MONITOR Hz]</Placeholder> monitorda
                farqni o‘zingiz sezing.
              </p>
              <ButtonLink href={BOOKING_HREF} iconRight={<IconArrowRight />} className="self-start">
                Joy band qilish
              </ButtonLink>
            </div>
          </div>
        </div>

        {/* ---------- Turnirlar ---------- */}
        <div role="tabpanel" id="panel-turnir" aria-labelledby="tab-turnir" tabIndex={0} hidden={tab !== "turnir"}>
          <div className="flex flex-col gap-6">
            <ul className="flex flex-col gap-4">
              {cups.map((c) => (
                <li
                  key={c.idx}
                  data-anim
                  className="flex flex-col gap-5 rounded-card border border-line bg-surface p-6 transition-colors duration-300 hover:border-lime/45 hover:bg-[#141722] lg:flex-row lg:items-center lg:gap-8 lg:px-8 lg:py-6"
                >
                  <span
                    aria-hidden="true"
                    className="w-[72px] shrink-0 font-display text-[40px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_#7C8397]"
                  >
                    {c.idx}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3.5">
                      <h3 className="font-display text-[20px] font-bold leading-[1.2] tracking-[-0.01em] text-ink md:text-[22px]">
                        NEON CUP #<Placeholder>[SON]</Placeholder>
                      </h3>
                      {c.first ? (
                        <span className="inline-flex h-6 items-center rounded-chip bg-lime px-2 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ground">
                          Navbatdagi
                        </span>
                      ) : null}
                    </div>
                    <p className="font-mono text-[13px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">{c.format}</p>
                  </div>
                  <dl className="flex shrink-0 gap-10">
                    <div className="flex flex-col gap-1.5">
                      <dt className={MONO_LABEL}>Sana</dt>
                      <dd>
                        <Placeholder>[SANA]</Placeholder>
                      </dd>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <dt className={MONO_LABEL}>Sovrin</dt>
                      <dd>
                        <Placeholder>[SOVRIN]</Placeholder>
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href="/turnirlar"
                    aria-label={`NEON CUP #[SON], ${c.format} — turnirga yozilish`}
                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2.5 self-start rounded-btn border border-lime px-5 text-[15px] font-semibold text-ink no-underline transition-colors duration-200 hover:bg-lime/10 lg:self-auto"
                  >
                    Yozilish
                    <IconArrowRight />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/turnirlar"
              data-anim
              className="inline-flex min-h-11 items-center gap-2.5 self-start font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-lime no-underline transition-colors hover:text-lime-hover"
            >
              Barcha turnirlar va reyting
              <IconArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
