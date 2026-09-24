"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, type Group, type Mesh, type MeshBasicMaterial } from "three";
import SceneCanvas from "@/components/three/SceneCanvas";
import NeonGrid from "@/components/three/NeonGrid";
import Particles from "@/components/three/Particles";
import Effects from "@/components/three/Effects";
import { getGame, type GameSlug } from "@/lib/data";
import { pointerState } from "@/lib/scroll-store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ProgressRef } from "@/hooks/useScrollProgress";
import GameBox3D from "./GameBox3D";
import { BLOOM_THRESHOLD_TEXT, LIME_HDR } from "@/components/three/colors";
import { BOX_H, createRadialTexture } from "./coverTexture";
import { BOX_BASE_YAW, BOX_YAW_RANGE } from "./gameArt";

const TAU = Math.PI * 2;
const FLOOR_Y = -BOX_H / 2 - 0.55;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);

function circleGeo(r: number, seg = 96, dashed = false): BufferGeometry {
  const pts: number[] = [];
  const step = dashed ? 2 : 1;
  for (let i = 0; i < seg; i += step) {
    const a0 = (i / seg) * TAU;
    const a1 = ((i + 1) / seg) * TAU;
    pts.push(Math.cos(a0) * r, 0, Math.sin(a0) * r, Math.cos(a1) * r, 0, Math.sin(a1) * r);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return g;
}

/** Orbit rings + breathing glow on the floor under the box. */
function FloorRings({ progress, still }: { progress: ProgressRef; still: boolean }) {
  const geos = useMemo(
    () => ({ a: circleGeo(1.72), b: circleGeo(1.35, 72, true), c: circleGeo(0.82) }),
    [],
  );
  const glowTex = useMemo(
    () =>
      createRadialTexture([
        [0, "rgba(196,248,42,0.42)"],
        [0.45, "rgba(196,248,42,0.1)"],
        [1, "rgba(196,248,42,0)"],
      ]),
    [],
  );
  const shadowTex = useMemo(
    () =>
      createRadialTexture([
        [0, "rgba(0,0,0,0.75)"],
        [0.7, "rgba(0,0,0,0)"],
        [1, "rgba(0,0,0,0)"],
      ]),
    [],
  );
  useEffect(
    () => () => {
      geos.a.dispose();
      geos.b.dispose();
      geos.c.dispose();
      glowTex.dispose();
      shadowTex.dispose();
    },
    [geos, glowTex, shadowTex],
  );

  const ringA = useRef<Group>(null);
  const ringB = useRef<Group>(null);
  const glow = useRef<Mesh>(null);

  useFrame((state) => {
    const t = still ? 0 : state.clock.elapsedTime;
    const p = clamp01(progress.current);
    if (ringA.current) ringA.current.rotation.y = (t / 26) * TAU + p * Math.PI;
    if (ringB.current) ringB.current.rotation.y = -(t / 18) * TAU - p * Math.PI * 1.5;
    const g = glow.current;
    if (g) {
      const b = still ? 0.5 : 0.5 + Math.sin((t / 6) * TAU) * 0.5;
      g.scale.setScalar(0.84 + b * 0.16);
      (g.material as MeshBasicMaterial).opacity = 0.5 + b * 0.4;
    }
  });

  return (
    <group position={[0, FLOOR_Y + 0.01, 0]}>
      <group ref={ringA}>
        <lineSegments geometry={geos.a}>
          <lineBasicMaterial color="#C4F82A" transparent opacity={0.45} toneMapped={false} />
        </lineSegments>
        <mesh position={[1.72, 0, 0]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color={LIME_HDR} toneMapped={false} />
        </mesh>
      </group>
      <group ref={ringB}>
        <lineSegments geometry={geos.b}>
          <lineBasicMaterial color="#C4F82A" transparent opacity={0.6} toneMapped={false} />
        </lineSegments>
      </group>
      <lineSegments geometry={geos.c}>
        <lineBasicMaterial color="#C4F82A" transparent opacity={0.22} toneMapped={false} />
      </lineSegments>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <planeGeometry args={[3.4, 3.4]} />
        <meshBasicMaterial
          map={glowTex}
          transparent
          opacity={0.7}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[2.6, 1.8]} />
        <meshBasicMaterial map={shadowTex} transparent opacity={0.8} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * The box rig: scroll yaw (front → spine → back), time sway + float ("4D"), pointer tilt,
 * camera framing that adapts to the stage aspect.
 */
function BoxRig({
  slug,
  progress,
  still,
  onReady,
}: {
  slug: GameSlug;
  progress: ProgressRef;
  still: boolean;
  onReady?: () => void;
}) {
  const game = getGame(slug);
  const floatRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const cur = useRef({ yaw: BOX_BASE_YAW, pitch: 0.12, x: 0, y: 0.35, z: 10, init: false });
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const camZ = aspect < 0.62 ? 10 * (0.62 / aspect) : 10;

  useFrame((state, delta) => {
    const c = cur.current;
    const t = still ? 0 : state.clock.elapsedTime;
    const p = clamp01(progress.current);
    const fine = pointerState.fine && !still;
    const px = fine ? pointerState.x : 0;
    const py = fine ? pointerState.y : 0;

    const yaw = BOX_BASE_YAW + p * BOX_YAW_RANGE + Math.sin((t / 14) * TAU) * 0.2 + px * 0.3;
    const pitch = 0.12 + Math.sin((t / 14) * TAU + 1.3) * 0.04 - py * 0.12 + smooth(p) * 0.08;
    const k = still || !c.init ? 1 : 1 - Math.exp(-4 * Math.min(delta, 0.1));
    c.init = true;
    c.yaw += (yaw - c.yaw) * k;
    c.pitch += (pitch - c.pitch) * k;
    if (spinRef.current) spinRef.current.rotation.set(c.pitch, c.yaw, 0);
    if (floatRef.current) floatRef.current.position.y = Math.sin((t / 6) * TAU) * 0.075;

    // camera: gentle pointer parallax + dolly-in at the spine moment
    const tx = px * 0.35;
    const ty = 0.35 + py * 0.2;
    const tz = camZ - Math.sin(p * Math.PI) * 0.9;
    c.x += (tx - c.x) * k;
    c.y += (ty - c.y) * k;
    c.z += (tz - c.z) * k;
    state.camera.position.set(c.x, c.y, c.z);
    state.camera.lookAt(0, -0.05, 0);
  });

  if (!game) return null;
  return (
    <group ref={floatRef}>
      <group ref={spinRef}>
        <GameBox3D
          game={game}
          texScale={size.width < 520 ? 1.5 : 2}
          hero
          still={still}
          onFrontReady={onReady}
        />
      </group>
    </group>
  );
}

export interface GameBoxSceneProps {
  slug: GameSlug;
  /** 0..1 scroll progress driving the box yaw */
  progress: ProgressRef;
  /**
   * called once the WebGL box is on screen with its final cover (the official artwork
   * loaded, or the typographic cover) — hide the CSS stand-in then
   */
  onReady?: () => void;
  /** shown when WebGL is unavailable */
  fallback?: ReactNode;
}

/** Hero scene for /games/[slug]. Load with next/dynamic({ ssr: false }). */
export default function GameBoxScene({ slug, progress, onReady, fallback = null }: GameBoxSceneProps) {
  const reduced = useReducedMotion();
  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{ position: [0, 0.35, 10], fov: 34, near: 0.1, far: 80 }}
      fallback={fallback}
    >
      <fog attach="fog" args={["#0A0B10", 14, 32]} />
      <BoxRig slug={slug} progress={progress} still={reduced} onReady={onReady} />
      <FloorRings progress={progress} still={reduced} />
      <NeonGrid y={FLOOR_Y} cell={0.9} opacity={0.3} fade={20} speed={0.35} velocityBoost={0.08} />
      <Particles count={240} spread={[10, 6, 8]} size={0.028} opacity={0.45} seed={11} />
      <Effects bloom={0.85} threshold={BLOOM_THRESHOLD_TEXT} smoothing={0.18} />
    </SceneCanvas>
  );
}
