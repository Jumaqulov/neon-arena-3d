"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { PerspectiveCamera, Vector3, type Group, type LineBasicMaterial } from "three";
import SceneCanvas from "@/components/three/SceneCanvas";
import NeonGrid from "@/components/three/NeonGrid";
import HoloCube from "@/components/three/HoloCube";
import Particles from "@/components/three/Particles";
import CameraRig from "@/components/three/CameraRig";
import Effects from "@/components/three/Effects";
import { CssGridFloor } from "@/components/three/fallbacks";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { ProgressRef } from "@/hooks/useScrollProgress";
import type { AnchorRef } from "./sceneTypes";

type V3 = [number, number, number];

const CAM: V3 = [0, 1.3, 8];
const LOOK: V3 = [0, 0.2, 0];
const FOV = 45;
const CAMERA = { position: CAM, fov: FOV, near: 0.1, far: 200 };
const LIME = "#C4F82A";
/** base opacity of the halo's ring / ticks / arcs */
const HALO_OPACITY = [0.28, 0.46, 0.62] as const;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ---------------- unit-radius line geometry (pure) ---------------- */

function circlePoints(r: number, n: number): Float32Array {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out[i * 3] = Math.cos(a) * r;
    out[i * 3 + 1] = Math.sin(a) * r;
  }
  return out;
}

/** HUD dial: n radial ticks, every `major`-th one longer */
function tickSegments(r0: number, r1: number, rMajor: number, n: number, major: number): Float32Array {
  const out = new Float32Array(n * 6);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const outer = i % major === 0 ? rMajor : r1;
    out.set([c * r0, sn * r0, 0, c * outer, sn * outer, 0], i * 6);
  }
  return out;
}

/** `count` evenly spaced arcs of `span` radians */
function arcSegments(r: number, count: number, span: number, steps: number): Float32Array {
  const out = new Float32Array(count * steps * 6);
  let k = 0;
  for (let j = 0; j < count; j++) {
    const start = (j / count) * Math.PI * 2;
    for (let i = 0; i < steps; i++) {
      const a0 = start + (i / steps) * span;
      const a1 = start + ((i + 1) / steps) * span;
      out.set([Math.cos(a0) * r, Math.sin(a0) * r, 0, Math.cos(a1) * r, Math.sin(a1) * r, 0], k);
      k += 6;
    }
  }
  return out;
}

/* ---------------- screen (card) → world at a given depth ---------------- */

interface Scratch {
  cam: PerspectiveCamera;
  dir: Vector3;
  a: Vector3;
  b: Vector3;
  aspect: number;
}

/** Unproject normalized screen coords (0..1, y down) onto the plane z = `z`, using the camera REST pose. */
function toWorld(s: Scratch, fx: number, fy: number, z: number, out: Vector3): Vector3 {
  out.set(fx * 2 - 1, 1 - fy * 2, 0.5).unproject(s.cam);
  s.dir.copy(out).sub(s.cam.position).normalize();
  const k = (z - s.cam.position.z) / (s.dir.z || -1e-6);
  return out.copy(s.cam.position).addScaledVector(s.dir, k);
}

interface RigProps {
  anchor: AnchorRef;
  progress: ProgressRef;
  mobile: boolean;
}

/**
 * Everything that is placed relative to the DOM card:
 *  - a HUD halo (ring + dial ticks + arcs) behind the card: spins with time, and on scroll
 *    tilts back, lifts and grows ("4D": time + scroll on the same object)
 *  - two holo cubes at the card's corners: time spin, scroll-driven explode + drift
 */
function CardRig({ anchor, progress, mobile }: RigProps) {
  const halo = useRef<Group>(null);
  const dial = useRef<Group>(null);
  const arcs = useRef<Group>(null);
  const cubeA = useRef<Group>(null);
  const cubeB = useRef<Group>(null);
  const mats = useRef<Array<LineBasicMaterial | null>>([]);
  const scratch = useRef<Scratch>({
    cam: new PerspectiveCamera(FOV, 1, 0.1, 200),
    dir: new Vector3(),
    a: new Vector3(),
    b: new Vector3(),
    aspect: 0,
  });

  const ring = useMemo(() => circlePoints(1, 160), []);
  const ticks = useMemo(() => tickSegments(1.08, 1.13, 1.21, 90, 6), []);
  const arcPts = useMemo(() => arcSegments(1.34, 3, (70 * Math.PI) / 180, 24), []);

  useFrame((state, delta) => {
    const s = scratch.current;
    const aspect = state.size.width / Math.max(1, state.size.height);
    if (aspect !== s.aspect) {
      s.aspect = aspect;
      s.cam.aspect = aspect;
      s.cam.position.set(CAM[0], CAM[1], CAM[2]);
      s.cam.lookAt(LOOK[0], LOOK[1], LOOK[2]);
      s.cam.updateProjectionMatrix();
      s.cam.updateMatrixWorld();
    }

    const an = anchor.current;
    const p = clamp01(progress.current);
    const dt = Math.min(delta, 0.1);

    // halo: centered behind the card, radius ≈ half the card width
    const zHalo = -1.4;
    toWorld(s, an.x, an.y, zHalo, s.a);
    toWorld(s, an.x + an.w / 2, an.y, zHalo, s.b);
    const half = Math.max(0.2, s.b.x - s.a.x);
    const g = halo.current;
    if (g) {
      g.position.set(s.a.x, s.a.y + p * 0.9, s.a.z - p * 0.8);
      g.scale.setScalar(half * 1.02 * (1 + p * 0.65));
      g.rotation.x = -p * 1.15;
      g.rotation.y = p * 0.4;
    }
    if (dial.current) dial.current.rotation.z += dt * 0.12;
    if (arcs.current) arcs.current.rotation.z -= dt * (0.3 + p * 1.4);
    const fade = 1 - p * 0.6;
    for (let i = 0; i < mats.current.length; i++) {
      const m = mats.current[i];
      if (m) m.opacity = HALO_OPACITY[i] * fade;
    }

    // cubes at the card's top-left / bottom-right corners
    if (cubeA.current) {
      toWorld(s, an.x - an.w * 0.6, an.y - an.h * 0.8, 0.3, s.b);
      cubeA.current.position.set(s.b.x - p * 0.5, s.b.y + p * 1.6, s.b.z);
      cubeA.current.scale.setScalar(half * 0.27);
    }
    if (cubeB.current) {
      toWorld(s, an.x + an.w * 0.62, an.y + an.h * 0.52, 0.8, s.b);
      cubeB.current.position.set(s.b.x + p * 0.6, s.b.y + p * 0.9, s.b.z);
      cubeB.current.scale.setScalar(half * 0.17);
    }
  });

  return (
    <>
      <group ref={halo}>
        <group ref={dial}>
          <lineLoop>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ring, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              ref={(m) => {
                mats.current[0] = m;
              }}
              color={LIME}
              transparent
              opacity={HALO_OPACITY[0]}
              depthWrite={false}
              toneMapped={false}
            />
          </lineLoop>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ticks, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              ref={(m) => {
                mats.current[1] = m;
              }}
              color={LIME}
              transparent
              opacity={HALO_OPACITY[1]}
              depthWrite={false}
              toneMapped={false}
            />
          </lineSegments>
        </group>
        {mobile ? null : (
          <group ref={arcs}>
            <lineSegments>
              <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[arcPts, 3]} />
              </bufferGeometry>
              <lineBasicMaterial
                ref={(m) => {
                  mats.current[2] = m;
                }}
                color={LIME}
                transparent
                opacity={HALO_OPACITY[2]}
                depthWrite={false}
                toneMapped={false}
              />
            </lineSegments>
          </group>
        )}
      </group>

      <group ref={cubeA}>
        <HoloCube size={1} spin={0.45} explode={progress} spread={2.6} faceOpacity={0.08} />
      </group>
      {mobile ? null : (
        <group ref={cubeB}>
          <HoloCube size={1} spin={-0.6} explode={progress} spread={3} core={false} faceOpacity={0.08} />
        </group>
      )}
    </>
  );
}

export interface ProfileSceneProps {
  /** 0..1 hero scroll progress (top top → bottom top) */
  progress: ProgressRef;
  /** DOM card position inside the scene box */
  anchor: AnchorRef;
  className?: string;
}

/**
 * /profil hero environment (WebGL): neon grid floor, lime dust, a HUD halo framing the
 * member card and two holo cubes. Camera dollies forward/down with scroll; bloom on desktop.
 * Load ONLY through next/dynamic({ ssr: false }).
 */
export default function ProfileScene({ progress, anchor, className }: ProfileSceneProps) {
  const mobile = useIsMobile();
  return (
    <SceneCanvas
      className={className ?? "absolute inset-0"}
      camera={CAMERA}
      fallback={<CssGridFloor className="absolute inset-x-0 bottom-0 h-[46%]" />}
    >
      <fog attach="fog" args={["#0A0B10", 9, 34]} />
      <CameraRig
        progress={progress}
        from={CAM}
        to={[0.4, 0.5, 4.6]}
        lookFrom={LOOK}
        lookTo={[0, -1, -6]}
        pointer={0.3}
      />
      <NeonGrid velocityBoost={0.15} opacity={0.5} speed={0.6} />
      <Particles count={460} spread={[18, 7, 14]} size={0.03} opacity={0.6} position={[0, 0.6, -2]} />
      <CardRig anchor={anchor} progress={progress} mobile={mobile} />
      <Effects bloom={0.9} />
    </SceneCanvas>
  );
}
