import type { SVGProps } from "react";

/**
 * Profile-only stroke icons (same drawing rules as @/components/ui/Icon:
 * 24-unit viewBox, stroke currentColor 1.75, decorative / aria-hidden).
 */
export interface ProfileIconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** px. Default 20. */
  size?: number;
}

function make(displayName: string, d: string) {
  function Icon({ size = 20, strokeWidth = 1.75, ...rest }: ProfileIconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        <path d={d} />
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}

/** G‘alabalar stat tile */
export const IconCrown = make("IconCrown", "M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5zM5 15h14");
/** Profilni tahrirlash */
export const IconPencil = make("IconPencil", "M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4");
/** Kartani aylantirish */
export const IconFlip = make(
  "IconFlip",
  "M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9M18.5 3v4.3h-4.3M5.5 21v-4.3h4.3",
);
/** Sichqoncha bilan qiyalating */
export const IconCursor = make("IconCursor", "M6 3l12 7-5 1.6L10.5 17zM13 11.6l5 6.4");
