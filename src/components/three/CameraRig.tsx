"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { pointerState } from "@/lib/scroll-store";
import type { ProgressRef } from "@/hooks/useScrollProgress";

type V3 = [number, number, number];

export interface CameraRigProps {
  /** camera position at progress 0. Default [0, 1.6, 8]. */
  from?: V3;
  /** camera position at progress 1 (dolly target). Default = `from`. */
  to?: V3;
  /** look-at point at progress 0. Default [0, 0.4, 0]. */
  lookFrom?: V3;
  /** look-at point at progress 1. Default = `lookFrom`. */
  lookTo?: V3;
  /** 0..1 read every frame (scroll progress). */
  progress?: ProgressRef;
  /** pointer parallax in world units. Default 0.35 (0 = off). */
  pointer?: number;
  /** follow smoothing (higher = snappier). Default 3. */
  damping?: number;
}

/**
 * Drives the default camera: scroll dolly (from → to) + subtle pointer parallax, damped.
 * Put inside <SceneCanvas>. Uses the global pointer (works even when DOM overlays the canvas).
 *   <CameraRig progress={progress} from={[0, 1.6, 8]} to={[0, 0.4, 2]} lookTo={[0, -1, -6]} />
 */
export default function CameraRig({
  from = [0, 1.6, 8],
  to,
  lookFrom = [0, 0.4, 0],
  lookTo,
  progress,
  pointer = 0.35,
  damping = 3,
}: CameraRigProps) {
  // per-instance scratch vectors (mutated only inside useFrame)
  const scratch = useRef({ pos: new Vector3(), look: new Vector3(), cur: new Vector3(...lookFrom) });

  useFrame((state, delta) => {
    const tmp = scratch.current;
    const p = Math.min(Math.max(progress?.current ?? 0, 0), 1);
    const b = to ?? from;
    const lb = lookTo ?? lookFrom;
    tmp.pos.set(
      from[0] + (b[0] - from[0]) * p + pointerState.x * pointer,
      from[1] + (b[1] - from[1]) * p + pointerState.y * pointer * 0.6,
      from[2] + (b[2] - from[2]) * p,
    );
    tmp.look.set(
      lookFrom[0] + (lb[0] - lookFrom[0]) * p,
      lookFrom[1] + (lb[1] - lookFrom[1]) * p,
      lookFrom[2] + (lb[2] - lookFrom[2]) * p,
    );
    const k = 1 - Math.exp(-damping * Math.min(delta, 0.1));
    state.camera.position.lerp(tmp.pos, k);
    tmp.cur.lerp(tmp.look, k);
    state.camera.lookAt(tmp.cur);
  });

  return null;
}
