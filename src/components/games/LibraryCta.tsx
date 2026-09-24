import { BOOKING_HREF } from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrowRight } from "@/components/ui/Icon";
import Reveal from "@/components/motion/Reveal";
import Parallax from "@/components/motion/Parallax";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import { CssGridFloor } from "@/components/three/fallbacks";

/** Closing band of /oyinlar: the grid floor zooms in under the headline as it enters. */
export default function LibraryCta() {
  return (
    <section aria-labelledby="games-cta-title" className="section-y relative isolate overflow-hidden border-t border-line">
      <Parallax speed={0} scale={[1.35, 1]} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[70%]">
        <CssGridFloor className="absolute inset-0" />
      </Parallax>
      <BigOutlineWord word="ARENA" className="top-6 left-0" speed={0.4} tone="line" />
      <div className="container-page relative z-10">
        <Reveal variant="zoom" stagger={0.1} className="mx-auto flex max-w-[920px] flex-col items-center gap-7 text-center">
          <p className="eyebrow flex items-center gap-3">
            <span aria-hidden="true" className="size-2 shrink-0 rotate-45 bg-lime shadow-glow" />
            Keyingi qadam
          </p>
          <h2 id="games-cta-title" className="display-xl text-balance text-ink" style={{ fontSize: "clamp(34px, 5.6vw, 80px)" }}>
            O‘yin tanlandi. <span className="text-lime text-shadow-glow">Endi — joy.</span>
          </h2>
          <p className="lead max-w-[560px]">
            Joyni oldindan band qiling — kelganingizda kompyuter tayyor, o‘yin esa yangilangan bo‘ladi.
          </p>
          <div className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row">
            <ButtonLink href={BOOKING_HREF} size="lg" iconRight={<IconArrowRight />}>
              Joy band qilish
            </ButtonLink>
            <ButtonLink href="/turnirlar" size="lg" variant="secondary">
              Turnirlar
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
