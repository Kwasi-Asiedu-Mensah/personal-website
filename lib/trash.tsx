"use client";

/**
 * Working Trash.
 *
 * Desktop icons dragged onto the dock's trash land here; the dock icon
 * swaps to a "full" state; the desktop context menu can empty it or put
 * everything back. Finder's Trash folder merges these items in when
 * rendering. Persisted to localStorage.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type TrashedItem = {
  name: string;
  ext: string;
  trashedAt: number;
};

const STORAGE_KEY = "desktop-trash";

/**
 * Module-level snapshot so non-reactive code (Finder's virtual folder
 * resolver) can read the current contents at render time.
 */
let snapshot: TrashedItem[] = [];
export function trashSnapshot(): TrashedItem[] {
  return snapshot;
}

type TrashContextValue = {
  items: TrashedItem[];
  trash: (item: Omit<TrashedItem, "trashedAt">) => void;
  putBackAll: () => TrashedItem[];
  empty: () => void;
};

const TrashContext = createContext<TrashContextValue>({
  items: [],
  trash: () => {},
  putBackAll: () => [],
  empty: () => {},
});

export function TrashProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<TrashedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TrashedItem[];
        setItems(parsed);
        snapshot = parsed;
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: TrashedItem[]) => {
    snapshot = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const trash = useCallback((item: Omit<TrashedItem, "trashedAt">) => {
    setItems((prev) => {
      const next = [...prev, { ...item, trashedAt: Date.now() }];
      persist(next);
      return next;
    });
  }, []);

  const putBackAll = useCallback(() => {
    let restored: TrashedItem[] = [];
    setItems((prev) => {
      restored = prev;
      persist([]);
      return [];
    });
    return restored;
  }, []);

  const empty = useCallback(() => {
    setItems(() => {
      persist([]);
      return [];
    });
  }, []);

  return (
    <TrashContext.Provider value={{ items, trash, putBackAll, empty }}>
      {children}
    </TrashContext.Provider>
  );
}

export function useTrash() {
  return useContext(TrashContext);
}
