import { PROFILE, type Achievement } from "@/lib/data";
import { cn } from "@/lib/cn";
import { ACHIEVEMENT_ICONS, IconCheck, IconLock } from "@/components/ui/Icon";
import { PhText } from "@/components/ui/Placeholder";
import s from "./profile.module.css";

const L = PROFILE.achievementsSection;
/** coin thickness: 7 rim slices, ±5px of a 176px coin (in cqw) */
const RIM_Z = [-2.841, -1.875, -0.966, 0, 0.966, 1.875, 2.841];

export interface AchievementCoinProps {
  achievement: Achievement;
  /** position in the grid (sway phase offset) */
  index: number;
  flipped: boolean;
  onToggle: () => void;
}

/**
 * Achievement tile: a real 3D coin (rim slices + face + back) inside a toggle button.
 * Front = icon, back = unlock condition. Unlocked coins sway slowly (time); the flip is
 * a CSS transition; the scroll "coin-spin" entrance is driven by AchievementsPanel on the
 * `data-ach="spin"` layer. Node order (one transform owner each):
 *   spin (GSAP) > sway (CSS animation) > flip (CSS transition)
 */
export default function AchievementCoin({ achievement: a, index, flipped, onToggle }: AchievementCoinProps) {
  const Icon = ACHIEVEMENT_ICONS[a.icon];
  const status = a.unlocked ? L.unlocked : L.locked;

  return (
    <button
      type="button"
      data-ach="tile"
      aria-pressed={flipped}
      aria-label={`${a.name}. ${status}. ${L.condLabel}: ${a.cond}`}
      onClick={onToggle}
      className="flex w-full flex-col items-center gap-3.5 rounded-card border border-line bg-surface px-3 pb-5 pt-6 text-center text-ink transition-colors duration-200 hover:border-lime/55 sm:px-4 sm:pb-6 sm:pt-7"
    >
      <span aria-hidden="true" className={s.coinPersp}>
        <span data-ach="spin" className={s.coin3d}>
          <span
            className={cn(s.coin3d, a.unlocked && s.sway)}
            style={a.unlocked ? { animationDelay: `${(-index * 0.9).toFixed(1)}s` } : undefined}
          >
            <span className={cn(s.coin3d, s.coinFlip)} data-flipped={flipped ? "true" : "false"}>
              {RIM_Z.map((z) => (
                <span
                  key={z}
                  className={cn(s.rim, a.unlocked ? s.rimOn : s.rimOff)}
                  style={{ transform: `translateZ(${z}cqw)` }}
                />
              ))}
              <span className={cn(s.coinFace, a.unlocked ? s.faceOn : s.faceOff)}>
                <span className={s.coinRing} />
                <Icon className={s.coinIcon} strokeWidth={1.5} />
              </span>
              <span className={cn(s.coinBack, a.unlocked && s.backOn)}>
                <span className={s.condLabel}>{L.condLabel}</span>
                <span className={s.condText}>
                  <PhText text={a.cond} />
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>

      <span className="font-display text-[14px] font-bold leading-[1.3] tracking-[-0.01em] text-ink sm:text-[15px]">
        {a.name}
      </span>
      {a.unlocked ? (
        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-lime">
          <IconCheck size={14} />
          {L.unlocked}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
          <IconLock size={14} />
          {L.locked}
        </span>
      )}
    </button>
  );
}
