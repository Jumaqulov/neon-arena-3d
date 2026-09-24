"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { PROFILE, SITE } from "@/lib/data";
import { cn } from "@/lib/cn";
import { useCanHover } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { PhText } from "@/components/ui/Placeholder";
import { IconCursor, IconFlip } from "./icons";
import s from "./profile.module.css";

/** max pointer tilt in degrees (mockup: ±13° X, ±17° Y) */
const TILT_X = 26;
const TILT_Y = 34;
const SINCE_LABEL = "A’zo bo‘lgan sana:";
const RING_RADII = Array.from({ length: 13 }, (_, i) => 70 + i * 30);
const HEX = "M50 8L88 30V72L50 94L12 72V30Z";

export interface MemberCardStageProps {
  /** the card's layout box (no transforms) — measured by the hero to align the 3D scene */
  cardRef: RefObject<HTMLDivElement | null>;
}

/**
 * The 3D member card: holographic pedestal + floating card that tilts with the pointer
 * and flips (button) to its back with [QR KOD].
 *
 * Transform ownership, outer → inner (one owner per node, nothing flattens the 3D):
 *   card-fade-in   GSAP intro   opacity
 *   animate-float  CSS          translateY bob (time)
 *   card-fade-out  GSAP scroll  opacity        + perspective for the chain below
 *   card-scroll    GSAP scroll  rotateY/X, z, y  ("turns away")
 *   card-intro     GSAP intro   rotateY/X, z     (flies in from depth)
 *   tilt           rAF spring   rotateX/Y        (pointer)
 *   flip           React/CSS    rotateY 0 | 180
 */
export default function MemberCardStage({ cardRef }: MemberCardStageProps) {
  const cardId = useId();
  const [flipped, setFlipped] = useState(false);
  const canHover = useCanHover();
  const reduced = useReducedMotion();
  const enabled = canHover && !reduced;

  const tiltRef = useRef<HTMLDivElement>(null);
  const target = useRef({ rx: 0, ry: 0 });
  const current = useRef({ rx: 0, ry: 0 });
  const raf = useRef(0);

  const step = useCallback(function step() {
    const el = tiltRef.current;
    if (!el) {
      raf.current = 0;
      return;
    }
    const c = current.current;
    const t = target.current;
    c.rx += (t.rx - c.rx) * 0.12;
    c.ry += (t.ry - c.ry) * 0.12;
    el.style.transform = `rotateX(${c.rx.toFixed(3)}deg) rotateY(${c.ry.toFixed(3)}deg)`;
    // glare band: mockup translateX(170px + ry*11 + rx*3) on a 460px card → cqw
    el.style.setProperty("--card-gx", (36.96 + (c.ry * 11 + c.rx * 3) / 4.6).toFixed(2));
    el.style.setProperty("--card-go", Math.min(1, 0.5 + (Math.abs(c.rx) + Math.abs(c.ry)) / 36).toFixed(3));
    const settled = Math.abs(t.rx - c.rx) < 0.01 && Math.abs(t.ry - c.ry) < 0.01;
    raf.current = settled ? 0 : requestAnimationFrame(step);
  }, []);

  const kick = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(step);
  }, [step]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, []);

  // tilt switched off (touch device / reduced motion turned on): drop any leftover pose
  useEffect(() => {
    if (enabled) return;
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    target.current = { rx: 0, ry: 0 };
    current.current = { rx: 0, ry: 0 };
    const el = tiltRef.current;
    if (el) {
      el.style.transform = "";
      el.style.removeProperty("--card-gx");
      el.style.removeProperty("--card-go");
    }
  }, [enabled]);

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || e.pointerType === "touch") return;
    const r = e.currentTarget.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    target.current = { rx: -py * TILT_X, ry: px * TILT_Y };
    kick();
  };

  const onPointerLeave = () => {
    target.current = { rx: 0, ry: 0 };
    if (enabled) kick();
  };

  return (
    <div
      className="relative flex w-full flex-col items-center"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* card column = @container: every card length is in cqw of this width */}
      <div className="@container relative w-[min(460px,100%)]">
        <div ref={cardRef} className="relative aspect-[460/290]">
          {/* holographic pedestal + contact shadow (under the card) */}
          <div
            data-hero="pedestal-scroll"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ transformOrigin: "50% 131%" }}
          >
            <div data-hero="pedestal-intro" className="absolute inset-0" style={{ transformOrigin: "50% 131%" }}>
              <div className={s.pedestal}>
                <span className={s.pedGlow} />
                <span className={s.pedRing} />
                <span className={s.pedDash} />
                <span className={s.pedInner} />
              </div>
              <div className={s.shadow} />
            </div>
          </div>

          {/* ---- the card ---- */}
          <div data-hero="card-fade-in" className="absolute inset-0">
            <div className="absolute inset-0 animate-float">
              <div data-hero="card-fade-out" className={s.cardPersp}>
                <div data-hero="card-scroll" className={s.p3d}>
                  <div data-hero="card-intro" className={s.p3d}>
                    <div ref={tiltRef} className={s.p3d}>
                      <div
                        id={cardId}
                        role="group"
                        aria-label={PROFILE.card.label}
                        className={cn(s.p3d, s.flip)}
                        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                      >
                        {/* card thickness: stacked slices give a glowing lime edge */}
                        {[-0.783, -0.261, 0.261, 0.783].map((z) => (
                          <div
                            key={z}
                            aria-hidden="true"
                            className={s.slice}
                            style={{ transform: `translateZ(${z}cqw)` }}
                          />
                        ))}

                        {/* FRONT */}
                        <div className={cn(s.face, s.front)} aria-hidden={flipped || undefined}>
                          <div className={s.plate} aria-hidden="true">
                            <svg
                              className={s.rings}
                              viewBox="0 0 460 290"
                              fill="none"
                              stroke="#C4F82A"
                              strokeOpacity={0.09}
                              strokeWidth={1}
                            >
                              {RING_RADII.map((r) => (
                                <circle key={r} cx={470} cy={300} r={r} />
                              ))}
                            </svg>
                            <div className={s.blob} />
                            <div className={s.glare}>
                              <span />
                              <span />
                              <span />
                            </div>
                          </div>

                          <div className={cn(s.layer, s.brand, s.mono)}>
                            <span className={s.brandName}>{SITE.name}</span>
                            <span className={s.brandSub}>{PROFILE.card.label}</span>
                          </div>

                          <div className={cn(s.layer, s.badge, s.mono)}>
                            <span>{PROFILE.tierBadge}</span>
                          </div>

                          <svg aria-hidden="true" viewBox="0 0 100 100" className={cn(s.layer, s.hex, s.hex1)} fill="none" stroke="#C4F82A" strokeWidth={1.75} strokeLinejoin="round">
                            <path d={HEX} />
                            <path d="M12 30L50 52L88 30" />
                            <path d="M50 52V94" />
                          </svg>
                          <svg aria-hidden="true" viewBox="0 0 100 100" className={cn(s.layer, s.hex, s.hex2)} fill="none" stroke="#C4F82A" strokeWidth={1.75} strokeLinejoin="round">
                            <path d={HEX} />
                            <path d="M12 30L50 52L88 30" />
                            <path d="M50 52V94" />
                          </svg>
                          <svg aria-hidden="true" viewBox="0 0 100 100" className={cn(s.layer, s.hex, s.hex3)} fill="none" stroke="#C4F82A" strokeWidth={1.75} strokeLinejoin="round">
                            <path d="M50 8L88 30L50 52L12 30Z" fill="#C4F82A" fillOpacity={0.38} />
                            <path d="M12 30L50 52V94L12 72Z" fill="#C4F82A" fillOpacity={0.12} />
                            <path d="M88 30L50 52V94L88 72Z" fill="#C4F82A" fillOpacity={0.24} />
                            <path d="M50 30L69 41L50 52L31 41Z" fill="#0A0B10" fillOpacity={0.35} />
                          </svg>

                          <div className={cn(s.layer, s.nameBlock)}>
                            <span className={s.name}>{PROFILE.handle}</span>
                            <span aria-hidden="true" className={s.nameLine} />
                          </div>

                          <div className={cn(s.layer, s.meta, s.mono)}>
                            <span className={s.number}>
                              № <PhText text={PROFILE.memberNo} />
                            </span>
                            <span className={s.since}>
                              {SINCE_LABEL} <PhText text={PROFILE.memberSince} />
                            </span>
                          </div>

                          <div aria-hidden="true" className={cn(s.layer, s.chip)} />
                        </div>

                        {/* BACK */}
                        <div className={cn(s.face, s.back)} aria-hidden={!flipped || undefined}>
                          <div className={s.plate} aria-hidden="true">
                            <div className={s.stripe} />
                            <div className={s.glare}>
                              <span />
                              <span />
                            </div>
                          </div>

                          <div className={cn(s.layer, s.qr, s.mono)}>
                            <span aria-hidden="true" className={cn(s.finder, s.finderTL)} />
                            <span aria-hidden="true" className={cn(s.finder, s.finderTR)} />
                            <span aria-hidden="true" className={cn(s.finder, s.finderBL)} />
                            <span className={s.qrLabel}>
                              <PhText text={PROFILE.card.qr} />
                            </span>
                          </div>

                          <div className={cn(s.layer, s.backText)}>
                            <span className={s.backTitle}>{PROFILE.card.qrHint}</span>
                            <span className={s.backBody}>{PROFILE.card.backText}</span>
                            <span className={cn(s.backMeta, s.mono)}>
                              {PROFILE.handle} · № <PhText text={PROFILE.memberNo} />
                            </span>
                          </div>

                          <div className={cn(s.layer, s.backFoot, s.mono)}>
                            <span>{PROFILE.card.backFooter}</span>
                            <span className={s.backFootTier}>{PROFILE.tierShort}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* room for the pedestal ellipse under the card */}
        <div aria-hidden="true" className="h-[34cqw]" />
      </div>

      {/* card controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <button
          type="button"
          aria-pressed={flipped}
          aria-controls={cardId}
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex h-12 items-center gap-2.5 rounded-btn border border-ink/30 bg-surface px-[22px] text-[15px] font-semibold text-ink transition-[border-color,background-color] duration-200 hover:border-ink hover:bg-raised"
        >
          <IconFlip />
          {PROFILE.card.flipLabel}
        </button>
        {enabled ? (
          <span className="inline-flex items-center gap-2 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
            <IconCursor size={18} />
            {PROFILE.card.tiltHint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
