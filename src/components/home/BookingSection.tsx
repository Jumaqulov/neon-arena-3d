import { BOOKING } from "@/lib/data";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import { CssHoloCube } from "@/components/three/fallbacks";
import HomeHeading from "./HomeHeading";
import SeatMap from "./SeatMap";
import BookingForm from "./BookingForm";

/**
 * 03 / ONLAYN BRON (#booking) — isometric 3D hall plan (rotates in from top-down as it enters)
 * + the full booking request form with its confirmation state.
 */
export default function BookingSection() {
  return (
    <section id="booking" aria-labelledby="booking-title" className="section-y relative isolate overflow-hidden border-t border-line">
      <BigOutlineWord word="BRON" className="-left-4 top-10" speed={0.3} tone="line" />
      <Parallax speed={0.6} className="pointer-events-none absolute right-[5%] top-[14%] z-0 hidden lg:block" aria-hidden="true">
        <CssHoloCube size={64} />
      </Parallax>
      <Parallax speed={-0.25} className="pointer-events-none absolute bottom-[10%] left-[3%] z-0 hidden md:block" aria-hidden="true">
        <CssHoloCube size={40} />
      </Parallax>

      <div className="container-page relative z-10 flex flex-col gap-12 md:gap-14">
        <HomeHeading id="booking-title" eyebrow={BOOKING.eyebrow} title={BOOKING.title} lead={BOOKING.lead} />

        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(380px,1fr)]">
          <SeatMap />
          <Reveal variant="rise" start="top 88%" className="min-w-0">
            <BookingForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
