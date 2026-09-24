"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, type Points as PointsImpl } from "three";
import { useIsMobile } from "@/hooks/useIsMobile";

export interface ParticlesProps {
  /** desktop count (halved below 768px). Default 700. */
  count?: number;
  /** box the dust fills, centered on origin: [x, y, z]. Default [18, 8, 18]. */
  spread?: [number, number, number];
  /** point size (world units, attenuated). Default 0.035. */
  size?: number;
  /** Default lime "#C4F82A". */
  color?: string;
  /** Default 0.7. */
  opacity?: number;
  /** drift speed multiplier. Default 1. */
  speed?: number;
  /** deterministic layout seed. Default 7. */
  seed?: number;
  position?: [number, number, number];
}

/** tiny deterministic PRNG (pure → safe in render/useMemo) */
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Floating lime dust (additive points) slowly swirling.
 *   <Particles count={600} spread={[20, 8, 20]} />
 */
export default function Particles({
  count = 700,
  spread = [18, 8, 18],
  size = 0.035,
  color = "#C4F82A",
  opacity = 0.7,
  speed = 1,
  seed = 7,
  position,
}: ParticlesProps) {
  const isMobile = useIsMobile();
  const n = isMobile ? Math.floor(count / 2) : count;
  const ref = useRef<PointsImpl>(null);
  const [sx, sy, sz] = spread;

  const positions = useMemo(() => {
    const rand = mulberry32(seed);
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (rand() - 0.5) * sx;
      arr[i * 3 + 1] = (rand() - 0.5) * sy;
      arr[i * 3 + 2] = (rand() - 0.5) * sz;
    }
    return arr;
  }, [n, sx, sy, sz, seed]);

  useFrame((state, delta) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y += Math.min(delta, 0.1) * 0.02 * speed;
    p.position.y = (position?.[1] ?? 0) + Math.sin(state.clock.elapsedTime * 0.2 * speed) * 0.15;
  });

  return (
    <points ref={ref} position={position} key={n}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
