import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "@/components/motion/Reveal";
import { PhText } from "./Placeholder";

export interface SectionHeadingProps {
  /** mono label above the title, e.g. "01 / Zonalar va narxlar" (placeholders auto-chipped) */
  eyebrow?: string;
  /** the heading content */
  title: ReactNode;
  /** paragraph under the title (string → placeholders auto-chipped) */
  lead?: ReactNode;
  /** heading level. Default "h2". Use "h1" only once per page. */
  as?: "h1" | "h2" | "h3";
  /** id for the heading (use with <section aria-labelledby={id}>) */
  id?: string;
  /** Default "left". */
  align?: "left" | "center";
  /** right-side slot on desktop (e.g. a "Barchasi" ButtonLink) */
  action?: ReactNode;
  /** title size utility. Default "display-lg". */
  size?: "display-2xl" | "display-xl" | "display-lg" | "display-md";
  /** 3D staggered reveal of eyebrow/title/lead. Default true. */
  reveal?: boolean;
  className?: string;
}

/**
 * Section header: lime-diamond eyebrow + Unbounded title + muted lead (+ optional action).
 *   <SectionHeading id="zones-title" eyebrow="01 / Zonalar va narxlar" title="Har bir o‘yinchiga — o‘z zonasi" lead="…" />
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  as: H = "h2",
  id,
  align = "left",
  action,
  size = "display-lg",
  reveal = true,
  className,
}: SectionHeadingProps) {
  const center = align === "center";
  const textBlock = (
    <>
      {eyebrow ? (
        <p className={cn("eyebrow flex items-center gap-3", center && "justify-center")}>
          <span aria-hidden="true" className="size-2 shrink-0 rotate-45 bg-lime shadow-glow" />
          <span>
            <PhText text={eyebrow} />
          </span>
        </p>
      ) : null}
      <H id={id} className={cn(size, "text-ink text-balance")}>
        {title}
      </H>
      {lead ? (
        <p className={cn("lead max-w-[640px]", center && "mx-auto")}>
          {typeof lead === "string" ? <PhText text={lead} /> : lead}
        </p>
      ) : null}
    </>
  );

  const inner = reveal ? (
    <Reveal variant="rise" stagger={0.1} className={cn("flex flex-col gap-5", center && "items-center text-center")}>
      {textBlock}
    </Reveal>
  ) : (
    <div className={cn("flex flex-col gap-5", center && "items-center text-center")}>{textBlock}</div>
  );

  return (
    <header
      className={cn(
        "flex flex-col gap-8",
        !!action && !center && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      {inner}
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
