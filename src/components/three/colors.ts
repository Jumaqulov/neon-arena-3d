/**
 * Shared HDR colours for R3F scenes (client-only: import from "use client" scene files).
 *
 * Bloom convention (see <Effects>):
 * - Scenes WITHOUT text textures can keep the default threshold (0.2).
 * - Scenes WITH text / UI textures (covers, cards, HUD planes) should pass
 *   `threshold={BLOOM_THRESHOLD_TEXT}` so white copy does not glow, and push ONLY the neon lines
 *   above 1.0 with `LIME_HDR` + `toneMapped={false}` on their materials.
 */
import { Color } from "three";

/** Brand lime #C4F82A pushed above 1.0 so it crosses a high bloom threshold. */
export const LIME_HDR = new Color("#C4F82A").multiplyScalar(2.1);

/** Bloom luminance threshold for scenes that show text textures. */
export const BLOOM_THRESHOLD_TEXT = 0.8;
