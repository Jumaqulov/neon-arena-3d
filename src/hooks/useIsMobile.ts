"use client";

import { useMediaQuery } from "./useMediaQuery";

/** true below the md breakpoint (< 768px). Server/first render: false. */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767.98px)");
}
