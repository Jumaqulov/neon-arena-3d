"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PROFILE } from "@/lib/data";
import { ScrollTrigger } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll-store";
import { cn } from "@/lib/cn";
import BigOutlineWord from "@/components/motion/BigOutlineWord";
import Parallax from "@/components/motion/Parallax";
import SectionHeading from "@/components/ui/SectionHeading";
import { CssHoloCube } from "@/components/three/fallbacks";
import { useProfile, type ProfileTabId } from "./ProfileProvider";
import BookingsPanel from "./BookingsPanel";
import AchievementsPanel from "./AchievementsPanel";
import SettingsPanel, { type SettingsValues } from "./SettingsPanel";

const TABS = PROFILE.tabs;
const C = PROFILE.cabinet;
const TABLIST_LABEL = "Profil bo‘limlari";

/**
 * "Mening arenam" cabinet: tabs Bronlar / Yutuqlar / Sozlamalar (WAI-ARIA tabs: roving
 * tabindex, ←/→/Home/End). All three tabpanel containers always exist (aria-controls
 * resolves); only the active one renders content, so its 3D entrance plays on open.
 * State lives here so it survives tab switches.
 */
export default function ProfileCabinet() {
  const { tab, setTab, editRequest } = useProfile();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [cancelled, setCancelled] = useState(false);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState<SettingsValues>({
    nick: PROFILE.handle,
    phone: "",
    game: PROFILE.defaultFavoriteGame,
    notify: true,
  });
  // "saved" is true only for the latest edit session: a new "Profilni tahrirlash" press
  // (editRequest++) or any field change clears it.
  const [savedFor, setSavedFor] = useState<number | null>(null);
  const saved = savedFor === editRequest;

  const toggleCoin = useCallback((id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const changeSettings = useCallback((patch: Partial<SettingsValues>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setSavedFor(null);
  }, []);

  // panel height changes → later ScrollTriggers (favourites, footer) must re-measure
  const firstTab = useRef(true);
  useEffect(() => {
    if (firstTab.current) {
      firstTab.current = false;
      return;
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [tab]);

  // hero "Profilni tahrirlash" → scroll to the cabinet and focus the first field
  useEffect(() => {
    if (editRequest === 0) return;
    scrollToTarget("#kabinet");
    document.getElementById("set-nick")?.focus({ preventScroll: true });
  }, [editRequest]);

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = TABS.length - 1;
    if (n < 0) return;
    e.preventDefault();
    setTab(TABS[n].id);
    tabRefs.current[n]?.focus();
  };

  const renderPanel = (id: ProfileTabId) => {
    if (id === "bookings") return <BookingsPanel cancelled={cancelled} onCancel={() => setCancelled(true)} />;
    if (id === "achievements") return <AchievementsPanel flipped={flipped} onToggle={toggleCoin} />;
    return (
      <SettingsPanel
        values={settings}
        onChange={changeSettings}
        saved={saved}
        onSave={() => setSavedFor(editRequest)}
      />
    );
  };

  return (
    <section
      id="kabinet"
      aria-labelledby="kabinet-title"
      className="relative isolate overflow-hidden border-t border-line pb-14 pt-20 md:pb-16 md:pt-28 xl:pt-32"
    >
      <BigOutlineWord word="KABINET" className="-top-2 left-0" speed={-0.3} />

      {/* decorative depth layers (parallax at different speeds) */}
      <Parallax
        speed={0.55}
        aria-hidden="true"
        className="pointer-events-none absolute right-[5%] top-[18%] z-0 hidden md:block"
      >
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none" stroke="#C4F82A" strokeOpacity={0.22}>
          <circle cx="90" cy="90" r="88" />
          <circle cx="90" cy="90" r="64" strokeDasharray="3 7" />
          <path d="M90 0v24M90 156v24M0 90h24M156 90h24" strokeOpacity={0.4} />
        </svg>
      </Parallax>
      <Parallax
        speed={-0.25}
        rotate={25}
        aria-hidden="true"
        className="pointer-events-none absolute left-[2%] top-[52%] z-0 hidden lg:block"
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#C4F82A" strokeOpacity={0.35}>
          <path d="M32 4v18M32 42v18M4 32h18M42 32h18" />
          <circle cx="32" cy="32" r="6" />
        </svg>
      </Parallax>
      <Parallax
        speed={0.9}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[12%] right-[10%] z-0 hidden md:block"
      >
        <CssHoloCube size={52} />
      </Parallax>

      <div className="container-page relative z-10 flex flex-col gap-10 md:gap-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <SectionHeading id="kabinet-title" eyebrow={C.eyebrow} title={C.title} lead={C.lead} className="max-w-[680px]" />

          <div
            role="tablist"
            aria-label={TABLIST_LABEL}
            onKeyDown={onTabKey}
            className="grid w-full shrink-0 grid-cols-3 gap-1.5 rounded-[14px] border border-line bg-surface p-1.5 sm:inline-flex sm:w-auto sm:self-start lg:self-auto"
          >
            {TABS.map((t, i) => {
              const selected = t.id === tab;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${t.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "inline-flex h-12 items-center justify-center gap-2.5 rounded-btn px-2 text-[14px] font-semibold transition-[background-color,color,box-shadow] duration-200 sm:px-6 sm:text-[15px]",
                    selected ? "bg-lime text-ground shadow-glow" : "text-muted hover:bg-raised hover:text-ink",
                  )}
                >
                  <span aria-hidden="true" className="hidden font-mono text-[12px] font-bold tracking-[0.08em] sm:inline">
                    {t.num}
                  </span>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:min-h-[830px]">
          {TABS.map((t) => (
            <div
              key={t.id}
              role="tabpanel"
              id={`panel-${t.id}`}
              aria-labelledby={`tab-${t.id}`}
              tabIndex={0}
              hidden={t.id !== tab}
              className="rounded-card"
            >
              {t.id === tab ? renderPanel(t.id) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
