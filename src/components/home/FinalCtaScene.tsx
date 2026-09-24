"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import SceneCanvas from "@/components/three/SceneCanvas";
import NeonGrid from "@/components/three/NeonGrid";
import HoloCube from "@/components/three/HoloCube";
import Particles from "@/components/three/Particles";
import CameraRig from "@/components/three/CameraRig";
import Effects from "@/components/three/Effects";
import { CssGridFloor } from "@/components/three/fallbacks";
import type { ProgressRef } from "@/hooks/useScrollProgress";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export interface FinalCtaSceneProps {
  /** 0..1 as the final section scrolls in */
  progress: ProgressRef;
  className?: string;
}

/**
 * FINAL CTA — the camera drops low and "rushes" over the neon grid. Grid speed = base +
 * section progress + |scroll velocity| (fast scroll = faster rush). Two small holo cubes spin.
 */
export default function FinalCtaScene({ progress, className }: FinalCtaSceneProps) {
  return (
    <SceneCanvas
      className={className}
      camera={{ position: [0, 2.6, 9], fov: 50, near: 0.1, far: 200 }}
      fallback={<CssGridFloor className="absolute inset-x-0 bottom-0 h-[62%]" />}
    >
      <fog attach="fog" args={["#0A0B10", 6, 36]} />
      <RushWorld progress={progress} />
      <Effects bloom={0.95} />
    </SceneCanvas>
  );
}

function RushWorld({ progress }: { progress: ProgressRef }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const x = Math.min(4.6, Math.max(1.4, aspect * 2.3));
  const boost = useRef(0);

  useFrame(() => {
    boost.current = clamp01(progress.current) * 4;
  });

  return (
    <>
      <CameraRig
        progress={progress}
        from={[0, 2.6, 9]}
        to={[0, 0.3, 5.5]}
        lookFrom={[0, 0.4, -2]}
        lookTo={[0, 0.25, -14]}
        pointer={0.45}
        damping={2.4}
      />
      <NeonGrid speed={1.1} speedRef={boost} velocityBoost={0.28} y={-1.3} fade={56} opacity={0.6} />
      <HoloCube size={0.95} position={[-x, 1.7, -1.5]} spin={0.45} core={false} />
      <HoloCube size={0.6} position={[x * 0.92, 1, 0.2]} spin={-0.6} core={false} />
      <Particles count={420} spread={[26, 7, 26]} speed={2.2} size={0.03} seed={21} />
    </>
  );
}
