"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Color, DoubleSide, Vector3, type ShaderMaterial } from "three";
import { scrollState } from "@/lib/scroll-store";
import type { ProgressRef } from "@/hooks/useScrollProgress";

export interface NeonGridProps {
  /** plane size in world units. Default 240. */
  size?: number;
  /** cell size in world units. Default 1.5 (major line every 4 cells). */
  cell?: number;
  /** line color. Default lime "#C4F82A". */
  color?: string;
  /** base forward speed (units / second). Default 0.8. */
  speed?: number;
  /** extra speed read every frame (e.g. from scroll progress). Added to `speed`. */
  speedRef?: ProgressRef;
  /** multiply |Lenis velocity| (px/frame) into speed — "rush" on fast scroll. Default 0. Try 0.15. */
  velocityBoost?: number;
  /** distance (world units) at which the grid fully fades out. Default 60. */
  fade?: number;
  /** overall opacity 0..1. Default 0.55. */
  opacity?: number;
  /** y of the floor. Default -1.5. */
  y?: number;
}

const vertex = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragment = /* glsl */ `
uniform vec3 uColor;
uniform float uCell;
uniform float uOffset;
uniform float uOpacity;
uniform float uFade;
uniform vec3 uCam;
varying vec3 vWorld;

float gridLine(vec2 p) {
  vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
  return 1.0 - min(min(g.x, g.y), 1.0);
}

void main() {
  vec2 p = vec2(vWorld.x, vWorld.z + uOffset) / uCell;
  float minor = gridLine(p);
  float major = gridLine(p / 4.0);
  float d = distance(vWorld.xz, uCam.xz);
  float fade = 1.0 - smoothstep(uFade * 0.25, uFade, d);
  float a = max(minor * 0.45, major) * fade * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor * (1.0 + major * 0.9), a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/**
 * Infinite scrolling lime grid floor (shader, distance fog). Moves toward the camera (+z).
 *   <NeonGrid velocityBoost={0.15} />
 */
export default function NeonGrid({
  size = 240,
  cell = 1.5,
  color = "#C4F82A",
  speed = 0.8,
  speedRef,
  velocityBoost = 0,
  fade = 60,
  opacity = 0.55,
  y = -1.5,
}: NeonGridProps) {
  const mat = useRef<ShaderMaterial>(null);

  // stable uniforms object (props synced in an effect, per-frame values in useFrame)
  const [uniforms] = useState(() => ({
    uColor: { value: new Color(color) },
    uCell: { value: cell },
    uOffset: { value: 0 },
    uOpacity: { value: opacity },
    uFade: { value: fade },
    uCam: { value: new Vector3() },
  }));

  // prop → uniform sync only when props change (Color.set(string) parses CSS: not per frame)
  useEffect(() => {
    const m = mat.current;
    if (!m) return;
    const u = m.uniforms;
    (u.uColor.value as Color).set(color);
    u.uCell.value = cell;
    u.uOpacity.value = opacity;
    u.uFade.value = fade;
  }, [color, cell, opacity, fade]);

  useFrame((state, delta) => {
    const m = mat.current;
    if (!m) return;
    const u = m.uniforms;
    const v = speed + (speedRef?.current ?? 0) + Math.abs(scrollState.velocity) * velocityBoost;
    const wrap = cell * 4;
    u.uOffset.value = (u.uOffset.value - v * Math.min(delta, 0.1)) % wrap;
    (u.uCam.value as Vector3).copy(state.camera.position);
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} renderOrder={-1}>
      <planeGeometry args={[size, size, 1, 1]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
