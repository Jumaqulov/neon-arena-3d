"use client";

import { useFrame, type ThreeElements } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, type Group, type LineBasicMaterial, type MeshBasicMaterial } from "three";
import type { ProgressRef } from "@/hooks/useScrollProgress";

type GroupProps = ThreeElements["group"];

export interface HoloCubeProps extends Omit<GroupProps, "children"> {
  /** edge length in world units. Default 2.4. */
  size?: number;
  /** color of edges/faces. Default lime "#C4F82A". */
  color?: string;
  /** translucent face opacity. Default 0.06. */
  faceOpacity?: number;
  /** edge opacity. Default 0.85. */
  edgeOpacity?: number;
  /** time-based spin speed (rad/s around Y). Default 0.25. Keeps running while exploding ("4D"). */
  spin?: number;
  /**
   * 0..1 read every frame (e.g. from useScrollProgress): 0 = closed cube,
   * 1 = the six faces flown apart & tumbling, inner core expanded.
   */
  explode?: ProgressRef;
  /** how far faces travel at explode=1, in cube sizes. Default 2.2. */
  spread?: number;
  /** inner counter-rotating cube + octahedron core. Default true. */
  core?: boolean;
  /** gentle bob. Default true. */
  float?: boolean;
}

interface FaceDef {
  normal: [number, number, number];
  rotation: [number, number, number];
  /** extra tumble axis at full explode */
  tumble: [number, number, number];
}

const FACES: readonly FaceDef[] = [
  { normal: [0, 0, 1], rotation: [0, 0, 0], tumble: [0.6, 0.9, 0.2] },
  { normal: [0, 0, -1], rotation: [0, Math.PI, 0], tumble: [-0.7, 0.4, -0.5] },
  { normal: [1, 0, 0], rotation: [0, Math.PI / 2, 0], tumble: [0.3, -0.8, 0.9] },
  { normal: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0], tumble: [-0.4, 0.7, -0.8] },
  { normal: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0], tumble: [0.9, 0.3, 0.6] },
  { normal: [0, -1, 0], rotation: [Math.PI / 2, 0, 0], tumble: [-0.6, -0.5, 0.4] },
];

function squareOutline(s: number): Float32Array {
  const h = s / 2;
  // 4 segments (8 vertices) in the face's local XY plane
  return new Float32Array([
    -h, -h, 0, h, -h, 0,
    h, -h, 0, h, h, 0,
    h, h, 0, -h, h, 0,
    -h, h, 0, -h, -h, 0,
  ]);
}

function cubeEdges(s: number): Float32Array {
  const h = s / 2;
  const v = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h],
  ];
  const e = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
  const out: number[] = [];
  for (const [a, b] of e) out.push(...v[a], ...v[b]);
  return new Float32Array(out);
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * Holographic cube: translucent lime faces + glowing edges. Time spin always runs;
 * `explode` (scroll) splits it into its 6 faces that fly apart and tumble.
 *   const { progress } = useScrollProgress(heroRef, { start: "top top", end: "bottom top" });
 *   <HoloCube explode={progress} position={[1.5, 0.6, 0]} />
 */
export default function HoloCube({
  size = 2.4,
  color = "#C4F82A",
  faceOpacity = 0.06,
  edgeOpacity = 0.85,
  spin = 0.25,
  explode,
  spread = 2.2,
  core = true,
  float = true,
  ...groupProps
}: HoloCubeProps) {
  const root = useRef<Group>(null);
  const spinner = useRef<Group>(null);
  const faceGroups = useRef<Array<Group | null>>([]);
  const faceMats = useRef<Array<MeshBasicMaterial | null>>([]);
  const coreRef = useRef<Group>(null);
  const coreMat = useRef<LineBasicMaterial>(null);

  const outline = useMemo(() => squareOutline(size), [size]);
  const innerEdges = useMemo(() => cubeEdges(size * 0.42), [size]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const e = smooth(Math.min(Math.max(explode?.current ?? 0, 0), 1));
    const dt = Math.min(delta, 0.1);

    if (spinner.current) {
      spinner.current.rotation.y += dt * spin * (1 + e * 1.5);
      spinner.current.rotation.x = -0.42 + Math.sin(t * 0.35) * 0.08 + e * 0.6;
    }
    if (root.current && float) {
      root.current.position.y = Math.sin(t * 0.8) * 0.08;
    }

    for (let i = 0; i < FACES.length; i++) {
      const g = faceGroups.current[i];
      if (!g) continue;
      const f = FACES[i];
      const dist = size / 2 + e * size * spread * (1 + i * 0.12);
      g.position.set(f.normal[0] * dist, f.normal[1] * dist, f.normal[2] * dist);
      g.rotation.set(
        f.rotation[0] + e * f.tumble[0] * (2 + Math.sin(t + i)),
        f.rotation[1] + e * f.tumble[1] * (2 + Math.cos(t * 0.8 + i)),
        f.rotation[2] + e * f.tumble[2] * 2,
      );
      const m = faceMats.current[i];
      if (m) m.opacity = faceOpacity * (1 + e * 1.5);
    }

    if (coreRef.current) {
      coreRef.current.rotation.x -= dt * 0.6;
      coreRef.current.rotation.y -= dt * 0.9;
      const s = 1 + e * 0.9;
      coreRef.current.scale.setScalar(s);
    }
    if (coreMat.current) coreMat.current.opacity = 0.55 + e * 0.4;
  });

  return (
    <group {...groupProps}>
      <group ref={root}>
        <group ref={spinner}>
          {FACES.map((f, i) => (
            <group
              key={i}
              ref={(el) => {
                faceGroups.current[i] = el;
              }}
              position={[(f.normal[0] * size) / 2, (f.normal[1] * size) / 2, (f.normal[2] * size) / 2]}
              rotation={f.rotation}
            >
              <mesh>
                <planeGeometry args={[size, size]} />
                <meshBasicMaterial
                  ref={(el) => {
                    faceMats.current[i] = el;
                  }}
                  color={color}
                  transparent
                  opacity={faceOpacity}
                  side={DoubleSide}
                  depthWrite={false}
                  toneMapped={false}
                />
              </mesh>
              <lineSegments>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[outline, 3]} />
                </bufferGeometry>
                <lineBasicMaterial color={color} transparent opacity={edgeOpacity} toneMapped={false} />
              </lineSegments>
            </group>
          ))}

          {core ? (
            <group ref={coreRef}>
              <lineSegments>
                <bufferGeometry>
                  <bufferAttribute attach="attributes-position" args={[innerEdges, 3]} />
                </bufferGeometry>
                <lineBasicMaterial ref={coreMat} color={color} transparent opacity={0.55} toneMapped={false} />
              </lineSegments>
              <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                <octahedronGeometry args={[size * 0.16, 0]} />
                <meshBasicMaterial color={color} wireframe transparent opacity={0.9} toneMapped={false} />
              </mesh>
            </group>
          ) : null}
        </group>
      </group>
    </group>
  );
}
