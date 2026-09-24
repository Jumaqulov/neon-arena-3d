"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  DoubleSide,
  Object3D,
  type Group,
  type InstancedMesh,
  type LineBasicMaterial,
  type MeshBasicMaterial,
} from "three";
import SceneCanvas from "@/components/three/SceneCanvas";
import NeonGrid from "@/components/three/NeonGrid";
import HoloCube from "@/components/three/HoloCube";
import Particles from "@/components/three/Particles";
import CameraRig from "@/components/three/CameraRig";
import Effects from "@/components/three/Effects";
import type { ProgressRef } from "@/hooks/useScrollProgress";
import HeroSceneFallback from "./HeroSceneFallback";

type V3 = [number, number, number];
const LIME = "#C4F82A";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
/** deterministic 0..1 hash (pure) */
const hash = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export interface HeroSceneProps {
  /** 0..1 hero scroll progress (pinned timeline on desktop) */
  progress: ProgressRef;
  /** true ≥1024px: copy on the left, cube on the right. false: centred stage under the copy. */
  split: boolean;
  className?: string;
}

/**
 * HERO — NeonGrid floor + HoloCube + floor rings + shards + dust, bloom.
 * Scroll (progress) dollies the camera forward through the grid and tilts it down while the
 * cube splits into its faces and shards burst out; the time-based spin keeps running ("4D").
 */
export default function HeroScene({ progress, split, className }: HeroSceneProps) {
  return (
    <SceneCanvas className={className} fallback={<HeroSceneFallback />}>
      <fog attach="fog" args={["#0A0B10", 9, 40]} />
      <HeroWorld progress={progress} split={split} />
      <Effects bloom={1.15} />
    </SceneCanvas>
  );
}

function HeroWorld({ progress, split }: { progress: ProgressRef; split: boolean }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  // cube at ~72% of the width when split (visible width at z=0 ≈ 6.6 × aspect)
  const cx = split ? Math.min(3.3, Math.max(1.8, aspect * 1.6)) : 0;
  const cube: V3 = [cx, split ? 0.55 : 0.4, 0];
  const cubeSize = split ? (aspect < 1.45 ? 2.1 : 2.4) : 2;
  const boost = useRef(0);

  useFrame(() => {
    // grid rushes faster as the camera dives in
    boost.current = clamp01(progress.current) * 3.2;
  });

  return (
    <>
      <CameraRig
        progress={progress}
        from={split ? [0, 1.6, 8] : [0, 1.5, 8.6]}
        to={[cx * 0.6, 0.35, 2.3]}
        lookFrom={[0, 0.4, 0]}
        lookTo={[cx * 0.85, -1.2, -7]}
        pointer={split ? 0.4 : 0.18}
        damping={2.8}
      />
      <NeonGrid speedRef={boost} velocityBoost={0.14} />
      <HoloCube explode={progress} position={cube} size={cubeSize} spread={2.3} />
      <FloorRings position={[cx, -1.49, 0]} progress={progress} />
      <Shards position={cube} progress={progress} count={split ? 40 : 22} />
      <Particles count={split ? 700 : 320} spread={[22, 9, 22]} />
    </>
  );
}

/* ------------------------------------------------------------------ */

/** dashed circle in the XZ plane as line segments */
function dashedCircle(r: number, dashes: number): Float32Array {
  const out: number[] = [];
  const step = (Math.PI * 2) / dashes;
  for (let i = 0; i < dashes; i++) {
    const a0 = i * step;
    const a1 = a0 + step * 0.55;
    const sub = 3;
    for (let s = 0; s < sub; s++) {
      const b0 = a0 + ((a1 - a0) * s) / sub;
      const b1 = a0 + ((a1 - a0) * (s + 1)) / sub;
      out.push(Math.cos(b0) * r, 0, Math.sin(b0) * r, Math.cos(b1) * r, 0, Math.sin(b1) * r);
    }
  }
  return new Float32Array(out);
}

/** Lime floor rings under the cube; they widen and fade as the cube explodes. */
function FloorRings({ position, progress }: { position: V3; progress: ProgressRef }) {
  const group = useRef<Group>(null);
  const dashed = useRef<Group>(null);
  const solidMat = useRef<MeshBasicMaterial>(null);
  const dashMat = useRef<LineBasicMaterial>(null);
  const dashes = useMemo(() => dashedCircle(1.55, 56), []);

  useFrame((_, delta) => {
    const e = smooth(clamp01(progress.current));
    const s = 1 + e * 2.4;
    group.current?.scale.set(s, 1, s);
    if (dashed.current) dashed.current.rotation.y += Math.min(delta, 0.1) * (0.22 + e * 1.4);
    if (solidMat.current) solidMat.current.opacity = 0.5 * (1 - e * 0.8);
    if (dashMat.current) dashMat.current.opacity = 0.75 * (1 - e * 0.65);
  });

  return (
    <group ref={group} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.05, 2.1, 128]} />
        <meshBasicMaterial
          ref={solidMat}
          color={LIME}
          transparent
          opacity={0.5}
          side={DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={dashed}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dashes, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={dashMat} color={LIME} transparent opacity={0.75} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  );
}

interface ShardSeed {
  dir: V3;
  dist: number;
  spin: number;
  size: number;
  delay: number;
  tilt: number;
}

/** Wireframe shards bursting out of the cube with scroll, orbiting with time. */
function Shards({ position, progress, count }: { position: V3; progress: ProgressRef; count: number }) {
  const mesh = useRef<InstancedMesh>(null);
  const dummyRef = useRef<Object3D | null>(null);
  const seeds = useMemo<ShardSeed[]>(() => {
    const list: ShardSeed[] = [];
    for (let i = 0; i < count; i++) {
      // even directions on a sphere (golden spiral), flattened a little
      const k = i + 0.5;
      const phi = Math.acos(1 - (2 * k) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * k;
      list.push({
        dir: [Math.cos(theta) * Math.sin(phi), Math.cos(phi) * 0.75, Math.sin(theta) * Math.sin(phi)],
        dist: 1.6 + hash(i, 1) * 3.8,
        spin: 0.5 + hash(i, 2) * 2.2,
        size: 0.55 + hash(i, 3) * 1.1,
        delay: hash(i, 4) * 0.3,
        tilt: hash(i, 5) * Math.PI * 2,
      });
    }
    return list;
  }, [count]);

  useFrame((state) => {
    const m = mesh.current;
    if (!m) return;
    const dummy = (dummyRef.current ??= new Object3D());
    const t = state.clock.elapsedTime;
    const p = clamp01(progress.current);
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      const e = smooth(clamp01((p - s.delay) / (1 - s.delay)));
      const a = e * (1.1 + t * 0.08);
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const dx = s.dir[0] * cos - s.dir[2] * sin;
      const dz = s.dir[0] * sin + s.dir[2] * cos;
      const d = e * s.dist;
      dummy.position.set(dx * d, s.dir[1] * d, dz * d);
      dummy.rotation.set(s.tilt + t * s.spin * 0.5, t * s.spin, e * 3);
      dummy.scale.setScalar(e <= 0.001 ? 0 : s.size * Math.min(1, e * 4));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={position}>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
        <tetrahedronGeometry args={[0.14, 0]} />
        <meshBasicMaterial color={LIME} wireframe transparent opacity={0.85} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
