/**
 * Framework-agnostic, non-React live state for scroll + pointer.
 * Written by <SmoothScroll/>; read anywhere (e.g. inside R3F useFrame) WITHOUT re-rendering.
 *
 *   import { scrollState, pointerState } from "@/lib/scroll-store";
 *   useFrame(() => { grid.speed = 0.6 + Math.abs(scrollState.velocity) * 0.05; });
 */
import type Lenis from "lenis";

export interface ScrollState {
  /** current scroll top in px */
  y: number;
  /** whole-document progress 0..1 */
  progress: number;
  /** px per frame, signed (+ = scrolling down). 0 when idle or reduced motion. */
  velocity: number;
  /** 1 = down, -1 = up, 0 = idle */
  direction: 1 | -1 | 0;
}

export const scrollState: ScrollState = { y: 0, progress: 0, velocity: 0, direction: 0 };

export interface PointerState {
  /** normalized -1..1 across the viewport (left → right) */
  x: number;
  /** normalized -1..1 across the viewport (bottom → top, like R3F pointer) */
  y: number;
  /** true when the last pointer was a mouse/pen (fine pointer) */
  fine: boolean;
}

export const pointerState: PointerState = { x: 0, y: 0, fine: false };

/* ---- Lenis instance store (subscribe for useSyncExternalStore) ---- */
let lenisInstance: Lenis | null = null;
const listeners = new Set<() => void>();

export function setLenis(next: Lenis | null): void {
  lenisInstance = next;
  listeners.forEach((l) => l());
}
export function getLenis(): Lenis | null {
  return lenisInstance;
}
export function subscribeLenis(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Current fixed-header height in px (reads the --header-h CSS variable). */
export function headerOffset(): number {
  if (typeof window === "undefined") return 0;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--header-h");
  return Number.parseFloat(v) || 0;
}

/**
 * Smoothly scroll to an element / selector / hash (e.g. "#booking") or a Y value,
 * accounting for the fixed header. Uses Lenis when active, native scrolling otherwise.
 *
 * Element / selector targets are resolved to a number HERE (rect.top + scrollY + offset) for
 * both paths, so Lenis never subtracts the target's `scroll-margin-top` on top of our header
 * offset (which used to land every anchor jump header+16px too high).
 * Numeric targets use `offset` as-is (default 0).
 */
export function scrollToTarget(
  target: string | HTMLElement | number,
  opts: { immediate?: boolean; offset?: number } = {},
): void {
  if (typeof window === "undefined") return;
  let top: number;
  if (typeof target === "number") {
    top = target + (opts.offset ?? 0);
  } else {
    const el = typeof target === "string" ? safeQuery<HTMLElement>(target) : target;
    if (!el) return;
    const offset = opts.offset ?? -(headerOffset() + 16);
    top = el.getBoundingClientRect().top + window.scrollY + offset;
  }
  top = Math.max(0, top);
  const lenis = lenisInstance;
  if (lenis) {
    lenis.scrollTo(top, { immediate: opts.immediate ?? false });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top, behavior: opts.immediate || reduce ? "auto" : "smooth" });
}

/**
 * Scroll to an in-page target AND move keyboard focus there (focus uses preventScroll so the
 * browser does not jump natively), so the next Tab continues from the destination instead of
 * the trigger. Non-focusable targets get tabIndex=-1 first.
 */
export function scrollAndFocus(
  target: string | HTMLElement,
  opts: { immediate?: boolean; focus?: string | HTMLElement | null } = {},
): void {
  if (typeof window === "undefined") return;
  const el = typeof target === "string" ? safeQuery<HTMLElement>(target) : target;
  if (!el) return;
  scrollToTarget(el, { immediate: opts.immediate });
  const focusEl =
    (typeof opts.focus === "string" ? safeQuery<HTMLElement>(opts.focus) : opts.focus) ?? el;
  if (!focusEl.matches("a[href],button,input,select,textarea,[tabindex]")) {
    focusEl.setAttribute("tabindex", "-1");
    focusEl.setAttribute("data-scroll-focus", "");
  }
  focusEl.focus({ preventScroll: true });
}

/** querySelector that returns null instead of throwing on invalid selectors (e.g. "#1abc"). */
export function safeQuery<T extends Element = HTMLElement>(selector: string): T | null {
  try {
    return document.querySelector<T>(selector);
  } catch {
    return null;
  }
}
