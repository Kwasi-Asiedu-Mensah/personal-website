"use client";

import { useCallback, useEffect, useState } from "react";
import type { WindowId } from "./app-config";

/**
 * Per-app view-state persistence.
 *
 * Background: minimizing or closing a window unmounts the app's React tree
 * (see `components/Window.tsx` — it returns null when not open). That's
 * good for memory but kills any in-component state (selected sidebar item,
 * search query, breadcrumb path, scroll position, etc.) Without help,
 * dragging a Finder window down to the dock and back loses your place.
 *
 * Convention from alanagoyal's site (and ours):
 *   - sessionStorage holds *per-tab* view state. Survives minimize, close,
 *     reopen-in-the-same-tab. Doesn't bleed across tabs or browser
 *     restarts.
 *   - localStorage holds durable preferences (theme, wallpaper, notes,
 *     window layout, etc.) and persists indefinitely.
 *   - Closing a window calls `clearAppState(id)` so the next launch is
 *     fresh. Minimizing does NOT clear — that's the whole point.
 *
 * Storage key shape: `app:<appId>:<key>`. Values are JSON-encoded.
 */

const PREFIX = "app:";

function fullKey(appId: WindowId, key: string): string {
  return `${PREFIX}${appId}:${key}`;
}

/**
 * Like `useState`, but persisted in sessionStorage scoped to an appId.
 *
 * The state hydrates from sessionStorage on mount (avoiding SSR
 * mismatches by always starting with `defaultValue`). Subsequent updates
 * are written through.
 */
export function useSessionState<T>(
  appId: WindowId,
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValueInternal] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once on mount.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(fullKey(appId, key));
      if (raw !== null) {
        setValueInternal(JSON.parse(raw) as T);
      }
    } catch {
      // ignore — corrupt entry, fall back to default
    }
    setHydrated(true);
    // appId+key are stable for the life of the component, so this only
    // runs once. We intentionally don't depend on defaultValue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write through after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(fullKey(appId, key), JSON.stringify(value));
    } catch {
      // quota exceeded or storage unavailable — silently drop
    }
  }, [appId, key, value, hydrated]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValueInternal((prev) =>
        typeof next === "function" ? (next as (p: T) => T)(prev) : next
      );
    },
    []
  );

  return [value, setValue];
}

/**
 * Remove every sessionStorage entry belonging to this app. Called by the
 * window manager when the user closes (not minimizes) the window, so the
 * next open is a clean slate.
 *
 * Safe to call during SSR or in environments without sessionStorage.
 */
export function clearAppState(appId: WindowId): void {
  if (typeof window === "undefined") return;
  try {
    const prefix = `${PREFIX}${appId}:`;
    // Collect keys first to avoid mutating while iterating.
    const toRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}
