"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type RecentEntry = {
  name: string;
  openedAt: number; // epoch ms
};

const STORAGE_KEY = "macos-desktop-recents-v1";
const MAX_RECENTS = 20;

type RecentsContextValue = {
  recents: RecentEntry[];
  addRecent: (name: string) => void;
  clearRecents: () => void;
};

const RecentsContext = createContext<RecentsContextValue>({
  recents: [],
  addRecent: () => {},
  clearRecents: () => {},
});

export function RecentsProvider({ children }: { children: ReactNode }) {
  const [recents, setRecents] = useState<RecentEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as RecentEntry[];
        if (Array.isArray(parsed)) setRecents(parsed.slice(0, MAX_RECENTS));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
    } catch {
      // ignore
    }
  }, [recents, hydrated]);

  const addRecent = useCallback((name: string) => {
    setRecents((prev) => {
      const filtered = prev.filter((r) => r.name !== name);
      return [{ name, openedAt: Date.now() }, ...filtered].slice(
        0,
        MAX_RECENTS
      );
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
  }, []);

  return (
    <RecentsContext.Provider value={{ recents, addRecent, clearRecents }}>
      {children}
    </RecentsContext.Provider>
  );
}

export function useRecents() {
  return useContext(RecentsContext);
}

/** Friendly relative-time label for a recent open timestamp. */
export function relativeTime(ts: number, now: number = Date.now()): string {
  const diff = now - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) {
    const m = Math.floor(diff / 60_000);
    return `${m} min${m === 1 ? "" : "s"} ago`;
  }
  if (diff < 86_400_000) {
    const h = Math.floor(diff / 3_600_000);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(diff / 86_400_000);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `${w} week${w === 1 ? "" : "s"} ago`;
  }
  if (days < 365) {
    const mo = Math.floor(days / 30);
    return `${mo} month${mo === 1 ? "" : "s"} ago`;
  }
  return `${Math.floor(days / 365)}y ago`;
}
