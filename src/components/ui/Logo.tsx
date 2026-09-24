import Link from "next/link";
import { cn } from "@/lib/cn";

/** 32px isometric cube outline in lime (decorative). */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="#C4F82A"
      strokeWidth={1.75}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M16 3 28 10v12L16 29 4 22V10z" />
      <path d="M4 10l12 7 12-7M16 17v12" />
    </svg>
  );
}

/**
 * Logo link: cube mark + NEON ARENA wordmark → "/".
 *   <Logo />   <Logo onClick={close} />
 */
export default function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="NEON ARENA — Bosh sahifa"
      className={cn("inline-flex min-h-11 items-center gap-3 text-ink no-underline", className)}
    >
      <LogoMark />
      <span className="font-display text-[16px] font-extrabold uppercase leading-none tracking-[0.04em] sm:text-[18px]">
        NEON ARENA
      </span>
    </Link>
  );
}
