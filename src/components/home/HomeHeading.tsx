import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";
import { PhText } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";

export interface HomeHeadingProps {
  id: string;
  /** lime mono label, e.g. "01 / Zonalar va narxlar" */
  eyebrow: string;
  title: ReactNode;
  /** muted paragraph (placeholders auto-chipped) */
  lead?: string;
  /** "side" = right-hand column from md (default), "below" = under the title */
  leadPlacement?: "side" | "below";
  /** right-hand slot (e.g. "Barchasi" button) */
  action?: ReactNode;
  className?: string;
}

/**
 * Home section header as drawn in Main.dc.html: lime mono eyebrow + Unbounded 700 title on the
 * left, muted lead on the right from lg (an action-only slot from md). 3D staggered rise on enter.
 */
export default function HomeHeading({
  id,
  eyebrow,
  title,
  lead,
  leadPlacement = "side",
  action,
  className,
}: HomeHeadingProps) {
  const leadEl = lead ? (
    <p className="max-w-[640px] text-[17px] leading-[1.55] text-muted">
      <PhText text={lead} />
    </p>
  ) : null;
  const side = leadPlacement === "side" ? leadEl : null;
  // A side lead needs ~420px: split into two columns only from lg (at md the title column
  // would shrink to ~220px). An action-only side slot is narrow, so it can sit beside from md.
  const split = side ? "lg" : "md";

  return (
    <header
      className={cn(
        "flex flex-col gap-6",
        split === "lg"
          ? "lg:flex-row lg:items-end lg:justify-between lg:gap-12"
          : "md:flex-row md:items-end md:justify-between md:gap-12",
        className,
      )}
    >
      <Reveal variant="rise" stagger={0.1} className="flex max-w-[820px] flex-col gap-4 md:gap-5">
        <p className="font-mono text-[13px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-lime">
          <PhText text={eyebrow} />
        </p>
        <h2
          id={id}
          className="text-balance font-display text-[clamp(30px,3.5vw,48px)] font-bold leading-[1.08] tracking-[-0.02em] text-ink"
        >
          {title}
        </h2>
        {leadPlacement === "below" ? leadEl : null}
      </Reveal>
      {side || action ? (
        <Reveal variant="fade" delay={0.15} className={cn(
            "flex shrink-0 flex-col items-start gap-5",
            split === "lg" ? "lg:max-w-[420px]" : "md:max-w-[420px]",
          )}>
          {side}
          {action}
        </Reveal>
      ) : null}
    </header>
  );
}
