import { CssGridFloor, CssHoloCube } from "@/components/three/fallbacks";
import { cn } from "@/lib/cn";

/**
 * No-three.js stand-in for the hero scene (chunk loading, no WebGL). Server-safe.
 * Cube sits centred in the mobile stage and on the right from 1024px, like the WebGL scene.
 */
export default function HeroSceneFallback({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className ?? "absolute inset-0")}>
      <CssGridFloor className="absolute inset-x-0 bottom-0 h-[48%]" />
      <div className="absolute left-1/2 top-[16%] -translate-x-1/2 lg:left-auto lg:right-[15%] lg:top-[28%] lg:translate-x-0">
        <div className="scale-[.72] lg:scale-100">
          <CssHoloCube size={240} />
        </div>
      </div>
    </div>
  );
}
