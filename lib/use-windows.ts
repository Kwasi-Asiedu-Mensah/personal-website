"use client";

import { useCallback, useEffect, useState } from "react";
import {
  APPS,
  WINDOW_ID_ORDER,
  WINDOW_RENDER_ORDER,
  type WindowId,
} from "./app-config";
import { clearAppState } from "./sidebar-persistence";

export type { WindowId };

export type WindowState = {
  id: WindowId;
  open: boolean;
  minimized: boolean;
  fullscreen: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
};

const STORAGE_KEY = "macos-desktop-windows-v7";

/** Build the initial window state map from the app registry. */
const initialWindows = (): Record<WindowId, WindowState> => {
  const result = {} as Record<WindowId, WindowState>;
  WINDOW_ID_ORDER.forEach((id) => {
    const app = APPS[id];
    const { x, y, width, height, initiallyOpen } = app.defaultWindow;
    // Render order doubles as the initial z stacking — each app's index
    // becomes its starting z so windows don't all collide at z=1.
    const z = WINDOW_RENDER_ORDER.indexOf(id) + 1;
    result[id] = {
      id,
      open: !!initiallyOpen,
      minimized: false,
      fullscreen: false,
      x,
      y,
      width,
      height,
      z,
    };
  });
  return result;
};

export function useWindows() {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(
    initialWindows
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, Partial<WindowState>>;
        const merged = initialWindows();
        // Only restore geometry — open/minimized/z always reset to defaults
        // so every session starts with a clean slate (no stale open windows).
        (Object.keys(parsed) as WindowId[]).forEach((id) => {
          if (!merged[id]) return;
          const p = parsed[id];
          if (typeof p.x === "number") merged[id].x = p.x;
          if (typeof p.y === "number") merged[id].y = p.y;
          if (typeof p.width === "number") merged[id].width = p.width;
          if (typeof p.height === "number") merged[id].height = p.height;
        });
        setWindows(merged);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
    } catch {
      // ignore
    }
  }, [windows, hydrated]);

  const bringToFront = useCallback((id: WindowId) => {
    setWindows((prev) => {
      const entries = Object.values(prev);
      const maxZ = Math.max(...entries.map((w) => w.z));
      if (prev[id].z === maxZ) return prev;

      const newMax = maxZ + 1;
      const next = { ...prev, [id]: { ...prev[id], z: newMax } };

      // Normalize z values when they grow too large to prevent unbounded growth
      if (newMax > 50) {
        const sorted = (Object.values(next) as WindowState[]).sort((a, b) => a.z - b.z);
        const normalized = { ...next };
        sorted.forEach((w, i) => {
          normalized[w.id as WindowId] = { ...normalized[w.id as WindowId], z: i + 1 };
        });
        return normalized;
      }

      return next;
    });
  }, []);

  const update = useCallback((id: WindowId, patch: Partial<WindowState>) => {
    setWindows((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const close = useCallback((id: WindowId) => {
    // Wipe per-window view state. Minimizing keeps it; closing resets.
    clearAppState(id);
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], open: false, minimized: false },
    }));
  }, []);

  const minimize = useCallback((id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], minimized: true },
    }));
  }, []);

  const toggleFullscreen = useCallback((id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        fullscreen: !prev[id].fullscreen,
        minimized: false,
      },
    }));
  }, []);

  const open = useCallback((id: WindowId) => {
    setWindows((prev) => {
      const maxZ = Math.max(...Object.values(prev).map((w) => w.z));
      return {
        ...prev,
        [id]: {
          ...prev[id],
          open: true,
          minimized: false,
          z: maxZ + 1,
        },
      };
    });
  }, []);

  const visible = Object.values(windows).filter(
    (w) => w.open && !w.minimized
  );
  const activeId =
    visible.length > 0
      ? visible.sort((a, b) => b.z - a.z)[0].id
      : null;

  return {
    windows,
    hydrated,
    bringToFront,
    update,
    close,
    minimize,
    toggleFullscreen,
    open,
    activeId,
  };
}
