"use client";

import { useFrame, useThree, type ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Texture,
} from "three";
import type { Game } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";
import { LIME_HDR } from "@/components/three/colors";
import {
  BOX_D,
  BOX_H,
  BOX_W,
  UNIT,
  coverPhotoUrl,
  createBoxTextures,
  createSheenTexture,
  disposeBoxTextures,
  ensureFonts,
  loadCoverPhoto,
  paintBoxTextures,
  setFrontPhoto,
} from "./coverTexture";

type GroupProps = Omit<ThreeElements["group"], "children">;

export interface GameBox3DProps extends GroupProps {
  game: Game;
  /** canvas px per cover px. 2 = hero, 1 = shelf. Default 2. */
  texScale?: number;
  /** hero extras: scan line, sheen sweep, floating hologram reticle. Default false. */
  hero?: boolean;
  /** freeze time-based extras (reduced motion). */
  still?: boolean;
  /**
   * Called once the cover face is final (official cover loaded, or it failed and the
   * typographic cover stays, or the game has no artwork) — the box is visible from then on.
   */
  onFrontReady?: () => void;
}

/** result of the cover photo load, keyed by URL (a stale result never applies to a new URL) */
interface PhotoState {
  url: string;
  tex: Texture | null;
}

function makeEdges(): EdgesGeometry {
  const box = new BoxGeometry(BOX_W * 1.002, BOX_H * 1.002, BOX_D * 1.002);
  const edges = new EdgesGeometry(box);
  box.dispose();
  return edges;
}

function ringPoints(r: number, seg = 64): BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i < seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push(Math.cos(a) * r, Math.sin(a) * r, 0);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return g;
}

function dashedRing(r: number, seg = 48): BufferGeometry {
  const pts: number[] = [];
  for (let i = 0; i < seg; i += 2) {
    const a0 = (i / seg) * Math.PI * 2;
    const a1 = ((i + 1) / seg) * Math.PI * 2;
    pts.push(Math.cos(a0) * r, Math.sin(a0) * r, 0, Math.cos(a1) * r, Math.sin(a1) * r, 0);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pts, 3));
  return g;
}

function crossLines(): BufferGeometry {
  const a = 46 * UNIT;
  const b = 22 * UNIT;
  const g = new BufferGeometry();
  g.setAttribute(
    "position",
    new Float32BufferAttribute([0, a, 0, 0, b, 0, 0, -b, 0, 0, -a, 0, -a, 0, 0, -b, 0, 0, b, 0, 0, a, 0, 0], 3),
  );
  return g;
}

/**
 * The NEON ARENA "club edition" game box: a real box mesh with canvas-drawn faces (spine,
 * back, sides), glowing lime edges and — for the hero — a scan line, a sheen sweep and a
 * hologram reticle floating above the cover. The cover face shows the game's official
 * artwork when it has one (the typographic cover otherwise, or if the artwork fails to load).
 */
export default function GameBox3D({
  game,
  texScale = 2,
  hero = false,
  still = false,
  onFrontReady,
  ...groupProps
}: GameBox3DProps) {
  const invalidate = useThree((s) => s.invalidate);
  const gl = useThree((s) => s.gl);
  const set = useMemo(() => createBoxTextures(texScale), [texScale]);

  // official cover: the hero box asks for the 640w rendition (the 600px source), shelf boxes for 384w
  const photoPx = texScale >= 1.5 ? 640 : 384;
  const photoUrl = useMemo(() => {
    const art = getGameArt(game.slug);
    return art ? coverPhotoUrl(art.cover, photoPx) : null;
  }, [game.slug, photoPx]);
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const current = photoUrl !== null && photo !== null && photo.url === photoUrl ? photo : null;
  const photoTex = current?.tex ?? null;
  /** the cover face is final: no artwork, or the artwork loaded / failed */
  const frontReady = photoUrl === null || current !== null;

  useEffect(() => {
    if (!photoUrl) return;
    let tex: Texture | null = null;
    const cancel = loadCoverPhoto(
      photoUrl,
      Math.min(8, gl.capabilities.getMaxAnisotropy()),
      (t) => {
        tex = t;
        setPhoto({ url: photoUrl, tex: t });
      },
      // keep the canvas-drawn typographic cover
      () => setPhoto({ url: photoUrl, tex: null }),
    );
    return () => {
      cancel();
      tex?.dispose();
    };
  }, [photoUrl, gl]);

  useEffect(() => {
    setFrontPhoto(set, photoTex);
    invalidate();
  }, [set, photoTex, invalidate]);

  useEffect(() => {
    if (!frontReady) return;
    invalidate();
    onFrontReady?.();
  }, [frontReady, onFrontReady, invalidate]);

  const edges = useMemo(() => makeEdges(), []);
  const holo = useMemo(
    () => (hero ? { ring: ringPoints(30 * UNIT), outer: dashedRing(42 * UNIT), cross: crossLines() } : null),
    [hero],
  );
  const sheenTex = useMemo<Texture | null>(() => (hero ? createSheenTexture() : null), [hero]);

  const scan = useRef<Mesh>(null);
  const sheen = useRef<Mesh>(null);
  const holoGroup = useRef<Group>(null);
  const holoOuter = useRef<Group>(null);

  // paint now (fallback fonts), repaint once the web fonts are ready
  useEffect(() => {
    let alive = true;
    paintBoxTextures(set, game);
    invalidate();
    ensureFonts().then(() => {
      if (!alive) return;
      paintBoxTextures(set, game);
      invalidate();
    });
    return () => {
      alive = false;
    };
  }, [set, game, invalidate]);

  useEffect(() => () => disposeBoxTextures(set), [set]);
  useEffect(() => () => edges.dispose(), [edges]);
  useEffect(
    () => () => {
      holo?.ring.dispose();
      holo?.outer.dispose();
      holo?.cross.dispose();
    },
    [holo],
  );
  useEffect(() => () => sheenTex?.dispose(), [sheenTex]);

  useFrame((state) => {
    if (!hero) return;
    const t = still ? 1.2 : state.clock.elapsedTime;
    // scan line: top → bottom every 4.8s
    const s = scan.current;
    if (s) {
      const p = (t % 4.8) / 4.8;
      s.position.y = BOX_H / 2 - p * BOX_H;
      const m = s.material as MeshBasicMaterial;
      m.opacity = still ? 0 : p < 0.08 ? (p / 0.08) * 0.7 : p > 0.92 ? ((1 - p) / 0.08) * 0.7 : 0.7;
    }
    // sheen: a diagonal light band crosses the cover every 7s
    const sh = sheen.current;
    if (sh) {
      const m = sh.material as MeshBasicMaterial;
      const q = (t % 7) / 7;
      if (m.map) m.map.offset.x = still ? -1 : -1 + Math.min(q / 0.35, 1) * 2;
    }
    // hologram reticle: 4D spin + breathing
    if (holoGroup.current) {
      holoGroup.current.rotation.z = t * 0.45;
      const k = 1 + Math.sin(t * 1.6) * 0.04;
      holoGroup.current.scale.setScalar(k);
    }
    if (holoOuter.current) holoOuter.current.rotation.z = -t * 0.3;
  });

  const zFront = BOX_D / 2;
  const holoY = (BOX_H / 2 / UNIT - 196) * UNIT; // cover focal point (px 196 from top)

  // Hidden until the cover face is final, so a game with artwork never flashes the
  // typographic cover first (the hero keeps its CSS stand-in on screen meanwhile).
  return (
    <group {...groupProps} visible={frontReady}>
      <mesh material={set.materials}>
        <boxGeometry args={[BOX_W, BOX_H, BOX_D]} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={LIME_HDR} transparent opacity={0.8} toneMapped={false} />
      </lineSegments>

      {hero && holo ? (
        <>
          <mesh ref={scan} position={[0, BOX_H / 2, zFront + 0.004]}>
            <planeGeometry args={[BOX_W * 0.996, 0.016]} />
            <meshBasicMaterial
              color={LIME_HDR}
              transparent
              opacity={0}
              blending={AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          {/* Typographic covers only: the official art is tinted to just under the bloom
              threshold (PHOTO_TINT), so an additive sweep over it would push its whites
              (Apex logo, MK1 background) past the threshold and make them glow. */}
          {sheenTex ? (
            <mesh ref={sheen} position={[0, 0, zFront + 0.002]} visible={!photoTex}>
              <planeGeometry args={[BOX_W, BOX_H]} />
              <meshBasicMaterial
                map={sheenTex}
                transparent
                opacity={0.16}
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          ) : null}
          {/* the reticle belongs to the typographic motif — it would sit on the official art's logo / faces */}
          <group position={[0, holoY, zFront + 0.34]} visible={!photoTex}>
            <group ref={holoGroup}>
              <lineLoop geometry={holo.ring}>
                <lineBasicMaterial color={LIME_HDR} transparent opacity={0.95} toneMapped={false} />
              </lineLoop>
              <lineSegments geometry={holo.cross}>
                <lineBasicMaterial color={LIME_HDR} transparent opacity={0.95} toneMapped={false} />
              </lineSegments>
              <mesh>
                <circleGeometry args={[2.5 * UNIT, 16]} />
                <meshBasicMaterial color={LIME_HDR} toneMapped={false} />
              </mesh>
            </group>
            <group ref={holoOuter}>
              <lineSegments geometry={holo.outer}>
                <lineBasicMaterial color="#C4F82A" transparent opacity={0.5} toneMapped={false} />
              </lineSegments>
            </group>
          </group>
        </>
      ) : null}
    </group>
  );
}
