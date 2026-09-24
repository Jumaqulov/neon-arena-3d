import { cn } from "@/lib/cn";
import { TOURNAMENTS_PAGE, TOURNAMENT_STATUS_LABEL, type GameSlug, type Tournament } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";
import Tilt from "@/components/motion/Tilt";
import Tag from "@/components/ui/Tag";
import { GameArtImage } from "@/components/ui/GameArtImage";
import { IconCheck, IconEye } from "@/components/ui/Icon";
import { Placeholder, PhText } from "@/components/ui/Placeholder";
import HashLink from "./HashLink";

const L = TOURNAMENTS_PAGE;

/** Live cards watch the club stream (TOURNAMENTS_PAGE.streamHref; the hero live strip until set). */
const STREAM_HREF = L.streamHref as `#${string}`;

const GHOST_ACTION =
  "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-btn border border-ink/30 text-[15px] font-semibold no-underline transition-[border-color,background-color,color] duration-200 hover:border-ink hover:bg-ink/[0.06]";

/**
 * Rendered width of the 1920x620 key art in the 148px cover. Cards are 1 col → md 2 → lg 3
 * (≤459px wide from md up); while the cover is narrower than 148 × 1920/620 ≈ 459px the art is
 * height-bound (459px wide, sides cropped), wider covers (single column ≥491px) are width-bound.
 */
const HERO_SIZES =
  "(min-width: 768px) 459px, (min-width: 640px) calc(100vw - 48px), (min-width: 491px) calc(100vw - 32px), 459px";

/**
 * Focal point (CSS object-position, for GameArtImage `position`) of each wide key art in the
 * short cover (default: centre, heads kept in frame).
 */
const HERO_FOCUS: Partial<Record<GameSlug, string>> = {
  // the two operators stand on the right of the art
  "counter-strike-2": "85% 30%",
  "apex-legends": "80% 30%",
};

export interface TournamentCardProps {
  t: Tournament;
  registered: boolean;
  onToggle: (id: string) => void;
}

/**
 * One tournament: cover (the game's official key art under a ground scrim, or — for games
 * without artwork — the typographic grid + circuit line + outlined game code at depth),
 * status/format chips, facts, slots bar and the status action.
 * The <li> wrapper (TournamentList) is the GSAP flip target; Tilt lives inside it.
 */
export default function TournamentCard({ t, registered, onToggle }: TournamentCardProps) {
  const titleId = `turnir-${t.id}`;
  const isLive = t.status === "jonli";
  const isUp = t.status === "kelayotgan";
  const isDone = t.status === "yakunlangan";
  const hasArt = Boolean(getGameArt(t.game));

  return (
    <article aria-labelledby={titleId} className="flex h-full">
      <Tilt
        max={8}
        scale={1.015}
        glare
        className="group flex flex-1 flex-col rounded-card border border-line bg-surface shadow-card transition-[border-color,box-shadow] duration-300 hover:border-lime/55 hover:shadow-card-hover"
      >
        {/* cover (decorative: the game is named in text below, hence alt="") */}
        {hasArt ? (
          <div
            aria-hidden="true"
            className="relative h-[148px] shrink-0 overflow-hidden rounded-t-[15px] border-b border-line bg-[#0D0F15]"
          >
            <GameArtImage
              slug={t.game}
              kind="hero"
              alt=""
              sizes={HERO_SIZES}
              position={HERO_FOCUS[t.game] ?? "50% 30%"}
            />
            {/* ground scrim: seats the art in the dark UI behind the chips; lifts on hover */}
            <span className="absolute inset-0 bg-ground/45 transition-colors duration-300 group-hover:bg-ground/20" />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="relative h-[148px] shrink-0 overflow-hidden rounded-t-[15px] border-b border-line bg-[#0D0F15]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(196,248,42,.07) 0px, rgba(196,248,42,.07) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(90deg, rgba(196,248,42,.07) 0px, rgba(196,248,42,.07) 1px, transparent 1px, transparent 28px)",
            }}
          >
            <svg
              className="absolute inset-0 size-full text-lime/[0.22] transition-colors duration-300 group-hover:text-lime/55"
              viewBox="0 0 400 148"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0 128 L120 128 L168 72 L400 72"
                stroke="currentColor"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span className="absolute left-[42%] top-[48.6%] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/[0.22] bg-[#0D0F15] transition-colors duration-300 group-hover:border-lime/55" />
          </div>
        )}

        {/* layered: outlined game code, floats nearest when tilted (typographic covers only —
            over key art the outline would only add noise; the art names the game) */}
        {hasArt ? null : (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-5 top-[58px] font-display text-[64px] font-extrabold leading-none tracking-[-0.04em] text-transparent [-webkit-text-stroke:1.25px_rgba(196,248,42,.5)] group-hover:[-webkit-text-stroke-color:rgba(196,248,42,.9)] sm:text-[72px]"
            style={{ transform: "translateZ(48px)" }}
          >
            {t.code}
          </span>
        )}

        {/* layered: chips */}
        <div
          className="absolute inset-x-5 top-5 flex items-center justify-between gap-3"
          style={{ transform: "translateZ(28px)" }}
        >
          {/* dark backing keeps the translucent chips legible over the key art / grid cover */}
          <span className="inline-flex rounded-chip bg-ground/85">
            <Tag tone={isLive ? "live" : isUp ? "lime" : "muted"} dot={isLive}>
              {TOURNAMENT_STATUS_LABEL[t.status]}
            </Tag>
          </span>
          <span className="inline-flex rounded-chip bg-ground/85">
            <Tag>{t.format}</Tag>
          </span>
        </div>

        {/* body */}
        <div className="flex flex-1 flex-col gap-5 p-6" style={{ transform: "translateZ(14px)" }}>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{t.gameLabel}</p>
            <h3 id={titleId} className="display-sm text-ink">
              {t.name}
              {t.namePh ? <Placeholder>{t.namePh}</Placeholder> : null}
            </h3>
          </div>

          <dl className="grid grid-cols-3 gap-3 border-y border-line py-3.5">
            {(
              [
                [L.cardLabels.date, t.date],
                [L.cardLabels.time, t.time],
                [L.cardLabels.prize, t.prize],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex min-w-0 flex-col gap-1.5">
                <dt className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">{label}</dt>
                <dd className="font-mono text-[14px] text-muted">
                  <PhText text={value} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[14px] text-muted">{L.cardLabels.slots}</span>
              <span className="font-mono text-[14px] font-medium text-ink">
                <PhText text={t.slots} />
              </span>
            </div>
            <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-line">
              <div
                data-fill
                className={cn("h-full rounded-full", isDone ? "bg-line-strong" : "bg-lime")}
                style={{ width: `${Math.round(t.fill * 100)}%` }}
              />
            </div>
          </div>

          {isUp ? (
            <button
              type="button"
              aria-pressed={registered}
              aria-describedby={titleId}
              onClick={() => onToggle(t.id)}
              className={cn(
                "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-btn border text-[15px] font-semibold transition-[background-color,color,border-color,box-shadow,filter] duration-200",
                registered
                  ? "border-lime/60 bg-transparent text-lime hover:bg-lime/[0.08]"
                  : "border-lime bg-lime text-ground shadow-glow hover:brightness-[1.08]",
              )}
            >
              {registered ? <IconCheck /> : null}
              <span>{registered ? L.registered : L.register}</span>
            </button>
          ) : null}

          {isLive ? (
            <HashLink href={STREAM_HREF} aria-describedby={titleId} className={cn(GHOST_ACTION, "bg-raised text-ink")}>
              <IconEye />
              <span>{L.watch}</span>
            </HashLink>
          ) : null}

          {isDone ? (
            <HashLink
              href="#reyting"
              aria-describedby={titleId}
              className={cn(GHOST_ACTION, "bg-transparent text-muted hover:text-ink")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M5 20V10M12 20V4M19 20v-7" />
              </svg>
              <span>{L.results}</span>
            </HashLink>
          ) : null}
        </div>
      </Tilt>
    </article>
  );
}
