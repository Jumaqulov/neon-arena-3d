"use client";

import { useRef, type FormEvent, type ReactNode } from "react";
import { BOOKING, ZONES, getZone } from "@/lib/data";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { PhText } from "@/components/ui/Placeholder";
import { IconArrowRight, IconCheck, IconChevronDown, IconMinus, IconMonitor, IconPlus } from "@/components/ui/Icon";
import { useBooking } from "./BookingContext";

const LABEL = "font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-muted";
const FIELD =
  "h-12 w-full rounded-btn border border-[#353B4E] bg-ground px-3.5 font-mono text-[15px] text-ink [color-scheme:dark] transition-colors hover:border-lime/50";

/** yyyy-mm-dd → dd.mm.yyyy; empty → the [SANA] placeholder */
function formatDate(v: string): string {
  return v ? v.split("-").reverse().join(".") : BOOKING.datePlaceholder;
}

/**
 * Booking request form (right column of #booking): zone, date, start time, hours, players,
 * summary and the confirmation state. Pure client state — nothing is sent; the admin
 * confirms by phone ([TELEFON]).
 */
export default function BookingForm() {
  const { state, pickZone, changeHours, changePlayers, setDate, setTime, confirm, reset } = useBooking();
  const doneTitle = useRef<HTMLHeadingElement>(null);
  const formTitle = useRef<HTMLHeadingElement>(null);
  const { zone, seat, hours, players, date, time, confirmed } = state;
  const zoneName = getZone(zone).name;
  const dateText = formatDate(date);
  const total = BOOKING.totalValue.replace("{hours}", String(hours));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!seat) return;
    confirm();
    requestAnimationFrame(() => doneTitle.current?.focus());
  };

  const onReset = () => {
    reset();
    requestAnimationFrame(() => formTitle.current?.focus());
  };

  return (
    <div className="grid h-full rounded-card border border-line bg-surface p-6 shadow-[0_40px_80px_rgba(0,0,0,.35)] sm:p-8 xl:p-9">
      {/* ---------- form ---------- */}
      <form
        aria-labelledby="bron-form-title"
        onSubmit={onSubmit}
        inert={confirmed}
        className={cn(
          "col-start-1 row-start-1 flex flex-col gap-6 transition-[opacity,visibility] duration-300",
          confirmed && "invisible opacity-0",
        )}
      >
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[13px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-lime">
            {BOOKING.formEyebrow}
          </p>
          <h3
            id="bron-form-title"
            ref={formTitle}
            tabIndex={-1}
            className="font-display text-[24px] font-bold leading-[1.2] tracking-[-0.02em] text-ink outline-none"
          >
            {BOOKING.formTitle}
          </h3>
        </div>

        <div role="group" aria-labelledby="zone-label" className="flex flex-col gap-2.5">
          <p id="zone-label" className={LABEL}>
            {BOOKING.labels.zone}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ZONES.map((z) => {
              const on = z.id === zone;
              return (
                <button
                  key={z.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pickZone(z.id)}
                  className={cn(
                    "h-12 min-w-0 rounded-btn border px-1.5 text-[14px] font-semibold transition-[background-color,color,border-color,box-shadow] duration-200",
                    on
                      ? "border-lime bg-lime text-ground shadow-[0_0_20px_rgba(196,248,42,.3)]"
                      : "border-[#353B4E] bg-ground text-ink hover:border-lime/60",
                  )}
                >
                  {z.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="bron-sana" className={LABEL}>
              {BOOKING.labels.date}
            </label>
            <input id="bron-sana" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={FIELD} />
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="bron-vaqt" className={LABEL}>
              {BOOKING.labels.time}
            </label>
            <div className="relative">
              <select
                id="bron-vaqt"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={cn(FIELD, "cursor-pointer appearance-none pr-11")}
              >
                {BOOKING.times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <IconChevronDown className="pointer-events-none absolute right-3.5 top-3.5 text-muted" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Stepper
            labelId="hours-label"
            label={BOOKING.labels.duration}
            value={`${hours} ${BOOKING.units.hours}`}
            decLabel={BOOKING.steppers.hoursDec}
            incLabel={BOOKING.steppers.hoursInc}
            canDec={hours > BOOKING.hours.min}
            canInc={hours < BOOKING.hours.max}
            onDec={() => changeHours(-1)}
            onInc={() => changeHours(1)}
          />
          <Stepper
            labelId="players-label"
            label={BOOKING.labels.players}
            value={`${players} ${BOOKING.units.players}`}
            decLabel={BOOKING.steppers.playersDec}
            incLabel={BOOKING.steppers.playersInc}
            canDec={players > BOOKING.players.min}
            canInc={players < BOOKING.players.max}
            onDec={() => changePlayers(-1)}
            onInc={() => changePlayers(1)}
          />
        </div>

        <div className="flex items-center gap-4 rounded-[12px] border border-line bg-ground px-4 py-3.5" aria-live="polite">
          <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-btn border border-lime/70 text-lime">
            <IconMonitor size={22} />
          </span>
          {seat ? (
            <div className="flex flex-col gap-0.5">
              <p className={LABEL}>{BOOKING.labels.selectedSeat}</p>
              <p className="text-[16px] font-semibold leading-[1.4] text-ink">
                Joy {seat} · {zoneName} zona
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              <p className={LABEL}>{BOOKING.noSeatTitle}</p>
              <p className="text-[15px] leading-[1.4] text-muted">{BOOKING.noSeatText}</p>
            </div>
          )}
        </div>

        <dl className="flex flex-col">
          <SummaryRow term={BOOKING.labels.zone}>{zoneName}</SummaryRow>
          <SummaryRow term={BOOKING.labels.seat} mono>
            {seat ?? "—"}
          </SummaryRow>
          <SummaryRow term={BOOKING.labels.dateTime} mono>
            <PhText text={`${dateText} · ${time}`} />
          </SummaryRow>
          <SummaryRow term={BOOKING.labels.duration}>{hours} {BOOKING.units.hours}</SummaryRow>
          <SummaryRow term={BOOKING.labels.players}>{players} {BOOKING.units.players}</SummaryRow>
          <div className="flex items-center justify-between gap-4 pt-4">
            <dt className="font-display text-[18px] font-bold leading-[1.3] text-ink">{BOOKING.totalLabel}</dt>
            <dd className="flex items-center gap-2 text-right font-mono text-[16px] font-bold leading-[1.4] text-muted">
              <PhText text={total} chipClassName="px-2 py-0.5 text-[15px] font-bold text-ink" />
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" block disabled={!seat} aria-describedby="bron-hint" iconRight={<IconArrowRight />}>
            {BOOKING.submit}
          </Button>
          <p id="bron-hint" className="text-center text-[14px] leading-[1.5] text-muted">
            <PhText text={seat ? BOOKING.submitHint : BOOKING.submitDisabledHint} />
          </p>
        </div>
      </form>

      {/* ---------- confirmation (focus moves to its heading) ---------- */}
      <div
        inert={!confirmed}
        className={cn(
          "col-start-1 row-start-1 flex flex-col justify-center gap-8 transition-[opacity,visibility,translate] duration-500 ease-out-expo",
          confirmed ? "visible translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0",
        )}
      >
        <div aria-hidden="true" className="size-24 [perspective:400px]">
          <div
            className="flex size-24 items-center justify-center rounded-card border border-lime bg-lime/[0.08] text-lime shadow-glow transition-transform duration-700 ease-out-expo"
            style={{ transform: confirmed ? "rotateX(18deg) rotateY(-26deg)" : "rotateX(60deg) rotateY(-200deg) scale(.6)" }}
          >
            <IconCheck size={44} />
          </div>
        </div>
        {confirmed ? (
          <>
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[13px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-lime">
                {BOOKING.doneTitle}
              </p>
              <h3
                ref={doneTitle}
                tabIndex={-1}
                className="font-display text-[clamp(24px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.02em] text-ink outline-none"
              >
                {BOOKING.doneText}
              </h3>
              <p className="text-[17px] leading-[1.55] text-muted">
                <PhText text={BOOKING.doneHint} />
              </p>
            </div>
            <dl className="grid grid-cols-1 gap-4 rounded-[12px] border border-line bg-ground p-5 sm:grid-cols-2">
              <DoneItem term={BOOKING.labels.zone}>{zoneName}</DoneItem>
              <DoneItem term={BOOKING.labels.seat} mono>
                {seat ?? "—"}
              </DoneItem>
              <DoneItem term={BOOKING.labels.dateTime} mono>
                <PhText text={`${dateText} · ${time}`} />
              </DoneItem>
              <DoneItem term={BOOKING.labels.duration}>
                {hours} {BOOKING.units.hours} · {players} {BOOKING.units.players}
              </DoneItem>
            </dl>
            <Button variant="secondary" onClick={onReset} className="self-start">
              {BOOKING.newBooking}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

interface StepperProps {
  labelId: string;
  label: string;
  value: string;
  decLabel: string;
  incLabel: string;
  canDec: boolean;
  canInc: boolean;
  onDec: () => void;
  onInc: () => void;
}

function Stepper({ labelId, label, value, decLabel, incLabel, canDec, canInc, onDec, onInc }: StepperProps) {
  const btn =
    "flex w-12 shrink-0 items-center justify-center text-ink transition-colors hover:bg-raised focus-visible:outline-offset-[-3px] disabled:cursor-not-allowed disabled:text-dim disabled:opacity-45 disabled:hover:bg-transparent";
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-col gap-2.5">
      <p id={labelId} className={LABEL}>
        {label}
      </p>
      <div className="flex h-12 items-stretch overflow-hidden rounded-btn border border-[#353B4E] bg-ground">
        <button type="button" aria-label={decLabel} disabled={!canDec} onClick={onDec} className={btn}>
          <IconMinus />
        </button>
        <output aria-live="polite" className="flex flex-1 items-center justify-center border-x border-line font-mono text-[16px] font-bold text-ink">
          {value}
        </output>
        <button type="button" aria-label={incLabel} disabled={!canInc} onClick={onInc} className={btn}>
          <IconPlus />
        </button>
      </div>
    </div>
  );
}

function SummaryRow({ term, mono, children }: { term: string; mono?: boolean; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-line py-[9px]">
      <dt className="text-[15px] leading-[1.5] text-muted">{term}</dt>
      <dd className={cn("text-right leading-[1.5] text-ink", mono ? "font-mono text-[14px] font-bold" : "text-[15px] font-semibold")}>
        {children}
      </dd>
    </div>
  );
}

function DoneItem({ term, mono, children }: { term: string; mono?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className={LABEL}>{term}</dt>
      <dd className={cn("leading-[1.4] text-ink", mono ? "font-mono text-[15px] font-bold" : "text-[16px] font-semibold")}>
        {children}
      </dd>
    </div>
  );
}
