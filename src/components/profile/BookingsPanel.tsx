"use client";

import { useEffect, useRef, useState } from "react";
import { BOOKING_HREF, PROFILE } from "@/lib/data";
import { EASE, gsap, MQ, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Placeholder, PhText } from "@/components/ui/Placeholder";
import Tag from "@/components/ui/Tag";
import { IconCalendar, IconCheck, IconClose } from "@/components/ui/Icon";

const U = PROFILE.upcoming;
const H = PROFILE.history;

const LABELS = {
  date: "Sana",
  start: "Boshlanish",
  duration: "Davomiylik",
  seat: "Joy",
  countdown: "Boshlanishiga",
  mapEyebrow: "Zal sxemasi · namuna",
  mapTitle: "Sizning joyingiz",
  mine: "Siz band qilgan joy",
  others: "Boshqa joylar",
} as const;

/** sample hall: 4 × 3 seats, the booked one is index 6 (decorative, "namuna") */
const SEATS = Array.from({ length: 12 }, (_, i) => i);
const MY_SEAT = 6;

export interface BookingsPanelProps {
  cancelled: boolean;
  onCancel: () => void;
}

/** "Bronlar" tab: upcoming-booking ticket (cancel → confirm → cancelled), seat map, history. */
export default function BookingsPanel({ cancelled, onCancel }: BookingsPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const [asking, setAsking] = useState(false);
  const focusNext = useRef<"no" | "cancel" | "new" | null>(null);

  // move focus to the control that replaced the one just pressed
  useEffect(() => {
    const next = focusNext.current;
    if (!next) return;
    focusNext.current = null;
    if (next === "no") noBtnRef.current?.focus();
    else if (next === "cancel") cancelBtnRef.current?.focus();
    else rootRef.current?.querySelector<HTMLElement>("[data-focus='new-booking']")?.focus();
  }, [asking, cancelled]);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();
      mm.add({ motion: MQ.motion, desktop: MQ.desktop }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
        if (!motion) return;
        const f = desktop ? 1 : 0.5;
        const [ticket] = q("[data-bk='ticket']");
        const [seat] = q("[data-bk='seat']");
        const [history] = q("[data-bk='history']");

        // perspective is SET, not tweened (inside from() it would shrink with the rotation)
        gsap.set([ticket, seat].filter(Boolean), { transformPerspective: 1200 });

        if (ticket) {
          gsap.from(ticket, {
            opacity: 0,
            y: 90 * f,
            rotationX: 22 * f,
            transformOrigin: "50% 100%",
            duration: 1.2,
            ease: EASE.expo,
            scrollTrigger: { trigger: ticket, start: "top 88%", once: true },
          });
        }
        if (seat) {
          gsap.from(seat, {
            opacity: 0,
            x: 90 * f,
            rotationY: -28 * f,
            duration: 1.2,
            delay: 0.1,
            ease: EASE.expo,
            scrollTrigger: { trigger: seat, start: "top 88%", once: true },
          });
          // the hall plan swings from a flat top-down view into isometric as it enters
          const plane = { trigger: seat, start: "top 92%", end: "center 45%", scrub: true };
          gsap.fromTo(
            q("[data-bk='tilt']"),
            { rotationX: 0, scale: 0.8 },
            { rotationX: 58, scale: 1, ease: EASE.none, scrollTrigger: plane },
          );
          gsap.fromTo(
            q("[data-bk='spin']"),
            { rotation: 0 },
            { rotation: -38, ease: EASE.none, scrollTrigger: plane },
          );
        }
        if (history) {
          gsap.from(q("[data-bk='row']"), {
            opacity: 0,
            x: (i: number) => (i % 2 === 0 ? -70 : 70) * f,
            duration: 0.9,
            ease: EASE.expo,
            stagger: 0.07,
            scrollTrigger: { trigger: history, start: "top 85%", once: true },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const ask = () => {
    focusNext.current = "no";
    setAsking(true);
  };
  const keep = () => {
    focusNext.current = "cancel";
    setAsking(false);
  };
  const confirm = () => {
    focusNext.current = "new";
    setAsking(false);
    onCancel();
  };

  const facts = [
    { label: LABELS.date, value: U.date },
    { label: LABELS.start, value: U.start },
    { label: LABELS.duration, value: U.duration },
  ];

  return (
    <div ref={rootRef} className="flex flex-col gap-12">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-stretch">
        {/* ---------- ticket ---------- */}
        <article
          data-bk="ticket"
          aria-labelledby="next-title"
          className="relative flex min-w-0 flex-1 flex-col rounded-card border border-line bg-surface md:flex-row"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-7 p-6 sm:p-8 lg:px-9">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-lime">{U.title}</p>
              {cancelled ? (
                <span className="inline-flex h-8 items-center gap-2 rounded-chip border border-[#3A3F52] px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-muted">
                  <IconClose size={16} />
                  {U.statusCancelled}
                </span>
              ) : (
                <span className="inline-flex h-8 items-center gap-2 rounded-chip border border-lime/50 bg-lime/[0.06] px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-lime">
                  <IconCheck size={16} />
                  {U.statusOk}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5">
              <h3
                id="next-title"
                className="font-display text-[32px] font-extrabold uppercase leading-none tracking-[-0.02em] sm:text-[44px]"
              >
                {U.zone}
              </h3>
              <p className="text-[16px] leading-[1.55] text-muted sm:text-[17px]">
                <PhText text={U.owner} />
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-4 border-y border-line py-5 sm:grid-cols-3">
              {facts.map((f) => (
                <div key={f.label} className="flex flex-col gap-2">
                  <dt className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{f.label}</dt>
                  <dd className="font-mono text-[18px] font-bold text-[#C9CEDB] sm:text-[20px]">
                    <PhText text={f.value} />
                  </dd>
                </div>
              ))}
            </dl>

            {!asking && !cancelled ? (
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href={BOOKING_HREF} variant="secondary" size="lg" iconLeft={<IconCalendar />}>
                  {U.change}
                </ButtonLink>
                <button
                  ref={cancelBtnRef}
                  type="button"
                  onClick={ask}
                  className="inline-flex h-14 items-center justify-center rounded-btn border border-transparent px-[22px] text-[16px] font-semibold text-muted transition-[border-color,background-color,color] duration-200 hover:border-ink hover:bg-ink/[0.06] hover:text-ink"
                >
                  {U.cancel}
                </button>
              </div>
            ) : null}

            {asking && !cancelled ? (
              <div
                role="group"
                aria-labelledby="cancel-q"
                aria-describedby="cancel-hint"
                className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-lime/50 bg-raised py-2.5 pl-5 pr-2.5"
              >
                <div className="flex flex-col gap-0.5 py-1">
                  <p id="cancel-q" className="text-[16px] font-semibold text-ink">
                    {U.cancelAsk}
                  </p>
                  <p id="cancel-hint" className="text-[14px] text-muted">
                    {U.cancelHint}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={confirm} className="min-w-[72px]">
                    {U.yes}
                  </Button>
                  <button
                    ref={noBtnRef}
                    type="button"
                    onClick={keep}
                    className="inline-flex h-12 min-w-[72px] items-center justify-center rounded-btn bg-lime px-5 text-[15px] font-semibold text-ground shadow-glow transition-[filter] duration-200 hover:brightness-[1.08]"
                  >
                    {U.no}
                  </button>
                </div>
              </div>
            ) : null}

            <div role="status" aria-live="polite" className={cn(!cancelled && "sr-only")}>
              {cancelled ? <p className="text-[16px] leading-[1.5] text-muted">{U.cancelled}</p> : null}
            </div>
            {cancelled ? (
              <div>
                <ButtonLink href={BOOKING_HREF} size="lg" data-focus="new-booking">
                  {U.newBooking}
                </ButtonLink>
              </div>
            ) : null}
          </div>

          {/* ticket stub — tears off (tilts & dims) when the booking is cancelled */}
          <div
            className={cn(
              "relative flex shrink-0 flex-col justify-between gap-6 border-t border-dashed border-[#3A3F52] p-6 transition-[rotate,translate,opacity] duration-700 ease-spring sm:p-8 md:w-[232px] md:border-l md:border-t-0 md:px-7",
              cancelled && "translate-y-2 rotate-3 opacity-60",
            )}
          >
            <span
              aria-hidden="true"
              className="absolute -left-[15px] -top-4 size-[30px] rounded-full bg-ground"
            />
            <span
              aria-hidden="true"
              className="absolute -right-[15px] -top-4 size-[30px] rounded-full bg-ground md:-bottom-4 md:-left-[15px] md:right-auto md:top-auto"
            />
            <div className="flex flex-col gap-2.5">
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{LABELS.seat}</p>
              <p className="leading-none">
                <Placeholder className="border-lime/40 text-[30px] font-bold text-lime">{U.seat}</Placeholder>
              </p>
              <p className="font-mono text-[13px] font-medium uppercase tracking-[0.08em] text-ink">{U.zone}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                {LABELS.countdown}
              </p>
              <p className="font-mono text-[20px] font-bold text-[#C9CEDB]">
                <PhText text={U.countdown} />
              </p>
            </div>
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
              <PhText text={U.number} />
            </p>
          </div>
        </article>

        {/* ---------- seat map ---------- */}
        <aside
          data-bk="seat"
          aria-labelledby="seat-title"
          className="flex flex-col gap-3 overflow-hidden rounded-card border border-line bg-surface p-6 sm:p-7 xl:w-[392px] xl:shrink-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
                {LABELS.mapEyebrow}
              </p>
              <h3 id="seat-title" className="font-display text-[20px] font-bold leading-[1.2] tracking-[-0.01em]">
                {LABELS.mapTitle}
              </h3>
            </div>
            <Tag tone="lime">
              <PhText text={`${PROFILE.tierShort} · ${U.seat}`} />
            </Tag>
          </div>

          <p className="sr-only">
            <PhText text={`${U.zone}, ${LABELS.seat.toLowerCase()} ${U.seat}.`} />
          </p>

          <div aria-hidden="true" className="relative flex h-[204px] items-center justify-center [perspective:900px]">
            <div data-bk="tilt" className="[transform-style:preserve-3d]" style={{ transform: "rotateX(58deg)" }}>
              <div
                data-bk="spin"
                className="grid h-[174px] w-[236px] grid-cols-4 gap-3 [transform-style:preserve-3d]"
                style={{ transform: "rotateZ(-38deg)" }}
              >
                {SEATS.map((i) =>
                  i === MY_SEAT ? (
                    <div key={i} className="relative h-[50px] [transform-style:preserve-3d]">
                      <span className="absolute inset-0 rounded-chip border border-lime bg-lime/[0.12] shadow-glow" />
                      {[9, 18, 27].map((z) => (
                        <span
                          key={z}
                          className="absolute inset-0 rounded-chip border border-lime/50 bg-lime/[0.06]"
                          style={{ transform: `translateZ(${z}px)` }}
                        />
                      ))}
                      <span
                        className="absolute inset-0 rounded-chip border border-lime bg-lime shadow-glow"
                        style={{ transform: "translateZ(36px)" }}
                      />
                    </div>
                  ) : (
                    <div key={i} className="relative h-[50px] [transform-style:preserve-3d]">
                      <span className="absolute inset-0 rounded-chip border border-[#2E3344] bg-raised" />
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li className="inline-flex items-center gap-2 text-[14px] text-muted">
              <span aria-hidden="true" className="size-3 rounded-[3px] bg-lime" />
              {LABELS.mine}
            </li>
            <li className="inline-flex items-center gap-2 text-[14px] text-muted">
              <span aria-hidden="true" className="size-3 rounded-[3px] border border-[#3A3F52] bg-raised" />
              {LABELS.others}
            </li>
          </ul>
        </aside>
      </div>

      {/* ---------- history ---------- */}
      <div data-bk="history" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3
            id="history-title"
            className="font-display text-[22px] font-bold leading-[1.2] tracking-[-0.01em] sm:text-[24px]"
          >
            {H.eyebrow}
          </h3>
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{H.title}</p>
        </div>

        {/* ≥768px: table */}
        <div className="hidden overflow-hidden rounded-card border border-line bg-surface md:block">
          <table aria-labelledby="history-title" className="w-full border-collapse text-left">
            <thead>
              <tr>
                {H.columns.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={cn(
                      "h-12 border-b border-line bg-raised px-7 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted",
                      i === H.columns.length - 1 && "text-right",
                    )}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {H.rows.map((r, i) => {
                const td = cn(
                  "h-[60px] px-7 transition-colors duration-200 group-hover:bg-[#141722]",
                  i < H.rows.length - 1 && "border-b border-line",
                );
                return (
                  <tr key={i} data-bk="row" className="group">
                    <td className={cn(td, "font-mono text-[15px] font-medium text-[#C9CEDB]")}>
                      <PhText text={r.date} />
                    </td>
                    <td className={td}>
                      <Tag tone={r.zone === "VIP" ? "lime" : "default"}>{r.zone}</Tag>
                    </td>
                    <td className={cn(td, "font-mono text-[15px] font-medium text-[#C9CEDB]")}>
                      <PhText text={r.seat} />
                    </td>
                    <td className={cn(td, "text-[16px] text-ink")}>
                      <PhText text={r.duration} />
                    </td>
                    <td className={cn(td, "text-right font-mono text-[15px] font-bold text-ink")}>
                      <PhText text={r.price} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* <768px: stacked cards */}
        <ul aria-labelledby="history-title" className="flex flex-col gap-3 md:hidden">
          {H.rows.map((r, i) => (
            <li key={i} data-bk="row" className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[15px] font-medium text-[#C9CEDB]">
                  <span className="sr-only">{H.columns[0]}: </span>
                  <PhText text={r.date} />
                </span>
                <Tag tone={r.zone === "VIP" ? "lime" : "default"}>{r.zone}</Tag>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-line pt-3">
                {[
                  { label: H.columns[2], value: r.seat },
                  { label: H.columns[3], value: r.duration },
                  { label: H.columns[4], value: r.price },
                ].map((cell) => (
                  <div key={cell.label} className="flex min-w-0 flex-col gap-1">
                    <dt className="font-mono text-[12px] font-medium uppercase tracking-[0.06em] text-muted">
                      {cell.label}
                    </dt>
                    <dd className="text-[15px] text-ink">
                      <PhText text={cell.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
