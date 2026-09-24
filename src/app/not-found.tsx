import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import { IconArrowRight } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Sahifa topilmadi",
};

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="page-top section-y relative isolate min-h-[70svh] overflow-hidden">
      <BigOutlineWord word="404" className="top-24 right-0" />
      <div className="container-page relative z-10 flex flex-col items-start gap-8">
        <p className="eyebrow">Xato 404</p>
        <h1 id="nf-title" className="display-xl max-w-[900px]">
          Bu sahifa arenada yo‘q
        </h1>
        <p className="lead max-w-[560px]">Havola eskirgan yoki manzil noto‘g‘ri yozilgan. Bosh sahifaga qayting.</p>
        <ButtonLink href="/" size="lg" iconRight={<IconArrowRight />}>
          Bosh sahifa
        </ButtonLink>
      </div>
    </section>
  );
}
