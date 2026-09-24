"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BOOKING_HREF, BOOKING_LABEL, NAV, type NavItem } from "@/lib/data";
import { cn } from "@/lib/cn";
import { getLenis } from "@/lib/scroll-store";
import Logo from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrowRight, IconClose, IconMenu } from "@/components/ui/Icon";

function isActive(pathname: string, href: NavItem["href"]): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Fixed site header (z-50), height var(--header-h) = 64px (<1024px) / 88px (≥1024px).
 * Desktop nav ≥1024px; below that a disclosure menu button (aria-expanded/aria-controls).
 */
export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  /** releases the open-menu scroll lock (idempotent); null while the menu is closed */
  const unlockRef = useRef<(() => void) | null>(null);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  /**
   * Menu CTA: release the scroll lock synchronously BEFORE the link scrolls. Lenis ignores
   * scrollTo() while stopped, and the effect cleanup (lenis.start → reset) would run too late.
   */
  const closeForScroll = useCallback(() => {
    unlockRef.current?.();
    close(false);
  }, [close]);

  // Lock scroll + Escape + focus first link while the menu is open
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // The overlay covers the page: make everything underneath inert so Tab / screen-reader
    // browsing stays inside the header + menu (the toggle stays reachable to close it).
    const covered = Array.from(
      document.querySelectorAll<HTMLElement>("#main, footer.site-footer, .skip-link"),
    ).filter((el) => !el.hasAttribute("inert"));
    covered.forEach((el) => el.setAttribute("inert", ""));
    let locked = true;
    // also lifts inert synchronously, so the menu CTA can focus its #booking target
    const unlock = () => {
      if (!locked) return;
      locked = false;
      covered.forEach((el) => el.removeAttribute("inert"));
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
    };
    unlockRef.current = unlock;
    const first = panelRef.current?.querySelector<HTMLElement>("a,button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const mql = window.matchMedia("(min-width: 1024px)");
    const onBp = () => {
      if (mql.matches) close(false);
    };
    window.addEventListener("keydown", onKey);
    mql.addEventListener("change", onBp);
    return () => {
      window.removeEventListener("keydown", onKey);
      mql.removeEventListener("change", onBp);
      unlockRef.current = null;
      unlock();
    };
  }, [open, close]);

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)] border-b border-line bg-ground/85 backdrop-blur-md supports-[backdrop-filter]:bg-ground/70">
      <div className="container-page flex h-full items-center justify-between gap-6">
        <Logo onClick={() => close(false)} />

        <nav aria-label="Asosiy menyu" className="hidden lg:block">
          <ul className="flex items-center gap-10">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-11 items-center border-b-2 pt-0.5 text-[15px] font-medium no-underline transition-colors duration-200",
                      active ? "border-lime text-lime" : "border-transparent text-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink href={BOOKING_HREF} size="md" className="max-sm:hidden">
            {BOOKING_LABEL}
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-12 items-center justify-center rounded-btn border border-line text-ink transition-colors hover:border-ink/60 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>
    </header>

      {/* Sibling of <header> (backdrop-filter would otherwise trap position:fixed) */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        data-lenis-prevent
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-ground lg:hidden"
      >
        <nav aria-label="Mobil menyu" className="container-page flex min-h-full flex-col gap-10 py-10">
          <ul className="flex flex-col">
            {NAV.map((item, i) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => close(false)}
                    className={cn(
                      "flex min-h-[72px] items-center justify-between gap-4 font-display text-[28px] font-bold uppercase tracking-[-0.02em] no-underline",
                      active ? "text-lime" : "text-ink",
                    )}
                  >
                    <span>{item.label}</span>
                    <span aria-hidden="true" className="font-mono text-[14px] font-medium tracking-[0.08em] text-muted">
                      0{i + 1}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ButtonLink
            href={BOOKING_HREF}
            size="lg"
            block
            onClick={closeForScroll}
            iconRight={<IconArrowRight />}
          >
            {BOOKING_LABEL}
          </ButtonLink>
        </nav>
      </div>
    </>
  );
}
