"use client";

/**
 * /tournaments hero scene: a WebGL podium that RISES OUT OF the neon grid on load
 * (blocks are clipped at the floor plane), with lime edges + bloom, a holo-cube trophy,
 * floating player plates and dust. On scroll ("4D": the time-based sway / spin keeps
 * running) it tilts away, sinks back into the grid, the plates float apart, the trophy
 * explodes and the camera cranes up.
 *
 * Load ONLY via next/dynamic({ ssr: false }) — see TournamentsHero.
 */

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  CanvasTexture,
  DoubleSide,
  EdgesGeometry,
  MeshBasicMaterial,
  Plane,
  SRGBColorSpace,
  Vector3,
  type Group,
} from "three";
import SceneCanvas from "@/components/three/SceneCanvas";
import NeonGrid from "@/components/three/NeonGrid";
import HoloCube from "@/components/three/HoloCube";
import Particles from "@/components/three/Particles";
import CameraRig from "@/components/three/CameraRig";
import Effects from "@/components/three/Effects";
import { BLOOM_THRESHOLD_TEXT, LIME_HDR } from "@/components/three/colors";
import { PhText } from "@/components/ui/Placeholder";
import { cn } from "@/lib/cn";
import { PODIUM, type PodiumPlace } from "@/lib/data";
import type { ProgressRef } from "@/hooks/useScrollProgress";
import CssPodium from "./CssPodium";

/* ------------------------------------------------------------------ */
/* constants                                                           */
/* ------------------------------------------------------------------ */

const LIME = "#C4F82A";
const W = 1.5; // block width (x)
const D = 1.5; // block depth (z)
const GAP = 0.12;
const PX_PER_UNIT = 320; // front-face texture density

type Place = 1 | 2 | 3;

interface BlockDef {
  place: Place;
  x: number;
  h: number;
  /** rise start (s after the first frame) */
  delay: number;
  /** plates drift this way on scroll */
  dir: -1 | 0 | 1;
}

/** heights follow the mockup ratio 290 : 200 : 140. Bronze → silver → gold rise order. */
const BLOCKS: readonly BlockDef[] = [
  { place: 2, x: -(W + GAP), h: 2.0, delay: 0.35, dir: -1 },
  { place: 1, x: 0, h: 2.9, delay: 0.6, dir: 0 },
  { place: 3, x: W + GAP, h: 1.4, delay: 0.1, dir: 1 },
];
const H1 = 2.9;
const RISE = 1.35; // seconds
const TROPHY_DELAY = 1.75;

/** Everything below y = 0 (the grid floor) is clipped: the podium literally rises out of the floor. */
const FLOOR_CLIP = [new Plane(new Vector3(0, 1, 0), 0)];

const BEAM_POS = new Float32Array([0, 0, 0, 0, 0.72, 0]);
// HDR lime (above 1.0) so the beam still crosses the high text-scene bloom threshold
const BEAM_COL = new Float32Array([
  LIME_HDR.r, LIME_HDR.g, LIME_HDR.b, 0.85,
  LIME_HDR.r, LIME_HDR.g, LIME_HDR.b, 0,
]);

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function cssFont(variable: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

/** Typographic front face: big numeral (gold filled + glow, others outlined) + "N-O‘RIN" label. */
function drawFront(canvas: HTMLCanvasElement, place: Place, h: number): HTMLCanvasElement {
  const w = Math.round(W * PX_PER_UNIT);
  const hh = Math.round(h * PX_PER_UNIT);
  canvas.width = w;
  canvas.height = hh;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#11131B";
  ctx.fillRect(0, 0, w, hh);
  if (place === 1) {
    const g = ctx.createRadialGradient(w / 2, hh * 0.45, 0, w / 2, hh * 0.45, w * 0.85);
    g.addColorStop(0, "rgba(196,248,42,0.10)");
    g.addColorStop(1, "rgba(196,248,42,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, hh);
  }

  const display = cssFont("--font-unbounded", "'Arial Black', sans-serif");
  const mono = cssFont("--font-jetbrains", "Consolas, monospace");
  const size = w * (place === 1 ? 0.72 : place === 2 ? 0.56 : 0.44);
  const label = Math.round(w * 0.068);
  const gap = label * 0.95;
  const cap = size * 0.74;
  const baseline = (hh - (cap + gap + label)) / 2 + cap;

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 ${Math.round(size)}px ${display}`;
  if (place === 1) {
    ctx.shadowColor = "rgba(196,248,42,0.6)";
    ctx.shadowBlur = 36;
    ctx.fillStyle = LIME;
    ctx.fillText("1", w / 2, baseline);
    ctx.shadowBlur = 0;
  } else {
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(3, w * 0.009);
    ctx.strokeStyle = LIME;
    ctx.strokeText(String(place), w / 2, baseline);
  }

  ctx.font = `500 ${label}px ${mono}`;
  ctx.fillStyle = "#A3A9BC";
  ctx.fillText(`${place}-O‘RIN`, w / 2, baseline + gap + label);
  return canvas;
}

/** Redraw once the web fonts are ready (kept outside the component: it mutates the texture). */
function refreshWhenFontsReady(tex: CanvasTexture, place: Place, h: number): () => void {
  let alive = true;
  if (typeof document === "undefined" || !document.fonts) return () => {};
  const display = cssFont("--font-unbounded", "sans-serif");
  const mono = cssFont("--font-jetbrains", "monospace");
  Promise.all([document.fonts.load(`800 120px ${display}`), document.fonts.load(`500 24px ${mono}`)])
    .catch(() => undefined)
    .then(() => {
      if (!alive) return;
      drawFront(tex.image as HTMLCanvasElement, place, h);
      tex.needsUpdate = true;
    });
  return () => {
    alive = false;
  };
}

function disposeAll(items: ReadonlyArray<{ dispose: () => void }>): void {
  for (const it of items) it.dispose();
}

/* ------------------------------------------------------------------ */
/* block                                                               */
/* ------------------------------------------------------------------ */

interface BlockProps {
  def: BlockDef;
  riserRef: (el: Group | null) => void;
}

function Block({ def, riserRef }: BlockProps) {
  const { place, h, x } = def;
  const first = place === 1;

  const geometry = useMemo(() => {
    const g = new BoxGeometry(W, h, D);
    g.translate(0, h / 2, 0); // base at y = 0 so it grows out of the floor
    return g;
  }, [h]);
  const edges = useMemo(() => new EdgesGeometry(geometry), [geometry]);
  const texture = useMemo(() => {
    const t = new CanvasTexture(drawFront(document.createElement("canvas"), place, h));
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [place, h]);

  // BoxGeometry groups: +x, -x, +y (top), -y, +z (front), -z
  const materials = useMemo(() => {
    const base = { clippingPlanes: FLOOR_CLIP, toneMapped: false } as const;
    const sideR = new MeshBasicMaterial({ ...base, color: "#0F1219" });
    const sideL = new MeshBasicMaterial({ ...base, color: "#0B0D12" });
    const top = new MeshBasicMaterial({ ...base, color: first ? "#34421A" : "#232B1B" });
    const front = new MeshBasicMaterial({ ...base, map: texture });
    return [sideR, sideL, top, sideL, front, sideL];
  }, [texture, first]);

  useEffect(() => refreshWhenFontsReady(texture, place, h), [texture, place, h]);
  useEffect(
    () => () => disposeAll([geometry, edges, texture, ...new Set(materials)]),
    [geometry, edges, texture, materials],
  );

  return (
    <group position={[x, 0, 0]}>
      {/* starts fully below the floor; the scene's useFrame raises it */}
      <group ref={riserRef} position={[0, -h - 0.05, 0]}>
        <mesh geometry={geometry} material={materials} />
        <lineSegments geometry={edges}>
          <lineBasicMaterial
            color={LIME_HDR}
            transparent
            opacity={first ? 1 : 0.72}
            toneMapped={false}
            clippingPlanes={FLOOR_CLIP}
          />
        </lineSegments>
        {/* light beam up to the plate */}
        <lineSegments position={[0, h, 0]}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[BEAM_POS, 3]} />
            <bufferAttribute attach="attributes-color" args={[BEAM_COL, 4]} />
          </bufferGeometry>
          <lineBasicMaterial vertexColors transparent toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* stage rings on the floor                                            */
/* ------------------------------------------------------------------ */

function ringPoints(r: number, segments: number, dashed: boolean): Float32Array {
  const out: number[] = [];
  const step = (Math.PI * 2) / segments;
  for (let i = 0; i < segments; i++) {
    if (dashed && i % 2 === 1) continue;
    const a0 = i * step;
    const a1 = a0 + step;
    out.push(Math.cos(a0) * r, 0, Math.sin(a0) * r, Math.cos(a1) * r, 0, Math.sin(a1) * r);
  }
  return new Float32Array(out);
}

const RING_OUTER = ringPoints(3.4, 120, false);
const RING_INNER = ringPoints(2.35, 72, true);

function StageRings() {
  return (
    <group position={[0, 0.012, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 96]} />
        <meshBasicMaterial color={LIME} transparent opacity={0.035} depthWrite={false} side={DoubleSide} toneMapped={false} clippingPlanes={FLOOR_CLIP} />
      </mesh>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[RING_OUTER, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={LIME} transparent opacity={0.34} toneMapped={false} clippingPlanes={FLOOR_CLIP} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[RING_INNER, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={LIME} transparent opacity={0.3} toneMapped={false} clippingPlanes={FLOOR_CLIP} />
      </lineSegments>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* player plate (DOM in 3D, desktop only)                              */
/* ------------------------------------------------------------------ */

function PlateCard({ p, delay }: { p: PodiumPlace; delay: string }) {
  const first = p.place === 1;
  return (
    <div className="animate-float" style={{ animationDelay: delay }}>
      <div
        className={cn(
          "flex w-[196px] items-center gap-3 rounded-[12px] border bg-surface/95 px-3.5 py-3 shadow-[0_18px_40px_rgba(0,0,0,.55)]",
          first ? "border-lime/70" : "border-line",
        )}
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full font-mono text-[12px] font-bold",
            first ? "bg-lime text-ground" : "border border-lime/30 bg-raised text-ink",
          )}
        >
          {p.initials}
        </span>
        <span className="flex flex-col gap-0.5 text-left">
          <span className="text-[15px] font-semibold leading-tight text-ink">{p.handle}</span>
          <span className="font-mono text-[12px] font-medium text-muted">
            <PhText text={`${p.points} ball`} />
          </span>
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* podium rig                                                          */
/* ------------------------------------------------------------------ */

interface PodiumProps {
  progress: ProgressRef;
  wide: boolean;
}

const CAM_DIST = 10;
const HALF_FOV_TAN = Math.tan((45 / 2) * (Math.PI / 180));

function Podium({ progress, wide }: PodiumProps) {
  const size = useThree((s) => s.size);
  const aspect = size.width / Math.max(1, size.height);
  const halfW = CAM_DIST * HALF_FOV_TAN * aspect;
  // wide (≥1024px): the copy sits on the left, so push the podium right and turn it back to the camera
  const offsetX = wide ? halfW * 0.45 : 0;
  const fit = wide ? Math.min(1, 0.163 * halfW) : Math.min(1, (halfW * 1.8) / 5);
  const baseYaw = -0.34 - (wide ? Math.atan2(offsetX, CAM_DIST) : 0);

  const tilt = useRef<Group>(null);
  const yaw = useRef<Group>(null);
  const trophy = useRef<Group>(null);
  const risers = useRef<Array<Group | null>>([]);
  const plateGroups = useRef<Array<Group | null>>([]);
  const plateEls = useRef<Array<HTMLDivElement | null>>([]);
  /** last opacity written per plate: skip the DOM style write when nothing changed */
  const plateOpacity = useRef<number[]>([]);
  const t0 = useRef<number | null>(null);

  useFrame((state) => {
    const now = state.clock.elapsedTime;
    if (t0.current === null) t0.current = now;
    const t = now - t0.current;
    const e = smooth(clamp01(progress.current));

    // scroll: tilt away + sink back into the grid (pivot = podium base)
    if (tilt.current) {
      tilt.current.rotation.x = -0.58 * e;
      tilt.current.position.y = -1.25 * e;
      tilt.current.position.z = -0.8 * e;
    }
    // time: slow sway keeps running while scrolling ("4D")
    if (yaw.current) yaw.current.rotation.y = baseYaw + Math.sin(t * 0.39) * 0.11 + e * 0.35;

    for (let i = 0; i < BLOCKS.length; i++) {
      const b = BLOCKS[i];
      const k = easeOutExpo(clamp01((t - b.delay) / RISE));
      const riser = risers.current[i];
      if (riser) riser.position.y = (-b.h - 0.05) * (1 - k);

      const pg = plateGroups.current[i];
      if (pg) pg.position.set(b.x + b.dir * e * 1.5, b.h + 0.95 + e * (b.place === 1 ? 2.1 : 1.4), e * 0.6);
      const el = plateEls.current[i];
      if (el) {
        const appear = smooth(clamp01((t - b.delay - RISE * 0.6) / 0.6));
        const o = appear * (1 - smooth(clamp01(e * 1.7)));
        const last = plateOpacity.current[i] ?? -1;
        if (Math.abs(o - last) > 0.002 || ((o === 0 || o === 1) && o !== last)) {
          plateOpacity.current[i] = o;
          el.style.opacity = o.toFixed(3);
        }
      }
    }

    if (trophy.current) {
      const k = clamp01((t - TROPHY_DELAY) / 0.9);
      trophy.current.scale.setScalar(Math.max(0.0001, easeOutBack(k)));
    }
  });

  return (
    <group position={[offsetX, 0, 0]} scale={fit}>
      <group ref={tilt}>
        <group ref={yaw}>
          <StageRings />
          {BLOCKS.map((b, i) => (
            <Block
              key={b.place}
              def={b}
              riserRef={(el) => {
                risers.current[i] = el;
              }}
            />
          ))}

          <group ref={trophy} position={[0, H1 + 1.95, 0]} scale={0.0001}>
            <HoloCube size={0.62} spin={0.55} explode={progress} spread={1.6} edgeOpacity={0.95} />
          </group>

          {wide
            ? BLOCKS.map((b, i) => {
                const p = PODIUM.find((x) => x.place === b.place);
                if (!p) return null;
                return (
                  <group
                    key={`plate-${b.place}`}
                    ref={(el) => {
                      plateGroups.current[i] = el;
                    }}
                    position={[b.x, b.h + 0.95, 0]}
                  >
                    <Html center zIndexRange={[9, 1]} pointerEvents="none">
                      <div
                        ref={(el) => {
                          plateEls.current[i] = el;
                        }}
                        style={{ opacity: 0 }}
                      >
                        <PlateCard p={p} delay={`${-i * 2}s`} />
                      </div>
                    </Html>
                  </group>
                );
              })
            : null}
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* scene                                                               */
/* ------------------------------------------------------------------ */

export interface PodiumSceneProps {
  /** 0..1 as the hero stage scrolls out of view (useScrollProgress, "top top" → "bottom top") */
  progress: ProgressRef;
  /** true from 1024px: copy on the left, podium composed to the right, 3D player plates */
  wide: boolean;
  className?: string;
}

export default function PodiumScene({ progress, wide, className }: PodiumSceneProps) {
  return (
    <SceneCanvas
      className={className ?? "absolute inset-0"}
      reducedMotion="fallback"
      fallback={<CssPodium />}
      camera={{ position: [0, 3, CAM_DIST], fov: 45, near: 0.1, far: 120 }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
    >
      <fog attach="fog" args={["#0A0B10", 14, 38]} />
      <CameraRig
        progress={progress}
        from={[0, 3, CAM_DIST]}
        to={[0, 5.4, 13]}
        lookFrom={[0, 2.4, 0]}
        lookTo={[0, 1.1, 0]}
        pointer={0.45}
        damping={2.6}
      />
      <NeonGrid y={0} velocityBoost={0.14} opacity={0.5} fade={42} speed={0.6} />
      <Podium progress={progress} wide={wide} />
      <Particles count={360} spread={[20, 7, 14]} position={[0, 3.2, -2]} size={0.03} opacity={0.5} speed={0.8} />
      {/* block fronts are canvas text textures: high threshold, only HDR lime lines glow */}
      <Effects bloom={1.15} threshold={BLOOM_THRESHOLD_TEXT} smoothing={0.3} />
    </SceneCanvas>
  );
}
