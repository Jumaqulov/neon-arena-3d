import type { ReactNode } from "react";
import Reveal from "@/components/motion/Reveal";

export interface GameSectionHeadingProps {
  /** lime counter, e.g. "01" */
  num: string;
  /** mono label after the counter, e.g. "Klubda CS2" */
  label: string;
  /** heading id (for aria-labelledby) */
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  as?: "h1" | "h2";
}

/** Mockup-style section header: "01 —— LABEL", big Unbounded title, lead on the right. */
export default function GameSectionHeading({ num, label, id, title, lead, as: H = "h2" }: GameSectionHeadingProps) {
  return (
    <Reveal
      as="header"
      variant="rise"
      stagger={0.1}
      className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12"
    >
      <div className="flex flex-col gap-4">
        <p className="flex items-center gap-3 font-mono text-[13px] font-bold uppercase leading-[1.4] tracking-[0.08em] text-ink">
          <span className="text-lime">{num}</span>
          <span aria-hidden="true" className="h-px w-7 bg-line-strong" />
          {label}
        </p>
        <H id={id} className="display-lg max-w-[680px] text-balance text-ink" style={{ fontSize: "clamp(30px, 3.4vw, 48px)" }}>
          {title}
        </H>
      </div>
      {lead ? <p className="max-w-[440px] text-[17px] leading-[1.55] text-muted">{lead}</p> : null}
    </Reveal>
  );
}
