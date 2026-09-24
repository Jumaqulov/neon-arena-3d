"use client";

import { useRef, type FormEvent } from "react";
import { GAMES, PROFILE, type GameSlug } from "@/lib/data";
import { EASE, gsap, MQ, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PhText } from "@/components/ui/Placeholder";
import { IconArrowRight, IconCheck, IconChevronDown } from "@/components/ui/Icon";
import { CssHoloCube } from "@/components/three/fallbacks";

const S = PROFILE.settings;
const M = PROFILE.membership;
const PHONE_PLACEHOLDER = "[TELEFON]";
const PRICES_HREF = "/#prices";

export interface SettingsValues {
  nick: string;
  phone: string;
  game: GameSlug;
  notify: boolean;
}

export interface SettingsPanelProps {
  values: SettingsValues;
  onChange: (patch: Partial<SettingsValues>) => void;
  saved: boolean;
  onSave: () => void;
}

const FIELD =
  "h-[52px] w-full rounded-btn border border-line bg-ground px-[18px] text-[16px] font-medium text-ink transition-colors duration-200 hover:border-line-strong focus:border-lime";

/** "Sozlamalar" tab: profile form (switch + saved state) and the membership card. */
export default function SettingsPanel({ values, onChange, saved, onSave }: SettingsPanelProps) {
  const rootRef = useRef<HTMLDivElement>(null);

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
        const st = { trigger: root, start: "top 85%", once: true };
        // perspective is SET, not tweened (inside from() it would shrink with the rotation)
        gsap.set(q("[data-set='form'], [data-set='aside']"), { transformPerspective: 1200 });
        // opacity (not autoAlpha): the form must stay focusable — "Profilni tahrirlash"
        // focuses the Nik field while the page is still scrolling here
        gsap.from(q("[data-set='form']"), {
          opacity: 0,
          y: 70 * f,
          rotationX: 16 * f,
          transformOrigin: "50% 100%",
          duration: 1.2,
          ease: EASE.expo,
          scrollTrigger: st,
        });
        gsap.from(q("[data-set='aside']"), {
          opacity: 0,
          x: 80 * f,
          rotationY: -26 * f,
          duration: 1.2,
          delay: 0.12,
          ease: EASE.expo,
          scrollTrigger: st,
        });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div ref={rootRef} className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <form
        data-set="form"
        onSubmit={submit}
        aria-labelledby="settings-title"
        noValidate
        className="flex min-w-0 flex-1 flex-col gap-7 rounded-card border border-line bg-surface p-6 sm:p-9 lg:px-10"
      >
        <div className="flex flex-col gap-2">
          <h3
            id="settings-title"
            className="font-display text-[22px] font-bold leading-[1.2] tracking-[-0.01em] sm:text-[24px]"
          >
            {S.title}
          </h3>
          <p className="text-[16px] leading-[1.55] text-muted">{S.lead}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="set-nick" className="text-[15px] font-semibold text-ink">
              {S.nickLabel}
            </label>
            <input
              id="set-nick"
              type="text"
              value={values.nick}
              onChange={(e) => onChange({ nick: e.target.value })}
              autoComplete="nickname"
              spellCheck={false}
              aria-describedby="set-nick-help"
              className={cn(FIELD, "font-mono")}
            />
            <p id="set-nick-help" className="text-[14px] text-muted">
              {S.nickHint}
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <label htmlFor="set-phone" className="text-[15px] font-semibold text-ink">
              {S.phoneLabel}
            </label>
            <input
              id="set-phone"
              type="tel"
              inputMode="tel"
              value={values.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder={PHONE_PLACEHOLDER}
              autoComplete="tel"
              aria-describedby="set-phone-help"
              className={cn(FIELD, "font-mono")}
            />
            <p id="set-phone-help" className="text-[14px] text-muted">
              {S.phoneHint}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <label htmlFor="set-game" className="text-[15px] font-semibold text-ink">
            {S.gameLabel}
          </label>
          <div className="relative">
            <select
              id="set-game"
              value={values.game}
              onChange={(e) => onChange({ game: e.target.value as GameSlug })}
              className={cn(FIELD, "cursor-pointer appearance-none pr-[52px]")}
            >
              {GAMES.map((g) => (
                <option key={g.slug} value={g.slug} className="bg-surface text-ink">
                  {g.title}
                </option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-[18px] top-4 text-lime" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 border-y border-line py-5">
          <div className="flex min-w-0 flex-col gap-1">
            <span id="notify-label" className="text-[16px] font-semibold text-ink">
              {S.notifyLabel}
            </span>
            <span id="notify-desc" className="text-[14px] leading-[1.5] text-muted">
              {S.notifyHint}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3.5">
            <span
              aria-hidden="true"
              className={cn(
                "hidden font-mono text-[12px] uppercase tracking-[0.08em] sm:inline",
                values.notify ? "font-bold text-lime" : "font-medium text-muted",
              )}
            >
              {values.notify ? S.on : S.off}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={values.notify}
              aria-labelledby="notify-label"
              aria-describedby="notify-desc"
              onClick={() => onChange({ notify: !values.notify })}
              className="relative h-11 w-16 shrink-0 rounded-full"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 top-[5px] h-[34px] rounded-full border transition-[background-color,border-color,box-shadow] duration-200",
                  values.notify ? "border-lime bg-lime shadow-[0_0_18px_rgba(196,248,42,.3)]" : "border-[#3A3F52] bg-raised",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  "absolute left-[5px] top-[10px] size-6 rounded-full transition-[translate,background-color] duration-200 ease-spring",
                  values.notify ? "translate-x-[30px] bg-ground" : "translate-x-0 bg-muted",
                )}
              />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <Button type="submit" size="lg">
            {S.save}
          </Button>
          <div role="status" aria-live="polite" className={cn(!saved && "sr-only")}>
            {saved ? (
              <p className="inline-flex items-center gap-2 text-[16px] font-medium text-lime">
                <IconCheck />
                {S.saved}
              </p>
            ) : null}
          </div>
        </div>
      </form>

      <aside
        data-set="aside"
        aria-labelledby="member-title"
        className="relative flex flex-col gap-6 overflow-hidden rounded-card border border-line bg-surface p-7 sm:p-8 lg:w-[392px] lg:shrink-0"
      >
        <CssHoloCube size={44} className="absolute right-9 top-9" />
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{M.title}</p>
          <h3
            id="member-title"
            className="font-display text-[32px] font-extrabold uppercase leading-[1.05] tracking-[-0.02em] text-lime"
          >
            {M.tier}
          </h3>
        </div>
        <dl className="flex flex-col">
          {[
            { label: M.validLabel, value: M.valid },
            { label: M.levelLabel, value: M.level },
            { label: M.bonusLabel, value: M.bonus },
          ].map((row, i, all) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between gap-4 border-t border-line py-3.5",
                i === all.length - 1 && "border-b",
              )}
            >
              <dt className="text-[15px] text-muted">{row.label}</dt>
              <dd className="font-mono text-[15px] font-bold text-ink">
                <PhText text={row.value} />
              </dd>
            </div>
          ))}
        </dl>
        <ButtonLink href={PRICES_HREF} variant="secondary" size="lg" iconRight={<IconArrowRight />}>
          {M.cta}
        </ButtonLink>
      </aside>
    </div>
  );
}
