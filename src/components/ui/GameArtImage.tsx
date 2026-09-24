import Image from "next/image";
import type { GameSlug } from "@/lib/data";
import { getGameArt } from "@/lib/gameImages";

interface GameArtImageProps {
  slug: GameSlug;
  /** "cover" = portrait 2:3 key art with logo, "hero" = wide key art */
  kind?: "cover" | "hero";
  /** alt text; pass "" when the game title is already next to the image */
  alt: string;
  /** required responsive hint, e.g. "(max-width: 768px) 74vw, 300px" */
  sizes: string;
  /**
   * Focal point as a CSS object-position value ("50% 0%", "50% -26cqw", "var(--art-pos)").
   * Passed as an inline style because next/image positions the blur placeholder from
   * style.objectPosition: a Tailwind object-* class is invisible to it, so the preview would
   * be cropped around the centre and then jump to the real crop. Default: centred.
   */
  position?: string;
  className?: string;
  /** above-the-fold LCP image only */
  preload?: boolean;
}

/**
 * Official game artwork, filling its (relative, sized) parent. Renders nothing
 * when the game has no artwork yet, so callers keep their typographic cover
 * underneath as the fallback.
 */
export function GameArtImage({ slug, kind = "cover", alt, sizes, position, className, preload }: GameArtImageProps) {
  const art = getGameArt(slug);
  if (!art) return null;
  return (
    <Image
      src={art[kind]}
      alt={alt}
      fill
      sizes={sizes}
      placeholder="blur"
      preload={preload}
      style={position ? { objectPosition: position } : undefined}
      className={["object-cover", className].filter(Boolean).join(" ")}
    />
  );
}
