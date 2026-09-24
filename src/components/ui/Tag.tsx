import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TagTone = "default" | "lime" | "solid" | "live" | "muted";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: TagTone;
  /** show a pulsing dot before the label (red for "live", lime otherwise) */
  dot?: boolean;
  children: ReactNode;
}

const TONES: Record<TagTone, string> = {
  default: "border-line text-ink bg-surface",
  lime: "border-lime/45 text-lime bg-lime/[0.06]",
  solid: "border-lime bg-lime text-ground",
  live: "border-live/55 text-ink bg-live/[0.08]",
  muted: "border-line text-muted bg-transparent",
};

/**
 * Small mono uppercase chip (radius 4px) for genres, formats, statuses.
 *   <Tag tone="live" dot>Jonli</Tag>   <Tag tone="lime">5v5</Tag>
 */
export default function Tag({ tone = "default", dot = false, className, children, ...rest }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 whitespace-nowrap rounded-chip border px-2.5 font-mono text-[12px] font-medium uppercase leading-none tracking-[0.08em]",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full animate-pulse-live",
            tone === "live" ? "bg-live" : "bg-lime shadow-glow",
          )}
        />
      ) : null}
      {children}
    </span>
  );
}
