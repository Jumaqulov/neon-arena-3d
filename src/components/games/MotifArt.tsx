import type { CSSProperties } from "react";
import type { GameMotif } from "@/lib/data";
import { MOTIFS, MOTIF_VIEWBOX } from "./gameArt";

export interface MotifArtProps {
  motif: GameMotif;
  className?: string;
  style?: CSSProperties;
  /** SVG preserveAspectRatio. Default "xMidYMid meet". */
  fit?: string;
}

/** Our own geometric cover motif (decorative, aria-hidden). Stroke = currentColor. */
export default function MotifArt({ motif, className, style, fit = "xMidYMid meet" }: MotifArtProps) {
  const m = MOTIFS[motif];
  return (
    <svg
      viewBox={`0 0 ${MOTIF_VIEWBOX.w} ${MOTIF_VIEWBOX.h}`}
      preserveAspectRatio={fit}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    >
      {m.shapes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          opacity={s.opacity}
          strokeDasharray={s.dash ? s.dash.join(" ") : undefined}
          strokeWidth={s.width}
          fill={s.fill ? "currentColor" : undefined}
          stroke={s.stroke === false ? "none" : undefined}
        />
      ))}
    </svg>
  );
}
