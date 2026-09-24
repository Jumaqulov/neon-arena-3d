/**
 * Single GSAP entry point. Import gsap / ScrollTrigger / useGSAP ONLY from here
 * (client components only) so the plugins are registered exactly once.
 *
 *   import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
 *
 * CONVENTIONS (all pages)
 * - Pins: every `pin: true` ScrollTrigger sets `refreshPriority: PIN_PRIORITY` (desktop only,
 *   inside `mm.add(MQ.desktop…)`). Any trigger with a refreshPriority makes ScrollTrigger sort
 *   ALL triggers by priority, then page position, on every refresh — so pin spacing is measured
 *   before the triggers below it, even though child components (Reveal, Parallax…) create their
 *   triggers before their parent's pin effect runs. The sort is global: it also protects pages
 *   whose own pins forget the flag, but don't rely on that.
 * - Perspective: never put `transformPerspective` in `gsap.from()` / `gsap.to()` vars — GSAP
 *   tweens it numerically (1200 → 0), leaving a keystone distortion that snaps on the last
 *   frame. `gsap.set(targets, { transformPerspective })` first (in a fromTo, the FROM vars are fine).
 * - Entrances animate `opacity`, not `autoAlpha`, when the element holds headings, links or
 *   buttons, so pending content stays in the accessibility tree and focusable.
 * - A trigger that sits inside a pinned section below the pin start needs `pinnedContainer`
 *   (<Reveal>/<Parallax> accept a `pinnedContainer` prop).
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

declare global {
  interface Window {
    __neonGsapRegistered?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__neonGsapRegistered) {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  window.__neonGsapRegistered = true;
}

/**
 * Media-query conditions for gsap.matchMedia(). Use these so reduced-motion and
 * mobile rules are consistent across pages.
 */
export const MQ = {
  /** motion allowed (any width) */
  motion: "(prefers-reduced-motion: no-preference)",
  /** motion NOT allowed */
  reduce: "(prefers-reduced-motion: reduce)",
  /** ≥768px and motion allowed — pinning / horizontal scroll / heavy scrub only here */
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  /** <768px and motion allowed — light reveals only, never pin */
  mobile: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
} as const;

/** refreshPriority for every pinning ScrollTrigger (see CONVENTIONS above). */
export const PIN_PRIORITY = 1;

/** Shared eases */
export const EASE = {
  out: "power3.out",
  expo: "expo.out",
  inOut: "power2.inOut",
  none: "none",
} as const;

export { gsap, ScrollTrigger, useGSAP };
