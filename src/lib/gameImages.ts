import type { StaticImageData } from "next/image";
import type { GameSlug } from "@/lib/data";

import apexCover from "@/assets/games/apex-legends-cover.jpg";
import apexHero from "@/assets/games/apex-legends-hero.jpg";
import cs2Cover from "@/assets/games/counter-strike-2-cover.jpg";
import cs2Hero from "@/assets/games/counter-strike-2-hero.jpg";
import dotaCover from "@/assets/games/dota-2-cover.jpg";
import dotaHero from "@/assets/games/dota-2-hero.jpg";
import mk1Cover from "@/assets/games/mortal-kombat-1-cover.jpg";
import mk1Hero from "@/assets/games/mortal-kombat-1-hero.jpg";
import pubgCover from "@/assets/games/pubg-cover.jpg";
import pubgHero from "@/assets/games/pubg-hero.jpg";
import valorantCover from "@/assets/games/valorant-cover.jpg";
import valorantHero from "@/assets/games/valorant-hero.jpg";
import fcCover from "@/assets/games/ea-sports-fc-cover.jpg";
import fcHero from "@/assets/games/ea-sports-fc-hero.jpg";
import fortniteCover from "@/assets/games/fortnite-cover.jpg";
import fortniteHero from "@/assets/games/fortnite-hero.jpg";

/**
 * Official artwork (Steam / Xbox store assets), optimized by `npm run images:optimize`.
 * `cover` is portrait 600x900 (2:3, includes the game logo), `hero` is wide
 * 1920x620 key art. Every catalog game has both images.
 * Static imports give next/image the size and a blur placeholder for free.
 */
export interface GameArt {
  cover: StaticImageData;
  hero: StaticImageData;
}

const GAME_ART: Record<GameSlug, GameArt> = {
  "counter-strike-2": { cover: cs2Cover, hero: cs2Hero },
  "dota-2": { cover: dotaCover, hero: dotaHero },
  pubg: { cover: pubgCover, hero: pubgHero },
  "apex-legends": { cover: apexCover, hero: apexHero },
  "mortal-kombat-1": { cover: mk1Cover, hero: mk1Hero },
  valorant: { cover: valorantCover, hero: valorantHero },
  "ea-sports-fc": { cover: fcCover, hero: fcHero },
  fortnite: { cover: fortniteCover, hero: fortniteHero },
};

export function getGameArt(slug: GameSlug): GameArt | undefined {
  return GAME_ART[slug];
}
