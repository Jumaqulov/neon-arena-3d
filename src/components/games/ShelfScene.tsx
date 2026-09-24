"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import SceneCanvas from "@/components/three/SceneCanvas";
import NeonGrid from "@/components/three/NeonGrid";
import HoloCube from "@/components/three/HoloCube";
import Particles from "@/components/three/Particles";
import CameraRig from "@/components/three/CameraRig";
import Effects from "@/components/three/Effects";
import { BLOOM_THRESHOLD_TEXT } from "@/components/three/colors";
import { CssGridFloor, CssHoloCube } from "@/components/three/fallbacks";
import { GAMES } from "@/lib/data";
import { pointerState } from "@/lib/scroll-store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ProgressRef } from "@/hooks/useScrollProgress";
import GameBox3D from "./GameBox3D";

const TAU = Math.PI * 2;
const R0 = 3.4;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Every game box on a ring: time spin + scroll spin + scroll "explode" outward (4D). */
function Carousel({ progress, still }: { progress: ProgressRef; still: boolean }) {
  const items = useRef<Array<Group | null>>([]);
  const cur = useRef({ a: 0, r: R0, init: false });
  const width = useThree((s) => s.size.width);
  const texScale = width < 700 ? 0.75 : 1;

  useFrame((state, delta) => {
    const c = cur.current;
    const t = still ? 0 : state.clock.elapsedTime;
    const p = clamp01(progress.current);
    const px = pointerState.fine && !still ? pointerState.x : 0;
    const a = t * 0.12 + p * Math.PI * 1.25 + px * 0.25;
    const r = R0 + smooth(p) * 2.6;
    const k = still || !c.init ? 1 : 1 - Math.exp(-3 * Math.min(delta, 0.1));
    c.init = true;
    c.a += (a - c.a) * k;
    c.r += (r - c.r) * k;
    const n = items.current.length;
    for (let i = 0; i < n; i++) {
      const g = items.current[i];
      if (!g) continue;
      const th = (i / n) * TAU + c.a;
      g.position.set(Math.sin(th) * c.r, Math.sin(t * 0.9 + i * 0.8) * 0.12 + smooth(p) * Math.sin(i * 1.7) * 0.8, Math.cos(th) * c.r);
      g.rotation.set(smooth(p) * Math.sin(i * 2.3) * 0.5, th + Math.sin(t * 0.5 + i) * 0.08, smooth(p) * Math.cos(i * 1.9) * 0.3);
    }
  });

  return (
    <>
      {GAMES.map((game, i) => (
        <group
          key={game.slug}
          ref={(el) => {
            items.current[i] = el;
          }}
        >
          <GameBox3D game={game} texScale={texScale} scale={0.5} />
        </group>
      ))}
    </>
  );
}

export interface ShelfSceneProps {
  /** 0..1 scroll progress of the hero */
  progress: ProgressRef;
  /** desktop layout: ring sits right of the headline */
  split: boolean;
}

/** Library hero scene for /games. Load with next/dynamic({ ssr: false }). */
export default function ShelfScene({ progress, split }: ShelfSceneProps) {
  const reduced = useReducedMotion();
  const cx = split ? 3.8 : 0;
  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{ position: [0, 2.6, 13], fov: 38, near: 0.1, far: 120 }}
      fallback={
        <>
          <CssGridFloor />
          <CssHoloCube size={150} className="absolute right-[16%] top-[28%]" />
        </>
      }
    >
      <fog attach="fog" args={["#0A0B10", 11, 27]} />
      <CameraRig
        progress={progress}
        from={[0, 2.6, 13]}
        to={[0, 4.4, 10.5]}
        lookFrom={[0, 0.2, 0]}
        lookTo={[0, -0.7, 0]}
        pointer={0.45}
      />
      <group position={[cx, split ? 0.6 : 0.3, 0]}>
        <Carousel progress={progress} still={reduced} />
        <HoloCube size={1.2} position={[0, 0.1, 0]} explode={progress} spread={1.5} />
      </group>
      <NeonGrid y={-2.3} velocityBoost={0.15} opacity={0.45} speed={0.6} />
      <Particles count={520} spread={[24, 8, 20]} seed={21} />
      <Effects bloom={0.95} threshold={BLOOM_THRESHOLD_TEXT} smoothing={0.2} />
    </SceneCanvas>
  );
}
