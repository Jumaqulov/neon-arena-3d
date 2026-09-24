import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Reveal from "@/components/motion/Reveal";
import { PhText } from "@/components/ui/Placeholder";

export interface NumberedHeadingProps {
  /** heading id (the section's aria-labelledby) */
  id: string;
  /** "01 Turnirlar jadvali" — leading number is drawn lime, the rest may hold [TOKENS] */
  eyebrow: string;
  /** broken after the first word, as in the mockup ("Turnirlar / ro‘yxati") */
  title: string;
  /** right-hand block from lg (lead, counters, switchers) */
  aside?: ReactNode;
  className?: string;
}

/**
 * Tournaments-page section header: "01 ── Label" eyebrow + two-line display title,
 * with an optional right-aligned aside. The text block rises in with a staggered 3D reveal.
 */
export default function NumberedHeading({ id, eyebrow, title, aside, className }: NumberedHeadingProps) {
  const cut = eyebrow.indexOf(" ");
  const num = cut === -1 ? eyebrow : eyebrow.slice(0, cut);
  const label = cut === -1 ? "" : eyebrow.slice(cut + 1);
  const sp = title.indexOf(" ");
  const line1 = sp === -1 ? title : title.slice(0, sp);
  const line2 = sp === -1 ? "" : title.slice(sp + 1);

  return (
    <header
      className={cn(
        "flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12",
        className,
      )}
    >
      <Reveal variant="rise" stagger={0.1} className="flex flex-col gap-4">
        <p className="eyebrow flex items-center gap-3">
          <span className="text-lime">{num}</span>
          <span aria-hidden="true" className="h-px w-8 shrink-0 bg-line" />
          <span>
            <PhText text={label} />
          </span>
        </p>
        <h2 id={id} className="display-lg text-ink">
          <span className="block">{line1}</span>
          {line2 ? (
            <>
              {" "}
              <span className="block">{line2}</span>
            </>
          ) : null}
        </h2>
      </Reveal>
      {aside ? (
        <Reveal
          variant="fade"
          delay={0.15}
          className="flex flex-col gap-4 lg:max-w-[440px] lg:items-end lg:text-right"
        >
          {aside}
        </Reveal>
      ) : null}
    </header>
  );
}
