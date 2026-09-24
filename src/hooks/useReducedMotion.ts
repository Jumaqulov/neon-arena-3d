"use client";

import { useMediaQuery } from "./useMediaQuery";

/** true when the user prefers reduced motion. Server/first render: false. */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
