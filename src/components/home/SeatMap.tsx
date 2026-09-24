"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { BOOKING, SEAT_AREAS, SEATS, type Seat } from "@/lib/data";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useBooking } from "./BookingContext";
import { lime } from "./content";

/** design box of the map (px); scaled to the column width through --fit */
const DESIGN_W = 720;
const DESIGN_H = 600;
const PLANE_W = 560;
const PLANE_H = 430;

const LEGEND_ICON = "size-4 shrink-0 rounded-chip border";

/**
 * Isometric CSS 3D hall plan with real <button> seats (aria-pressed, disabled when taken).
 * As it scrolls in, the plan rotates from a flat top-down view into the isometric view
 * (outer tilt = rotateX, inner spin = rotateZ; seat labels counter-rotate to stay upright).
 * Below 1024px — and on any coarse (touch) pointer — the seats are also offered as a 44px chip
 * grid, which becomes the accessible control (the scaled-down iso seats fall well under 44px
 * there; they stay tappable but leave the tab order and the plan is aria-hidden).
 */
const CHIPS_QUERY = "(max-width: 1023.98px), (pointer: coarse)";

export default function SeatMap() {
  const { state, pickSeat } = useBooking();
  /** chip picker is the accessible control (keep in sync with the chip grid's CSS below) */
  const chips = useMediaQuery(CHIPS_QUERY);
  const box = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const spin = useRef<HTMLDivElement>(null);

  // fit the 720×600 design box to the column width (DOM var, no React state)
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const apply = () => el.style.setProperty("--fit", String(Math.min(1, el.clientWidth / DESIGN_W)));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const labels = gsap.utils.toArray<HTMLElement>(".seat-label", box.current);
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: box.current, start: "top 92%", end: "center 55%", scrub: true },
        });
        tl.fromTo(tilt.current, { rotationX: 0, scale: 0.8, y: 30 }, { rotationX: 55, scale: 0.94, y: 0 }, 0)
          .fromTo(spin.current, { rotation: 0 }, { rotation: -40 }, 0)
          .fromTo(labels, { rotation: 0, scaleY: 1 }, { rotation: 40, scaleY: 1.74 }, 0);
      });
      return () => mm.revert();
    },
    { scope: box },
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p id="seat-map-title" className="eyebrow">
          {BOOKING.mapTitle}
        </p>
        <ul aria-label="Belgilar" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <li className="flex items-center gap-2 text-[14px] leading-[1.4] text-muted">
            <span aria-hidden="true" className={cn(LEGEND_ICON, "bg-[#1C2131]")} style={{ borderColor: lime(0.7) }} />
            {BOOKING.legend.free}
          </li>
          <li className="flex items-center gap-2 text-[14px] leading-[1.4] text-muted">
            <span
              aria-hidden="true"
              className={cn(LEGEND_ICON, "border-[#363C50] bg-[repeating-linear-gradient(45deg,#2A2F3F_0_3px,#11131B_3px_6px)]")}
            />
            {BOOKING.legend.busy}
          </li>
          <li className="flex items-center gap-2 text-[14px] leading-[1.4] text-muted">
            <span aria-hidden="true" className={cn(LEGEND_ICON, "border-lime bg-lime shadow-glow")} />
            {BOOKING.legend.selected}
          </li>
        </ul>
      </div>

      {/* the 3D plan */}
      <div
        ref={box}
        aria-hidden={chips || undefined}
        className="relative overflow-hidden rounded-card border border-line bg-ground [--fit:0.45] sm:[--fit:0.8] md:[--fit:0.95] lg:[--fit:0.75] xl:[--fit:0.9] 2xl:[--fit:1]"
        style={{ height: `calc(${DESIGN_H}px * var(--fit))` }}
      >
        <p aria-hidden="true" className="absolute left-5 top-4 z-10 font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted">
          {BOOKING.viewLabel}
        </p>
        <div
          className="absolute left-1/2 top-0 origin-top [perspective-origin:50%_30%] [perspective:1600px]"
          style={{ width: DESIGN_W, height: DESIGN_H, transform: "translateX(-50%) scale(var(--fit))" }}
        >
          <div
            ref={tilt}
            className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
            style={{
              width: PLANE_W,
              height: PLANE_H,
              marginLeft: -PLANE_W / 2,
              marginTop: -230,
              transform: "rotateX(55deg) scale(0.94)",
            }}
          >
            <div
              ref={spin}
              role="group"
              aria-labelledby="seat-map-title"
              className="absolute inset-0 rounded-[6px] bg-surface shadow-[0_50px_90px_rgba(0,0,0,.6)] [transform-style:preserve-3d]"
              style={{
                transform: "rotate(-40deg)",
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(238,240,246,.045) 0 1px, transparent 1px 20px), repeating-linear-gradient(90deg, rgba(238,240,246,.045) 0 1px, transparent 1px 20px)",
              }}
            >
              {/* slab thickness */}
              <div
                aria-hidden="true"
                className="absolute border border-line bg-raised"
                style={{ left: 0, top: PLANE_H, width: PLANE_W, height: 18, transformOrigin: "50% 0%", transform: "rotateX(-90deg)" }}
              />
              <div
                aria-hidden="true"
                className="absolute border border-line bg-[#131620]"
                style={{ left: -18, top: 0, width: 18, height: PLANE_H, transformOrigin: "100% 50%", transform: "rotateY(-90deg)" }}
              />

              {/* zone areas */}
              {SEAT_AREAS.map((a) => {
                const on = a.id === state.zone;
                return (
                  <div
                    key={a.id}
                    aria-hidden="true"
                    className="absolute rounded-[10px] border border-dashed transition-[border-color,background-color] duration-300"
                    style={{
                      left: a.x,
                      top: a.y,
                      width: a.w,
                      height: a.h,
                      borderColor: on ? lime(0.7) : "#363C50",
                      background: on ? lime(0.05) : "transparent",
                    }}
                  >
                    <span
                      className="absolute left-3.5 top-2 font-mono text-[12px] font-bold uppercase leading-[1.4] tracking-[0.12em]"
                      style={{ color: on ? "#C4F82A" : "#A3A9BC" }}
                    >
                      {a.label}
                    </span>
                  </div>
                );
              })}

              {/* reception + desk + entrance */}
              <div aria-hidden="true" className="absolute rounded-[10px] border border-dashed border-[#363C50]" style={{ left: 20, top: 340, width: 524, height: 72 }}>
                <span className="absolute left-3.5 top-2 font-mono text-[12px] font-bold uppercase leading-[1.4] tracking-[0.12em] text-muted">
                  {BOOKING.entrance}
                </span>
              </div>
              <div aria-hidden="true" className="absolute [transform-style:preserve-3d]" style={{ left: 200, top: 366, width: 180, height: 24 }}>
                <div
                  className="absolute bg-[#141722]"
                  style={{ left: 0, top: 24, width: 180, height: 18, border: `1px solid ${lime(0.35)}`, transformOrigin: "50% 0%", transform: "rotateX(90deg)" }}
                />
                <div
                  className="absolute bg-[#0F1119]"
                  style={{ left: -18, top: 0, width: 18, height: 24, border: `1px solid ${lime(0.35)}`, transformOrigin: "100% 50%", transform: "rotateY(90deg)" }}
                />
                <div
                  className="absolute bg-[#1C2030]"
                  style={{ left: 0, top: 0, width: 180, height: 24, border: `1px solid ${lime(0.7)}`, transform: "translateZ(18px)" }}
                />
              </div>
              <div aria-hidden="true" className="absolute h-1 w-[72px] rounded-sm bg-lime shadow-glow" style={{ left: 452, top: 424 }} />

              {/* seats */}
              {SEATS.map((s) => (
                <IsoSeat
                  key={s.id}
                  seat={s}
                  selected={state.seat === s.id}
                  inZone={s.zone === state.zone}
                  focusable={!chips}
                  onPick={pickSeat}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 44px seat chips (the accessible picker below lg and on touch screens) */}
      <div
        role="group"
        aria-labelledby="seat-map-title"
        className="flex flex-col gap-4 lg:[@media(pointer:fine)]:hidden"
      >
        {SEAT_AREAS.map((a) => (
          <div key={a.id} className="flex flex-col gap-2">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{a.label}</p>
            <div className="grid grid-cols-6 gap-2">
              {SEATS.filter((s) => s.zone === a.id).map((s) => {
                const sel = state.seat === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={s.occupied}
                    aria-pressed={sel}
                    aria-label={s.occupied ? `Joy ${s.id} — band` : `Joy ${s.id}`}
                    onClick={() => pickSeat(s.id)}
                    className={cn(
                      "flex h-11 items-center justify-center rounded-btn border font-mono text-[13px] font-bold transition-colors",
                      sel && "border-lime bg-lime text-ground shadow-glow",
                      !sel && s.occupied && "cursor-not-allowed border-[#2C3142] bg-[repeating-linear-gradient(45deg,#232838_0_3px,#11131B_3px_7px)] text-muted line-through",
                      !sel && !s.occupied && "border-lime/45 bg-[#1C2131] text-ink",
                    )}
                  >
                    {s.id}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="flex items-center gap-2 text-[14px] leading-[1.4] text-muted">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5M12 8h.01" />
        </svg>
        {BOOKING.sampleNote}
      </p>
    </div>
  );
}

interface IsoSeatProps {
  seat: Seat;
  selected: boolean;
  inZone: boolean;
  focusable: boolean;
  onPick: (id: string) => void;
}

/** One seat block: south + west faces and the top face as the real <button>. Selected seats lift. */
function IsoSeat({ seat, selected, inZone, focusable, onPick }: IsoSeatProps) {
  const occ = seat.occupied;
  const lift = selected ? 22 : 0;
  let topBg: string;
  let topBd: string;
  let topColor: string;
  let sideBg: string;
  let sideBd: string;
  let glow = "none";
  if (selected) {
    topBg = "#C4F82A";
    topBd = "#C4F82A";
    topColor = "#0A0B10";
    sideBg = lime(0.45);
    sideBd = "#C4F82A";
    glow = `0 0 28px ${lime(0.55)}`;
  } else if (occ) {
    topBg = "repeating-linear-gradient(45deg, #232838 0 3px, #11131B 3px 7px)";
    topBd = "#2C3142";
    topColor = "#A3A9BC";
    sideBg = "#0E1016";
    sideBd = "#262A38";
  } else if (inZone) {
    topBg = "#1C2131";
    topBd = lime(0.6);
    topColor = "#EEF0F6";
    sideBg = "#131723";
    sideBd = lime(0.4);
  } else {
    topBg = "#181B26";
    topBd = "#3A4052";
    topColor = "#A3A9BC";
    sideBg = "#10121A";
    sideBd = "#2C3142";
  }
  const face: CSSProperties = { position: "absolute", boxSizing: "border-box" };

  return (
    <div
      className="absolute size-12 transition-transform duration-300 ease-out [transform-style:preserve-3d]"
      style={{ left: seat.x, top: seat.y, transform: `translateZ(${lift}px)` }}
    >
      <div
        aria-hidden="true"
        className="transition-[transform,box-shadow] duration-300 ease-out"
        style={{
          ...face,
          left: 2,
          top: 2,
          width: 44,
          height: 44,
          borderRadius: 8,
          background: selected ? lime(0.22) : "transparent",
          boxShadow: selected ? `0 0 36px ${lime(0.55)}` : "none",
          transform: `translateZ(${-lift}px)`,
        }}
      />
      <div
        aria-hidden="true"
        style={{ ...face, left: 0, top: 48, width: 48, height: 14, background: sideBg, border: `1px solid ${sideBd}`, transformOrigin: "50% 0%", transform: "rotateX(90deg)" }}
      />
      <div
        aria-hidden="true"
        style={{ ...face, left: -14, top: 0, width: 14, height: 48, background: sideBg, border: `1px solid ${sideBd}`, transformOrigin: "100% 50%", transform: "rotateY(90deg)" }}
      />
      <button
        type="button"
        disabled={occ}
        aria-pressed={selected}
        aria-label={occ ? `Joy ${seat.id} — band` : `Joy ${seat.id}`}
        tabIndex={focusable ? undefined : -1}
        onClick={() => onPick(seat.id)}
        className={cn("m-0 flex items-center justify-center p-0", occ ? "cursor-not-allowed" : "hover:brightness-[1.35]")}
        style={{
          ...face,
          left: 0,
          top: 0,
          width: 48,
          height: 48,
          borderRadius: 4,
          background: topBg,
          border: `1px solid ${topBd}`,
          color: topColor,
          boxShadow: glow,
          transform: "translateZ(14px)",
          font: "inherit",
        }}
      >
        <span
          aria-hidden="true"
          className={cn("seat-label pointer-events-none block font-mono text-[12px] font-bold leading-none tracking-[0.02em]", occ && "line-through")}
          style={{ transform: "rotate(40deg) scaleY(1.74)" }}
        >
          {seat.id}
        </span>
      </button>
    </div>
  );
}
