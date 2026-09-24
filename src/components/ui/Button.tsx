"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { safeQuery, scrollAndFocus } from "@/lib/scroll-store";
import { buttonClasses, type ButtonStyleOptions } from "./buttonStyles";

interface CommonProps extends ButtonStyleOptions {
  /** icon/element rendered after the label */
  iconRight?: ReactNode;
  /** icon/element rendered before the label */
  iconLeft?: ReactNode;
  children: ReactNode;
}

export interface ButtonProps
  extends CommonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {}

/** Real <button> (type="button" by default). */
export function Button({
  variant,
  size,
  iconLeft,
  iconRight,
  block,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses({ variant, size, block, className })} {...rest}>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}

export interface ButtonLinkProps
  extends CommonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> {
  /** internal path ("/games"), same-page hash ("#booking"), cross-page hash ("/#booking") or external URL */
  href: string;
}

/**
 * Link styled as a button. Internal paths use next/link. Hash links that point at the
 * CURRENT page ("#booking", or "/#booking" while on "/") smooth-scroll via Lenis with the
 * fixed-header offset instead of jumping.
 */
export function ButtonLink({
  variant,
  size,
  iconLeft,
  iconRight,
  block,
  className,
  children,
  href,
  onClick,
  ...rest
}: ButtonLinkProps) {
  const pathname = usePathname();
  const cls = buttonClasses({ variant, size, block, className });
  const content = (
    <>
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </>
  );

  const hashIndex = href.indexOf("#");
  const path = hashIndex === -1 ? href : href.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : href.slice(hashIndex);
  const samePageHash = hash.length > 1 && (path === "" || path === pathname);

  if (samePageHash) {
    const handle = (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (!safeQuery(hash)) return;
      e.preventDefault();
      scrollAndFocus(hash);
      window.history.replaceState(null, "", hash);
    };
    return (
      <a href={hash} className={cls} onClick={handle} {...rest}>
        {content}
      </a>
    );
  }

  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={cls} onClick={onClick} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={cls} onClick={onClick} {...rest}>
      {content}
    </Link>
  );
}

export default Button;
