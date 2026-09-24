import type { ReactNode } from "react";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import Reveal from "@/components/motion/Reveal";
import SectionHeading from "./SectionHeading";

/** TEMPORARY scaffold used by placeholder routes until page engineers replace them. */
export default function PagePlaceholder({
  word,
  eyebrow,
  title,
  lead,
  children,
}: {
  word: string;
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby="page-title" className="page-top section-y relative isolate overflow-hidden">
      <BigOutlineWord word={word} className="top-24 -left-6" />
      <div className="container-page relative z-10 flex flex-col gap-12">
        <SectionHeading as="h1" id="page-title" eyebrow={eyebrow} title={title} lead={lead} size="display-xl" />
        {children ? <Reveal variant="flip" stagger>{children}</Reveal> : null}
      </div>
    </section>
  );
}
