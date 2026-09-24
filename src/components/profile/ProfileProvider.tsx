"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { PROFILE } from "@/lib/data";

export type ProfileTabId = (typeof PROFILE.tabs)[number]["id"];

interface ProfileContextValue {
  /** active cabinet tab */
  tab: ProfileTabId;
  setTab: (tab: ProfileTabId) => void;
  /** increments each time "Profilni tahrirlash" is pressed (0 = never) */
  editRequest: number;
  /** hero → cabinet: open the Sozlamalar tab, scroll there and focus the first field */
  openSettings: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

/** Page-level state shared by the hero (edit button) and the cabinet tabs. */
export default function ProfileProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<ProfileTabId>("bookings");
  const [editRequest, setEditRequest] = useState(0);

  const openSettings = useCallback(() => {
    setTab("settings");
    setEditRequest((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ tab, setTab, editRequest, openSettings }),
    [tab, editRequest, openSettings],
  );

  return <ProfileContext value={value}>{children}</ProfileContext>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile() must be used inside <ProfileProvider>");
  return ctx;
}
