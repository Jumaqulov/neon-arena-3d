"use client";

import SceneCanvas from "./SceneCanvas";
import NeonGrid from "./NeonGrid";
import HoloCube from "./HoloCube";
import Particles from "./Particles";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import { CssGridFloor, CssHoloCube } from "./fallbacks";
import type { ProgressRef } from "@/hooks/useScrollProgress";

export interface ArenaSceneProps {
  /** 0..1 scroll progress: dollies the camera forward/down and explodes the cube. */
  progress?: ProgressRef;
  /** show the holo cube. Default true. */
  cube?: boolean;
  /** cube position. Default [1.8, 0.7, 0]. */
  cubePosition?: [number, number, number];
  /** grid rush on fast scroll. Default 0.12. */
  velocityBoost?: number;
  className?: string;
}

/**
 * Ready-made reference scene (grid floor + holo cube + dust + camera rig + bloom).
 * Also the canonical example of the scene-file pattern. Load it lazily:
 *   const ArenaScene = dynamic(() => import("@/components/three/ArenaScene"), { ssr: false, loading: () => <CssGridFloor /> });
 */
export default function ArenaScene({
  progress,
  cube = true,
  cubePosition = [1.8, 0.7, 0],
  velocityBoost = 0.12,
  className,
}: ArenaSceneProps) {
  return (
    <SceneCanvas
      className={className}
      fallback={
        <>
          <CssGridFloor />
          {cube ? <CssHoloCube className="absolute right-[12%] top-[22%]" /> : null}
        </>
      }
    >
      <fog attach="fog" args={["#0A0B10", 8, 42]} />
      <CameraRig progress={progress} from={[0, 1.6, 8]} to={[0, 0.6, 3.2]} lookFrom={[0, 0.4, 0]} lookTo={[0, -0.6, -6]} />
      <NeonGrid velocityBoost={velocityBoost} />
      {cube ? <HoloCube explode={progress} position={cubePosition} /> : null}
      <Particles />
      <Effects />
    </SceneCanvas>
  );
}
