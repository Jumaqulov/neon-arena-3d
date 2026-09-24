import { PACKAGES } from "@/lib/data";
import Reveal from "@/components/motion/Reveal";
import { PhText } from "@/components/ui/Placeholder";

/** "Paketlar" strip under the zone cards (prices stay [NARX]). Cells flip in one after another. */
export default function PackagesStrip() {
  return (
    <Reveal
      as="ul"
      variant="flip"
      stagger
      className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
    >
      <li className="flex flex-col gap-2 bg-surface px-6 py-6 md:px-7">
        <p className="font-mono text-[12px] font-medium uppercase leading-[1.4] tracking-[0.08em] text-lime">
          {PACKAGES.eyebrow}
        </p>
        <p className="text-[16px] font-medium leading-[1.5] text-ink">{PACKAGES.title}</p>
      </li>
      {PACKAGES.items.map((p) => (
        <li key={p.name} className="flex flex-col gap-2 bg-surface px-6 py-6 md:px-7">
          <p className="text-[15px] leading-[1.4] text-muted">
            <PhText text={p.name} chipClassName="text-[13px]" />
          </p>
          <p className="flex items-baseline gap-2 leading-[1.4]">
            <PhText text={p.price} chipClassName="px-2 py-0.5 text-[16px] font-bold text-ink" />
            <span className="text-[13px] text-muted">{p.unit}</span>
          </p>
        </li>
      ))}
    </Reveal>
  );
}
