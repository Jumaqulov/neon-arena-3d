import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "group/btn relative inline-flex select-none items-center justify-center gap-3 whitespace-nowrap rounded-btn font-sans font-semibold leading-none no-underline transition-[filter,translate,background-color,border-color,color,box-shadow] duration-200 ease-out disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-lime text-ground shadow-glow hover:-translate-y-0.5 hover:brightness-[1.08] active:translate-y-0 disabled:bg-line disabled:text-muted disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:brightness-100",
  secondary:
    "border border-ink/30 bg-transparent text-ink hover:border-ink hover:bg-ink/[0.06] disabled:opacity-50",
  ghost: "bg-transparent text-muted hover:text-ink disabled:opacity-50",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-11 px-4 text-[14px]",
  md: "h-12 px-6 text-[15px]",
  lg: "h-14 px-7 text-[16px]",
};

export interface ButtonStyleOptions {
  /** primary = lime fill + glow; secondary = hairline outline; ghost = text only. Default "primary". */
  variant?: ButtonVariant;
  /** sm = 44px, md = 48px (default), lg = 56px tall */
  size?: ButtonSize;
  /** stretch to full width */
  block?: boolean;
  className?: string;
}

/**
 * Button class string — usable from Server Components too (e.g. on a plain <Link>/<a>).
 *   <Link href="/oyinlar" className={buttonClasses({ variant: "secondary" })}>Barchasi</Link>
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  block = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], block && "w-full", className);
}
