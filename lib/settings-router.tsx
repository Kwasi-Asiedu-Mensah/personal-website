"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type SettingsPane = "wifi" | "bluetooth" | "general" | "appearance";

type SettingsRouterContextValue = {
  pane: SettingsPane;
  /**
   * Optional anchor the destination pane can react to (e.g. "wallpaper"
   * tells AppearancePane to scroll to the currently-selected wallpaper).
   */
  anchor?: string;
  setPane: (p: SettingsPane, anchor?: string) => void;
  clearAnchor: () => void;
};

const SettingsRouterContext = createContext<SettingsRouterContextValue>({
  pane: "appearance",
  anchor: undefined,
  setPane: () => {},
  clearAnchor: () => {},
});

export function SettingsRouterProvider({ children }: { children: ReactNode }) {
  const [pane, setPaneInternal] = useState<SettingsPane>("appearance");
  const [anchor, setAnchorInternal] = useState<string | undefined>(undefined);

  const setPane = useCallback((p: SettingsPane, a?: string) => {
    setPaneInternal(p);
    setAnchorInternal(a);
  }, []);

  const clearAnchor = useCallback(() => {
    setAnchorInternal(undefined);
  }, []);

  return (
    <SettingsRouterContext.Provider
      value={{ pane, anchor, setPane, clearAnchor }}
    >
      {children}
    </SettingsRouterContext.Provider>
  );
}

export function useSettingsRouter() {
  return useContext(SettingsRouterContext);
}
