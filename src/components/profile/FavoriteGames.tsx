import Link from "next/link";
import { getGame, PROFILE, type Game } from "@/lib/data";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import Tilt from "@/components/motion/Tilt";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { PhText } from "@/components/ui/Placeholder";
import Tag from "@/components/ui/Tag";
import { IconArrowRight, IconArrowUpRight } from "@/components/ui/Icon";
import GameCoverArt from "./GameCoverArt";

const F = PROFILE.favorites;

/**
 * "Sevimli o‘yinlar": game tiles (official cover art, or our typographic cover when a game has
 * none) that flip in (staggered 3D) on scroll and tilt under the pointer with layered depth
 * (tag / title float above the cover). Two columns from sm keep the 600px-wide covers from
 * being upscaled on single-column tablet widths. Server Component.
 */
export default function FavoriteGames() {
  const games = F.games.map((slug) => getGame(slug)).filter((g): g is Game => Boolean(g));

  return (
    <section
      aria-labelledby="fav-title"
      className="relative isolate overflow-hidden pb-20 pt-14 md:pb-28 md:pt-16 xl:pb-32"
    >
      <BigOutlineWord word="O‘YIN" tone="line" className="bottom-0 right-0" speed={0.3} />
      <Parallax
        speed={0.45}
        aria-hidden="true"
        className="pointer-events-none absolute left-[46%] top-10 z-0 hidden md:block"
      >
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" stroke="#C4F82A" strokeOpacity={0.2}>
          <circle cx="60" cy="60" r="58" />
          <circle cx="60" cy="60" r="36" strokeDasharray="2 6" />
        </svg>
      </Parallax>

      <div className="container-page relative z-10 flex flex-col gap-10 md:gap-12">
        <SectionHeading
          id="fav-title"
          eyebrow={F.eyebrow}
          title={F.title}
          lead={F.lead}
          action={
            <ButtonLink href="/oyinlar" variant="secondary" size="lg" iconRight={<IconArrowRight />}>
              {F.all}
            </ButtonLink>
          }
        />

        <Reveal as="ul" variant="flip" stagger={0.12} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <li key={g.slug}>
              <Tilt max={8} scale={1.02} glare className="h-[360px] rounded-card sm:h-[400px]">
                <Link
                  href={`/oyinlar/${g.slug}`}
                  className="group/game absolute inset-0 block rounded-card text-ink no-underline [transform-style:preserve-3d]"
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 overflow-hidden rounded-card border border-line bg-surface shadow-[0_24px_50px_rgba(0,0,0,.45)] transition-colors duration-300 group-hover/game:border-lime/40"
                  >
                    <GameCoverArt game={g} />
                  </div>
                  <div className="absolute left-6 top-6 [transform:translateZ(36px)]">
                    <Tag>{g.genreLabel}</Tag>
                  </div>
                  <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 [transform:translateZ(56px)]">
                    <div className="flex min-w-0 flex-col gap-2">
                      <h3 className="font-display text-[20px] font-bold leading-[1.2] tracking-[-0.01em] text-ink sm:text-[22px]">
                        {g.title}
                      </h3>
                      <p className="font-mono text-[13px] font-medium tracking-[0.04em] text-muted">
                        <PhText text={F.played} />
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="flex size-12 shrink-0 items-center justify-center rounded-btn border border-lime/50 bg-ground text-lime transition-[translate] duration-200 group-hover/game:-translate-y-[3px] group-hover/game:translate-x-[3px]"
                    >
                      <IconArrowUpRight />
                    </span>
                  </div>
                </Link>
              </Tilt>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
