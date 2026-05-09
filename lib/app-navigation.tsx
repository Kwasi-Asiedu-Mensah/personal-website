"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { WindowId } from "./app-config";

/**
 * Lightweight cross-app navigation bus.
 *
 * One surface (e.g. a clickable song in the Notes app) can ask another
 * surface (e.g. the Music app) to open at a particular view and optionally
 * carry a payload (e.g. "auto-play this track"). The Desktop component
 * listens for the open request and opens the window; the destination app
 * listens for the same request to apply view/data.
 *
 * `nonce` makes every navigate() distinct so subscribers can dedupe with a
 * ref, allowing "navigate to the same place again" to re-fire the effect.
 */

export type NavRequest = {
  app: WindowId;
  /** Free-form view identifier the destination app understands. */
  view?: string;
  /** Optional payload — currently only `trackId` is consumed (by Music). */
  data?: { trackId?: string };
  /** Wall-clock timestamp at request creation; serves as the dedupe key. */
  nonce: number;
};

type AppNavigationContextValue = {
  request: NavRequest | null;
  navigate: (req: Omit<NavRequest, "nonce">) => void;
};

const AppNavigationContext = createContext<AppNavigationContextValue>({
  request: null,
  navigate: () => {},
});

export function AppNavigationProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<NavRequest | null>(null);

  const navigate = useCallback((req: Omit<NavRequest, "nonce">) => {
    setRequest({ ...req, nonce: Date.now() });
  }, []);

  return (
    <AppNavigationContext.Provider value={{ request, navigate }}>
      {children}
    </AppNavigationContext.Provider>
  );
}

export function useAppNavigation() {
  return useContext(AppNavigationContext);
}
