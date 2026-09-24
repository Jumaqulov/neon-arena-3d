"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  getLenis,
  safeQuery,
  pointerState,
  scrollState,
  scrollToTarget,
  setLenis,
  subscribeLenis,
} from "@/lib/scroll-store";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Current Lenis instance (null under reduced motion / before mount). */
export function useLenis(): Lenis | null {
  return useSyncExternalStore(subscribeLenis, getLenis, () => null);
}

function updateNativeScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const y = window.scrollY;
  scrollState.y = y;
  scrollState.progress = max > 0 ? y / max : 0;
}

/**
 * Root provider: Lenis smooth scroll synced to GSAP ScrollTrigger
 * (lenis.on('scroll', ScrollTrigger.update), gsap.ticker drives lenis.raf, lagSmoothing(0)).
 * Disabled under prefers-reduced-motion (native scroll). Also:
 *  - writes live values to `scrollState` / `pointerState` (src/lib/scroll-store.ts)
 *  - on route change: scroll to top (or to the URL hash) and ScrollTrigger.refresh()
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  // Lenis lifecycle
  useEffect(() => {
    if (reduced) {
      const onScroll = () => updateNativeScrollState();
      window.addEventListener("scroll", onScroll, { passive: true });
      updateNativeScrollState();
      return () => window.removeEventListener("scroll", onScroll);
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      autoRaf: false,
      anchors: false,
    });

    let lastY = lenis.scroll;
    const onLenisScroll = (l: Lenis) => {
      ScrollTrigger.update();
      scrollState.y = l.scroll;
      scrollState.progress = l.progress;
      scrollState.velocity = l.velocity;
      scrollState.direction = l.scroll > lastY ? 1 : l.scroll < lastY ? -1 : 0;
      lastY = l.scroll;
    };
    lenis.on("scroll", onLenisScroll);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
      if (!lenis.isScrolling) {
        // decay velocity when idle so consumers settle to 0
        scrollState.velocity *= 0.9;
        if (Math.abs(scrollState.velocity) < 0.01) {
          scrollState.velocity = 0;
          scrollState.direction = 0;
        }
      }
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);

    // Lenis only re-measures via a 250ms-debounced ResizeObserver; ScrollTrigger refreshes
    // insert/remove pin spacers and change the document height, so re-measure immediately
    // or every scrollTo / wheel scroll stays clamped to the stale (shorter) limit.
    const onRefresh = () => lenis.resize();
    ScrollTrigger.addEventListener("refresh", onRefresh);

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
      scrollState.velocity = 0;
    };
  }, [reduced]);

  // Pointer (normalized, for 3D scenes / parallax)
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerState.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerState.y = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerState.fine = e.pointerType === "mouse" || e.pointerType === "pen";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Route change: reset scroll, refresh triggers, honour #hash after layout settles
  const firstRoute = useRef(true);
  useEffect(() => {
    const hash = window.location.hash;
    const isFirst = firstRoute.current;
    firstRoute.current = false;
    // client-side navigation → start at the top (initial load keeps browser restoration)
    if (!hash && !isFirst) {
      getLenis()?.scrollTo(0, { immediate: true, force: true });
    }
    const startedAt = performance.now();
    const jumpToHash = () => {
      if (hash && safeQuery(hash)) scrollToTarget(hash, { immediate: true });
    };
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        getLenis()?.resize();
        jumpToHash();
      });
    });
    const fonts = document.fonts;
    let alive = true;
    fonts?.ready.then(() => {
      if (!alive) return;
      ScrollTrigger.refresh();
      getLenis()?.resize();
      // late font swap can shift layout: land on the hash target once more
      // (only shortly after the navigation, never yanking a user who already scrolled on)
      if (performance.now() - startedAt < 1500) jumpToHash();
    });
    return () => {
      alive = false;
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  return <>{children}</>;
}
