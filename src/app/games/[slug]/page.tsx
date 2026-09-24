import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";
import GameShowcase from "@/components/games/GameShowcase";
import GameTabs from "@/components/games/GameTabs";
import OtherGames from "@/components/games/OtherGames";

/** Only the games in data.ts exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return GAMES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/games/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  const konsol = game.zones.includes("konsol");
  const pc = game.zones.some((z) => z !== "konsol");
  // where the game is actually played: console-only games must not claim the club PCs
  const where = pc
    ? konsol
      ? "klub kompyuterlarida va Konsol zonasida"
      : "klub kompyuterlarida"
    : "Konsol zonasida katta ekranda";
  const description = `${game.title} NEON ARENA ${where}: zonalar, talablar va turnirlar. ${game.tagline}`;
  // share image: the official wide key art (static import → hashed, immutable URL + real size).
  // The path is relative: it resolves against the root layout's metadataBase.
  const hero = getGameArt(game.slug)?.hero;
  const images = hero ? [{ url: hero.src, width: hero.width, height: hero.height, alt: `${game.title} rasmi` }] : undefined;
  return {
    title: game.title,
    description,
    openGraph: {
      title: `${game.title} — NEON ARENA`,
      description,
      locale: "uz_UZ",
      type: "website",
      ...(images ? { images } : {}),
    },
    ...(images ? { twitter: { card: "summary_large_image", images } } : {}),
  };
}

export default async function GamePage({ params }: PageProps<"/games/[slug]">) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  return (
    <>
      <GameShowcase slug={game.slug} />
      <GameTabs slug={game.slug} />
      <OtherGames currentSlug={game.slug} />
    </>
  );
}
