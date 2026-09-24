import type { CSSProperties } from "react";
import type { ZoneId } from "@/lib/data";
import { lime, ZONE_BLOCKS, type IsoBlockDef } from "./content";

/**
 * Isometric CSS 3D miniature of a zone (desks, monitors, sofa…) — decorative, aria-hidden.
 * Ported from the zone cards in Main.dc.html (real preserve-3d boxes with top / south / west faces).
 */
export default function ZoneIsoArt({ zone }: { zone: ZoneId }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-[180px] rounded-[12px] border border-line bg-ground [transform-style:preserve-3d]"
    >
      <div
        className="absolute left-1/2 top-1/2 -ml-[75px] -mt-[30px] h-[110px] w-[150px] [transform-style:preserve-3d]"
        style={{
          transform: "rotateX(58deg) rotateZ(-45deg)",
          border: `1px solid ${lime(0.3)}`,
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(238,240,246,.07) 0 1px, transparent 1px 15px), repeating-linear-gradient(90deg, rgba(238,240,246,.07) 0 1px, transparent 1px 15px)",
        }}
      >
        {ZONE_BLOCKS[zone].map((b, i) => (
          <IsoBlock key={i} b={b} />
        ))}
      </div>
    </div>
  );
}

function IsoBlock({ b }: { b: IsoBlockDef }) {
  const hi = !!b.hi;
  const face: CSSProperties = { position: "absolute", boxSizing: "border-box" };
  return (
    <div
      style={{
        position: "absolute",
        left: b.x,
        top: b.y,
        width: b.w,
        height: b.d,
        transformStyle: "preserve-3d",
        transform: `translateZ(${b.z}px)`,
      }}
    >
      {/* south face */}
      <div
        style={{
          ...face,
          left: 0,
          top: b.d,
          width: b.w,
          height: b.h,
          background: hi ? lime(0.2) : "#141722",
          border: `1px solid ${hi ? lime(0.95) : lime(0.45)}`,
          transformOrigin: "50% 0%",
          transform: "rotateX(90deg)",
          boxShadow: hi ? `0 0 18px ${lime(0.35)}` : undefined,
        }}
      />
      {/* west face */}
      <div
        style={{
          ...face,
          left: -b.h,
          top: 0,
          width: b.h,
          height: b.d,
          background: hi ? "#11131B" : "#0F1119",
          border: `1px solid ${hi ? lime(0.5) : lime(0.3)}`,
          transformOrigin: "100% 50%",
          transform: "rotateY(90deg)",
        }}
      />
      {/* top face */}
      <div
        style={{
          ...face,
          left: 0,
          top: 0,
          width: b.w,
          height: b.d,
          background: hi ? lime(0.55) : "#1C2030",
          border: `1px solid ${hi ? "#C4F82A" : lime(0.75)}`,
          transform: `translateZ(${b.h}px)`,
        }}
      />
    </div>
  );
}
