/**
 * Where the DOM member card sits inside the hero's 3D scene box, normalized 0..1
 * (x → right, y → down): center (x, y) and size (w, h). Written by ProfileHero
 * (ResizeObserver), read every frame by ProfileScene — never causes a React render.
 */
export interface SceneAnchor {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AnchorRef = { current: SceneAnchor };
