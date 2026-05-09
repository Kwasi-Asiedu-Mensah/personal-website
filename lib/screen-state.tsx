"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ScreenState =
  | "active"
  | "sleep"
  | "lock"
  | "shutdown"
  | "restart";

type ScreenStateContextValue = {
  state: ScreenState;
  setState: (s: ScreenState) => void;
};

const ScreenStateContext = createContext<ScreenStateContextValue>({
  state: "active",
  setState: () => {},
});

export function ScreenStateProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<ScreenState>("active");

  // Restart: black with Apple logo for ~3s, then go to lock screen.
  useEffect(() => {
    if (state === "restart") {
      const t = setTimeout(() => setStateInternal("lock"), 3000);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <ScreenStateContext.Provider value={{ state, setState: setStateInternal }}>
      {children}
    </ScreenStateContext.Provider>
  );
}

export function useScreenState() {
  return useContext(ScreenStateContext);
}
