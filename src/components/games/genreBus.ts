/**
 * Tiny window-event bus so a breadcrumb / hero chip can preselect the genre of a
 * GameFilterGrid elsewhere on the same page (client only).
 */
import type { GenreFilter } from "./gameArt";

const EVENT = "neon:games-genre";

export function requestGenre(genre: GenreFilter): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<GenreFilter>(EVENT, { detail: genre }));
}

export function onGenreRequest(cb: (genre: GenreFilter) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<GenreFilter>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
