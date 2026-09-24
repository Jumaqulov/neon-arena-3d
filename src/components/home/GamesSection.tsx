"use client";

import { useRef, type FocusEvent } from "react";
import { gsap, MQ, PIN_PRIORITY, useGSAP, type ScrollTrigger } from "@/lib/gsap";
import { GAMES, GAMES_SECTION } from "@/lib/data";
import { scrollToTarget } from "@/lib/scroll-store";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/Icon";
import { GAME_DEPTH } from "./content";
import GameCover from "./GameCover";
import HomeHeading from "./HomeHeading";

const TOTAL = String(GAMES.length).padStart(2, "0");

/**
 * 02 / O‘YINLAR KUTUBXONASI
 * Desktop + motion: pinned horizontal gallery. The covers stand on different depth planes of a
 * tilted 3D shelf, so they drift at different on-screen speeds (depth parallax) and each one
 * turns as it crosses the viewport. Mobile: native swipe row with snap. Reduced motion: static
 * tilted grid (as drawn in the mockup). Layout mode is toggled with data-h (see HomeStyles).
 * Covers use the official artwork where it exists (GameCover); its `sizes` follow these three
 * layouts (content.ts GAME_COVER_SIZES), so keep them in sync when a card width changes.
 */
export default function GamesSection() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  useGSAP(
    () => {
      const section = root.current;
      const pinEl = pin.current;
      const vp = viewport.current;
      const tr = track.current;
      if (!section || !pinEl || !vp || !tr) return;
      const cards = gsap.utils.toArray<HTMLElement>(".na-game-card", tr);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        section.setAttribute("data-h", "");
        const n = cards.length;
        const distance = () => Math.max(0, tr.scrollWidth - vp.clientWidth);

        const tween = gsap.to(tr, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pinEl,
            start: "top top",
            end: () => `+=${Math.round(distance() + window.innerHeight * 0.25)}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: PIN_PRIORITY,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress.toFixed(4)})`;
              if (counter.current) {
                const idx = Math.min(n, Math.round(self.progress * (n - 1)) + 1);
                counter.current.textContent = String(idx).padStart(2, "0");
              }
            },
          },
        });
        stRef.current = tween.scrollTrigger ?? null;

        // The shelf viewport clips (overflow: clip), so covers to its right never "intersect" and
        // native lazy loading would fetch each one only as it slides in (blur → sharp mid-scrub).
        // Still lazy, but for the whole shelf at once: start them one viewport before the section.
        const warmUp = new IntersectionObserver(
          (entries, io) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            tr.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => {
              img.loading = "eager";
            });
            io.disconnect();
          },
          { rootMargin: "100% 0px" },
        );
        warmUp.observe(section);

        // each cover sits on its own depth plane and turns as it passes (containerAnimation)
        cards.forEach((card, i) => {
          const inner = card.querySelector<HTMLElement>(".game-3d");
          if (!inner) return;
          const d = GAME_DEPTH[i % GAME_DEPTH.length];
          gsap.fromTo(
            inner,
            { rotationY: 36, rotationX: -6, z: d.z - 40, y: d.y },
            {
              rotationY: -36,
              rotationX: 6,
              z: d.z - 40,
              y: d.y,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        return () => {
          warmUp.disconnect();
          section.removeAttribute("data-h");
          stRef.current = null;
          if (bar.current) bar.current.style.transform = "scaleX(0)";
          if (counter.current) counter.current.textContent = "01";
        };
      });

      // Mobile: light slide-in of the swipe row.
      mm.add(MQ.mobile, () => {
        gsap.set(cards, { transformPerspective: 900 });
        gsap.from(cards, {
          opacity: 0,
          x: 70,
          rotationY: -18,
          duration: 1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: tr, start: "top 85%", once: true },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  /** keyboard focus on a cover while pinned → scroll so that cover is centred */
  const onCardFocus = (e: FocusEvent<HTMLLIElement>) => {
    const st = stRef.current;
    const vp = viewport.current;
    const tr = track.current;
    if (!st || !vp || !tr) return;
    if (!(e.target instanceof HTMLElement) || !e.target.matches(":focus-visible")) return;
    const card = e.currentTarget;
    const dist = Math.max(1, tr.scrollWidth - vp.clientWidth);
    const p = Math.min(1, Math.max(0, (card.offsetLeft + card.offsetWidth / 2 - vp.clientWidth / 2) / dist));
    scrollToTarget(st.start + (st.end - st.start) * p, { offset: 0 });
  };

  return (
    <section ref={root} aria-labelledby="games-title" className="na-games relative isolate overflow-hidden border-t border-line">
      <BigOutlineWord word="O‘YIN" className="bottom-6 left-0" speed={0.45} tone="line" />

      <div ref={pin} className="na-games-pin relative z-10 py-20 md:py-28 xl:py-32">
        <div className="container-page w-full">
          <HomeHeading
            id="games-title"
            eyebrow={GAMES_SECTION.eyebrow}
            title={GAMES_SECTION.title}
            lead={GAMES_SECTION.lead}
            leadPlacement="below"
            action={
              <ButtonLink href="/oyinlar" variant="secondary" iconRight={<IconArrowRight />}>
                {GAMES_SECTION.allLabel}
              </ButtonLink>
            }
          />
        </div>

        <div ref={viewport} className="na-games-viewport container-page mt-12 md:mt-14">
          <div className="na-games-shelf">
            <ul
              ref={track}
              className="na-games-track no-scrollbar -mx-[var(--page-gutter)] flex snap-x snap-mandatory scroll-px-[var(--page-gutter)] gap-4 overflow-x-auto px-[var(--page-gutter)] pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4"
            >
              {GAMES.map((g, i) => (
                <li
                  key={g.slug}
                  className="na-game-card w-[74vw] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none"
                  onFocusCapture={onCardFocus}
                >
                  <GameCover game={g} n={i + 1} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-hidden="true" className="na-games-hud container-page mt-4 w-full items-center gap-3">
          <span ref={counter} className="font-mono text-[13px] font-bold text-lime">
            01
          </span>
          <span className="font-mono text-[13px] text-muted">/ {TOTAL}</span>
          <span className="relative ml-2 h-px flex-1 bg-line">
            <span ref={bar} className="absolute inset-0 origin-left bg-lime shadow-glow" style={{ transform: "scaleX(0)" }} />
          </span>
        </div>
      </div>
    </section>
  );
}
