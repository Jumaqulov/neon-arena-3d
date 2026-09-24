"use client";

import { useRef, type CSSProperties, type FocusEvent, type MouseEvent } from "react";
import { gsap, MQ, PIN_PRIORITY, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ZONES, ZONES_SECTION, type Zone, type ZoneId } from "@/lib/data";
import { scrollAndFocus, scrollToTarget } from "@/lib/scroll-store";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import Parallax from "@/components/motion/Parallax";
import { PhText } from "@/components/ui/Placeholder";
import { IconArrowRight } from "@/components/ui/Icon";
import { useBookingActions } from "./BookingContext";
import HomeHeading from "./HomeHeading";
import PackagesStrip from "./PackagesStrip";
import ZoneIsoArt from "./ZoneIsoArt";

/** ring geometry (must match HomeStyles: rotateY(i*60deg) translateZ(440px)) */
const STEP = 60;
const RADIUS = 440;
/** timeline hold at each zone (in rotation units) */
const HOLD = 0.45;
/** design size of the ring stage used to fit it into the pinned viewport */
const STAGE_W = 960;
const STAGE_H = 600;

/**
 * 01 / ZONALAR VA NARXLAR (#prices)
 * Desktop + motion: pinned 3D ring carousel — scrolling rotates the ring so each zone comes to
 * the front in turn while its specs / price animate in. Mobile & reduced motion: a static grid
 * (mobile cards flip in). Layout mode is toggled with data-ring (see HomeStyles).
 */
export default function ZonesSection() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const fit = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLUListElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const { pickZone } = useBookingActions();

  useGSAP(
    () => {
      const section = root.current;
      const pinEl = pin.current;
      const stageEl = stage.current;
      const fitEl = fit.current;
      const ringEl = ring.current;
      if (!section || !pinEl || !stageEl || !fitEl || !ringEl) return;
      const cards = gsap.utils.toArray<HTMLElement>(".na-zone-card", ringEl);
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        section.setAttribute("data-ring", "");
        const n = cards.length;
        const steps = gsap.utils.toArray<HTMLButtonElement>("[data-zone-step]", section);

        // fit the fixed-size ring into whatever height the pinned stage gets
        const doFit = () => {
          const s = Math.max(0.5, Math.min(1, stageEl.clientWidth / STAGE_W, stageEl.clientHeight / STAGE_H));
          gsap.set(fitEl, { scale: s });
        };
        doFit();
        ScrollTrigger.addEventListener("refreshInit", doFit);
        gsap.set(fitEl, { rotationX: -4, rotationY: 0 });
        gsap.set(ringEl, { z: -RADIUS, rotationY: 0 });

        let active = -1;
        const update = () => {
          const rot = Number(gsap.getProperty(ringEl, "rotationY")) || 0;
          for (let i = 0; i < n; i++) {
            const f = Math.cos(((rot + i * STEP) * Math.PI) / 180);
            const card = cards[i];
            card.style.opacity = f <= 0.1 ? "0" : String(Math.round((0.16 + 0.84 * f ** 4) * 1000) / 1000);
            card.style.pointerEvents = f > 0.92 ? "" : "none";
          }
          const next = Math.min(n - 1, Math.max(0, Math.round(-rot / STEP)));
          if (next !== active) {
            active = next;
            steps.forEach((b, bi) => {
              if (bi === next) b.setAttribute("aria-current", "step");
              else b.removeAttribute("aria-current");
            });
          }
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: update,
          scrollTrigger: {
            trigger: pinEl,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * (n - 0.4))}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: PIN_PRIORITY,
          },
        });
        tl.addLabel("z0", HOLD / 2).to({}, { duration: HOLD }, 0);
        for (let i = 1; i < n; i++) {
          const at = HOLD + (i - 1) * (1 + HOLD);
          const prev = cards[i - 1].querySelectorAll(".zone-detail");
          const next = cards[i].querySelectorAll(".zone-detail");
          tl.to(ringEl, { rotationY: -STEP * i, duration: 1, ease: "power2.inOut" }, at)
            .to(prev, { opacity: 0, y: -14, duration: 0.3, stagger: 0.05 }, at)
            .fromTo(next, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.07 }, at + 0.55)
            .addLabel(`z${i}`, at + 1 + HOLD / 2)
            .to({}, { duration: HOLD }, at + 1);
        }
        tlRef.current = tl;
        update();

        // pointer sway of the whole ring (mouse only)
        const rx = gsap.quickTo(fitEl, "rotationX", { duration: 1, ease: "power3" });
        const ry = gsap.quickTo(fitEl, "rotationY", { duration: 1, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          rx(-4 - (e.clientY / window.innerHeight - 0.5) * 6);
          ry((e.clientX / window.innerWidth - 0.5) * 10);
        };
        pinEl.addEventListener("pointermove", onMove);

        return () => {
          pinEl.removeEventListener("pointermove", onMove);
          ScrollTrigger.removeEventListener("refreshInit", doFit);
          section.removeAttribute("data-ring");
          tlRef.current = null;
          cards.forEach((c) => {
            c.style.opacity = "";
            c.style.pointerEvents = "";
          });
          steps.forEach((b) => b.removeAttribute("aria-current"));
        };
      });

      // Mobile: plain stack, each card flips in.
      mm.add(MQ.mobile, () => {
        cards.forEach((card) => {
          gsap.set(card, { transformPerspective: 1000, transformOrigin: "50% 100%" });
          gsap.from(card, {
            opacity: 0,
            y: 56,
            z: -110,
            rotationY: -24,
            duration: 1.05,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  /** scroll the pinned ring so zone `i` is at the front */
  const goTo = (i: number) => {
    const tl = tlRef.current;
    const st = tl?.scrollTrigger;
    if (!tl || !st) return;
    const t = tl.labels[`z${i}`] ?? 0;
    scrollToTarget(st.start + (st.end - st.start) * (t / tl.duration()), { offset: 0 });
  };

  const onCardFocus = (i: number) => (e: FocusEvent<HTMLElement>) => {
    if (e.target instanceof HTMLElement && e.target.matches(":focus-visible")) goTo(i);
  };

  const book = (id: ZoneId) => (e: MouseEvent<HTMLAnchorElement>) => {
    pickZone(id);
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    scrollAndFocus("#booking");
    window.history.replaceState(null, "", "#booking");
  };

  return (
    <section ref={root} id="prices" aria-labelledby="zones-title" className="na-zones relative isolate overflow-hidden">
      <BigOutlineWord word="ZONA" className="-right-6 top-16" speed={-0.3} />
      <Parallax speed={0.55} className="pointer-events-none absolute left-[6%] top-[38%] z-0 hidden md:block" aria-hidden="true">
        <Crosshair />
      </Parallax>

      <div ref={pin} className="na-zones-pin relative z-10 pt-20 md:pt-28 xl:pt-32">
        <div className="container-page w-full">
          <HomeHeading id="zones-title" eyebrow={ZONES_SECTION.eyebrow} title={ZONES_SECTION.title} lead={ZONES_SECTION.lead} />
        </div>

        <div ref={stage} className="na-zones-stage container-page mt-12 md:mt-14">
          <div ref={fit} className="na-zones-fit">
            <ul ref={ring} className="na-zones-ring grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {ZONES.map((z, i) => (
                <li
                  key={z.id}
                  className="na-zone-card flex"
                  style={{ "--i": i } as CSSProperties}
                  onFocusCapture={onCardFocus(i)}
                >
                  <ZoneCard zone={z} onBook={book(z.id)} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ring mode only: jump between zones (real buttons; also reflect the active zone) */}
        <div className="container-page">
          <div role="group" aria-label="Zonalar" className="na-zones-nav flex-wrap items-center justify-center gap-2">
            {ZONES.map((z, i) => (
              <button
                key={z.id}
                type="button"
                data-zone-step=""
                onClick={() => goTo(i)}
                className="inline-flex h-11 items-center gap-2 rounded-btn border border-line bg-ground/80 px-4 text-muted transition-colors duration-200 hover:border-line-strong hover:text-ink aria-[current=step]:border-lime/60 aria-[current=step]:text-lime"
              >
                <span className="font-mono text-[12px] font-medium tracking-[0.08em]">{z.idx}</span>
                <span className="text-[14px] font-semibold">{z.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="na-zones-after container-page relative z-10 pb-20 pt-6 md:pb-28 xl:pb-32">
        <PackagesStrip />
      </div>
    </section>
  );
}

function ZoneCard({ zone, onBook }: { zone: Zone; onBook: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <article className="relative flex w-full flex-col justify-between gap-5 rounded-card border border-line bg-surface p-6 shadow-card transition-[border-color] duration-300 hover:border-lime/50">
      <div className="flex flex-col gap-5">
        <ZoneIsoArt zone={zone.id} />
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[24px] font-bold uppercase leading-[1.2] tracking-[-0.02em] text-ink">
            {zone.name}
          </h3>
          <span className="font-mono text-[12px] font-medium leading-[1.4] tracking-[0.08em] text-muted">{zone.idx}</span>
        </div>
        <p className="min-h-[45px] text-[15px] leading-[1.5] text-muted">{zone.desc}</p>
        <ul className="zone-detail flex flex-col gap-2.5 border-t border-line pt-4">
          {zone.specs.map((sp) => (
            <li key={sp.label} className="flex items-center justify-between gap-3 text-[14px] leading-[1.4]">
              <span className="text-muted">{sp.label}</span>
              <span className="whitespace-nowrap text-right font-mono text-[13px] font-medium text-ink">
                <PhText text={`${sp.value}${sp.suffix ?? ""}`} chipClassName="text-[13px]" />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="zone-detail flex items-center justify-between gap-3 border-t border-line pt-4">
        <p className="flex min-w-0 flex-col items-start gap-1 leading-[1.3]">
          <PhText text={zone.price} chipClassName="px-2 py-0.5 text-[16px] font-bold text-ink" />
          <span className="whitespace-nowrap text-[13px] text-muted">{zone.priceUnit}</span>
        </p>
        <a
          href="#booking"
          onClick={onBook}
          aria-label={`${ZONES_SECTION.bookLabel} — ${zone.name} zonasi`}
          className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap text-[14px] font-semibold text-lime no-underline transition-colors hover:text-lime-hover"
        >
          {ZONES_SECTION.bookLabel}
          <IconArrowRight size={18} />
        </a>
      </div>
    </article>
  );
}

/** thin lime crosshair (decorative parallax layer) */
function Crosshair() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="rgba(196,248,42,.35)" strokeWidth="1">
      <circle cx="60" cy="60" r="36" strokeDasharray="4 6" />
      <circle cx="60" cy="60" r="3" fill="rgba(196,248,42,.6)" stroke="none" />
      <path d="M60 4v32M60 84v32M4 60h32M84 60h32" />
    </svg>
  );
}
