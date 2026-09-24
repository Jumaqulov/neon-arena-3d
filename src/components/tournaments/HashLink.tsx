"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { safeQuery, scrollAndFocus } from "@/lib/scroll-store";

export interface HashLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** same-page anchor, e.g. "#list" */
  href: `#${string}`;
  children: ReactNode;
}

/**
 * Plain text-style in-page anchor that smooth-scrolls (Lenis) with the fixed-header offset.
 * Falls back to the native jump when the target is missing or a modifier key is held.
 */
export default function HashLink({ href, onClick, children, ...rest }: HashLinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (!safeQuery(href)) return;
    e.preventDefault();
    scrollAndFocus(href);
    window.history.replaceState(null, "", href);
  };
  return (
    <a href={href} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
