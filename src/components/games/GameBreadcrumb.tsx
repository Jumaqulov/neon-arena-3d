"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import type { Game } from "@/lib/data";
import { safeQuery, scrollAndFocus } from "@/lib/scroll-store";
import { requestGenre } from "./genreBus";

const CRUMB =
  "inline-flex min-h-11 items-center text-muted no-underline transition-colors duration-200 hover:text-ink";

/**
 * "O‘yinlar / Janr / O‘yin" trail. The genre crumb scrolls to "Boshqa o‘yinlar"
 * and preselects that genre in its filter.
 */
export default function GameBreadcrumb({ game }: { game: Game }) {
  const onGenre = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (!safeQuery("#boshqa")) return;
    e.preventDefault();
    requestGenre(game.genre);
    scrollAndFocus("#boshqa");
    window.history.replaceState(null, "", "#boshqa");
  };

  return (
    <nav aria-label="Sahifa yo‘li" className="relative z-10">
      <ol className="flex flex-wrap items-center gap-x-3 font-mono text-[13px] font-medium uppercase leading-[1.4] tracking-[0.08em] sm:text-[14px]">
        <li className="flex items-center gap-3">
          <Link href="/games" className={CRUMB}>
            O‘yinlar
          </Link>
          <span aria-hidden="true" className="text-dim">
            /
          </span>
        </li>
        <li className="flex items-center gap-3">
          <a href="#boshqa" onClick={onGenre} className={CRUMB}>
            {game.genre}
          </a>
          <span aria-hidden="true" className="text-dim">
            /
          </span>
        </li>
        <li className="flex items-center">
          <span aria-current="page" className="inline-flex min-h-11 items-center text-ink">
            {game.title}
          </span>
        </li>
      </ol>
    </nav>
  );
}
