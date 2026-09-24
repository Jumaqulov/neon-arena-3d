/** Intrinsic tags the polymorphic motion wrappers (Reveal / Parallax / Tilt) can render as. */
export type MotionTag =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "nav"
  | "ul"
  | "ol"
  | "li"
  | "dl"
  | "span"
  | "p"
  | "figure"
  | "h2"
  | "h3"
  | "a";

/** A pinned ancestor for ScrollTrigger's `pinnedContainer`: a selector or a ref. */
export type PinnedContainer = string | { readonly current: Element | null };

export function resolvePinnedContainer(p: PinnedContainer | undefined): Element | string | undefined {
  if (p === undefined) return undefined;
  if (typeof p === "string") return p;
  return p.current ?? undefined;
}
