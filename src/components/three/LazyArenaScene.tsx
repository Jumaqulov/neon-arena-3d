"use client";

import dynamic from "next/dynamic";
import { CssGridFloor } from "./fallbacks";

/**
 * Client-only, code-split ArenaScene (three.js stays out of the route's initial chunk).
 * Same props as ArenaScene. Render inside a `relative` box with a height.
 *   <div className="relative h-[70svh]"><LazyArenaScene progress={progress} /></div>
 */
const LazyArenaScene = dynamic(() => import("./ArenaScene"), {
  ssr: false,
  loading: () => <CssGridFloor />,
});

export default LazyArenaScene;
