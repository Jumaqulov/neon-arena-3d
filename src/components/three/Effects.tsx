"use client";

import { Bloom, ChromaticAberration, EffectComposer, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useMemo } from "react";
import { Vector2 } from "three";
import { useIsMobile } from "@/hooks/useIsMobile";

export interface EffectsProps {
  /** bloom intensity. Default 1.1. */
  bloom?: number;
  /**
   * luminance threshold 0..1 — only bright lime glows. Default 0.2 (fine for line/particle
   * scenes). Scenes with TEXT textures: use BLOOM_THRESHOLD_TEXT (0.8) from ./colors and push
   * only the neon lines above 1.0 with LIME_HDR + toneMapped={false}, or white copy will glow.
   */
  threshold?: number;
  /** Default 0.25. */
  smoothing?: number;
  /** subtle RGB split. Default false. */
  chromatic?: boolean;
  /** subtle film grain. Default false. */
  noise?: boolean;
  /** render on mobile too (default false → returns null below 768px). */
  forceOnMobile?: boolean;
}

/**
 * Postprocessing: mipmap Bloom (+ optional ChromaticAberration / Noise). Off on mobile.
 * Place as the LAST child inside <SceneCanvas>.
 *   <Effects bloom={1.2} chromatic />
 */
export default function Effects({
  bloom = 1.1,
  threshold = 0.2,
  smoothing = 0.25,
  chromatic = false,
  noise = false,
  forceOnMobile = false,
}: EffectsProps) {
  const isMobile = useIsMobile();
  const offset = useMemo(() => new Vector2(0.0007, 0.0005), []);
  if (isMobile && !forceOnMobile) return null;

  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom mipmapBlur intensity={bloom} luminanceThreshold={threshold} luminanceSmoothing={smoothing} />
      {chromatic ? (
        <ChromaticAberration offset={offset} radialModulation={false} modulationOffset={0} />
      ) : null}
      {noise ? <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.35} /> : null}
    </EffectComposer>
  );
}
