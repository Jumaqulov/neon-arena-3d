import type { ReactNode, SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /** px. Default 20. */
  size?: number;
  /** accessible name; when omitted the icon is aria-hidden (decorative). */
  title?: string;
}

/**
 * Inline stroke icons: stroke="currentColor", stroke-width 1.75, fill none, 24×24 viewBox.
 * Decorative by default (aria-hidden). Pass `title` for a standalone meaningful icon.
 */
function make(displayName: string, body: ReactNode) {
  function Icon({ size = 20, title, strokeWidth = 1.75, ...rest }: IconProps) {
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
        aria-hidden={title ? undefined : true}
        role={title ? "img" : undefined}
        focusable="false"
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {body}
      </svg>
    );
  }
  Icon.displayName = displayName;
  return Icon;
}

export const IconArrowRight = make("IconArrowRight", <path d="M5 12h14M13 6l6 6-6 6" />);
export const IconArrowLeft = make("IconArrowLeft", <path d="M19 12H5M11 6l-6 6 6 6" />);
export const IconArrowUpRight = make("IconArrowUpRight", <path d="M7 17 17 7M8 7h9v9" />);
export const IconArrowUp = make("IconArrowUp", <path d="M12 19V5M5 12l7-7 7 7" />);
export const IconArrowDown = make("IconArrowDown", <path d="M12 5v14M19 12l-7 7-7-7" />);
export const IconTrendSame = make("IconTrendSame", <path d="M5 12h14" />);
export const IconChevronDown = make("IconChevronDown", <path d="m6 9 6 6 6-6" />);
export const IconChevronRight = make("IconChevronRight", <path d="m9 6 6 6-6 6" />);
export const IconChevronLeft = make("IconChevronLeft", <path d="m15 6-6 6 6 6" />);
export const IconMenu = make("IconMenu", <path d="M4 7h16M4 12h16M4 17h10" />);
export const IconClose = make("IconClose", <path d="M6 6l12 12M18 6 6 18" />);
export const IconPlus = make("IconPlus", <path d="M12 5v14M5 12h14" />);
export const IconMinus = make("IconMinus", <path d="M5 12h14" />);
export const IconCheck = make("IconCheck", <path d="m5 12.5 4.5 4.5L19 7.5" />);
export const IconCalendar = make(
  "IconCalendar",
  <path d="M4 6.5h16V20H4zM4 10.5h16M8 3.5v5M16 3.5v5" />,
);
export const IconClock = make("IconClock", <path d="M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM12 7v5l3 2" />);
export const IconUsers = make(
  "IconUsers",
  <path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.2a6.5 6.5 0 0 1 3.5 5.8" />,
);
export const IconUser = make("IconUser", <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0" />);
export const IconMonitor = make("IconMonitor", <path d="M3 4.5h18v12H3zM8.5 20.5h7M12 16.5v4" />);
export const IconCpu = make(
  "IconCpu",
  <path d="M7 7h10v10H7zM10 10h4v4h-4zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4" />,
);
export const IconGpu = make(
  "IconGpu",
  <path d="M2.5 7h19v10h-19zM6 17v3M2.5 10H1M7.5 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0M15 10.5h3.5M15 13.5h3.5" />,
);
export const IconGamepad = make(
  "IconGamepad",
  <path d="M7 8h10a5 5 0 0 1 4.8 6.4l-.9 3.1a2.3 2.3 0 0 1-4 .8L15 16H9l-1.9 2.3a2.3 2.3 0 0 1-4-.8l-.9-3.1A5 5 0 0 1 7 8zM7.5 11v3M6 12.5h3M15.5 12h.01M17.5 13.5h.01" />,
);
export const IconHeadset = make(
  "IconHeadset",
  <path d="M4 15v-3a8 8 0 0 1 16 0v3M4 15h3v5H5a1 1 0 0 1-1-1zM20 15h-3v5h2a1 1 0 0 0 1-1z" />,
);
export const IconTrophy = make(
  "IconTrophy",
  <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />,
);
export const IconMoon = make("IconMoon", <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />);
export const IconShield = make(
  "IconShield",
  <path d="M12 3l7 3v5c0 4.5-3 8-7 10c-4-2-7-5.5-7-10V6zM9 12l2 2 4-4" />,
);
export const IconLock = make("IconLock", <path d="M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3M12 15v2" />);
export const IconMapPin = make(
  "IconMapPin",
  <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
);
export const IconPhone = make(
  "IconPhone",
  <path d="M5 3.5h4l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5l1.5-2.5 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5a2 2 0 0 1 2-2z" />,
);
export const IconQr = make(
  "IconQr",
  <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2M14 18v2h2M18 18h2v2" />,
);
export const IconRotate = make("IconRotate", <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5" />);
export const IconPlay = make("IconPlay", <path d="M7 4.5v15l12-7.5z" />);
export const IconEye = make(
  "IconEye",
  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
);
export const IconSeat = make(
  "IconSeat",
  <path d="M7 4h10v8H7zM5 12h14v3H5zM8 15v5M16 15v5" />,
);
export const IconBolt = make("IconBolt", <path d="M13 2 4 14h7l-1 8 9-12h-7z" />);
export const IconStar = make(
  "IconStar",
  <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
);
export const IconFilter = make("IconFilter", <path d="M4 5h16M7 12h10M10 19h4" />);
export const IconSettings = make(
  "IconSettings",
  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-1.8 1l-.3 2h-4l-.3-2a7 7 0 0 1-1.8-1l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-3L3 9.3l2-3.4 1.9.7a7 7 0 0 1 1.8-1l.3-2h4l.3 2a7 7 0 0 1 1.8 1l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 3z" />,
);
export const IconTicket = make(
  "IconTicket",
  <path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 7v10" />,
);
/** Isometric cube outline (logo mark) on a 24 grid. */
export const IconCube = make("IconCube", <path d="M12 2.5 21 7.7v8.6l-9 5.2-9-5.2V7.7zM3 7.7l9 5.2 9-5.2M12 12.9v8.6" />);

/** Map of achievement icon keys (see data.ts AchievementIcon) → component. */
export const ACHIEVEMENT_ICONS = {
  trophy: IconTrophy,
  moon: IconMoon,
  shield: IconShield,
  clock: IconClock,
  headset: IconHeadset,
  lock: IconLock,
} as const;
