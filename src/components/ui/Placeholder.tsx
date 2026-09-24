import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PlaceholderProps {
  /** the token INCLUDING brackets, e.g. "[NARX]" */
  children: string;
  /** sm = 12px, md = inherits (0.875em), lg = display stat tile (18–22px). Default "md". */
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE: Record<NonNullable<PlaceholderProps["size"]>, string> = {
  sm: "text-[12px]",
  md: "",
  lg: "text-[18px] md:text-[22px] px-2 py-0.5",
};

/**
 * Intentional placeholder chip for unknown facts (mono, dim, dashed border — never red).
 *   <Placeholder>[NARX]</Placeholder>
 */
export function Placeholder({ children, size = "md", className }: PlaceholderProps) {
  return <span className={cn("ph", SIZE[size], className)}>{children}</span>;
}

const TOKEN = /(\[[^\]]+\])/g;

/** true when the string contains a [PLACEHOLDER] token */
export function hasPlaceholder(text: string): boolean {
  return /\[[^\]]+\]/.test(text);
}

export interface PhTextProps {
  /** any copy that may contain [TOKENS], e.g. "Hozir bo‘sh: [SON] joy" */
  text: string;
  size?: PlaceholderProps["size"];
  /** class for each chip */
  chipClassName?: string;
}

/**
 * Renders text, turning every [TOKEN] into a <Placeholder/> chip.
 *   <PhText text="[NARX] so‘m / soat" />
 */
export function PhText({ text, size, chipClassName }: PhTextProps): ReactNode {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Placeholder key={i} size={size} className={chipClassName}>
            {part}
          </Placeholder>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

export default Placeholder;
