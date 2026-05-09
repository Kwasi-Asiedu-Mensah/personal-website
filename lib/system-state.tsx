"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type AirDropMode = "off" | "contacts" | "everyone";

type SystemStateContextValue = {
  wifiOn: boolean;
  setWifiOn: (v: boolean) => void;
  bluetoothOn: boolean;
  setBluetoothOn: (v: boolean) => void;
  airdropMode: AirDropMode;
  setAirdropMode: (v: AirDropMode) => void;
  focusOn: boolean;
  setFocusOn: (v: boolean) => void;
  brightness: number; // 0-100
  setBrightness: (v: number) => void;
  volume: number; // 0-100
  setVolume: (v: number) => void;
  // Static (demo) values
  battery: number; // 0-100
  charging: boolean;
  networkName: string;
};

const STORAGE_KEY = "macos-desktop-system-state-v1";

const DEFAULTS = {
  wifiOn: true,
  bluetoothOn: true,
  airdropMode: "contacts" as AirDropMode,
  focusOn: false,
  brightness: 85,
  volume: 50,
};

const SystemStateContext = createContext<SystemStateContextValue>({
  ...DEFAULTS,
  setWifiOn: () => {},
  setBluetoothOn: () => {},
  setAirdropMode: () => {},
  setFocusOn: () => {},
  setBrightness: () => {},
  setVolume: () => {},
  battery: 97,
  charging: false,
  networkName: "[your network]",
});

export function SystemStateProvider({ children }: { children: ReactNode }) {
  const [wifiOn, setWifiOn] = useState(DEFAULTS.wifiOn);
  const [bluetoothOn, setBluetoothOn] = useState(DEFAULTS.bluetoothOn);
  const [airdropMode, setAirdropMode] = useState<AirDropMode>(
    DEFAULTS.airdropMode
  );
  const [focusOn, setFocusOn] = useState(DEFAULTS.focusOn);
  const [brightness, setBrightness] = useState(DEFAULTS.brightness);
  const [volume, setVolume] = useState(DEFAULTS.volume);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved) as Partial<typeof DEFAULTS>;
        if (typeof p.wifiOn === "boolean") setWifiOn(p.wifiOn);
        if (typeof p.bluetoothOn === "boolean") setBluetoothOn(p.bluetoothOn);
        if (
          p.airdropMode === "off" ||
          p.airdropMode === "contacts" ||
          p.airdropMode === "everyone"
        )
          setAirdropMode(p.airdropMode);
        if (typeof p.focusOn === "boolean") setFocusOn(p.focusOn);
        if (typeof p.brightness === "number") setBrightness(p.brightness);
        if (typeof p.volume === "number") setVolume(p.volume);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // Persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          wifiOn,
          bluetoothOn,
          airdropMode,
          focusOn,
          brightness,
          volume,
        })
      );
    } catch {
      // ignore
    }
  }, [wifiOn, bluetoothOn, airdropMode, focusOn, brightness, volume, hydrated]);

  return (
    <SystemStateContext.Provider
      value={{
        wifiOn,
        setWifiOn,
        bluetoothOn,
        setBluetoothOn,
        airdropMode,
        setAirdropMode,
        focusOn,
        setFocusOn,
        brightness,
        setBrightness,
        volume,
        setVolume,
        battery: 97,
        charging: false,
        networkName: "Asiedu-mensah",
      }}
    >
      {children}
    </SystemStateContext.Provider>
  );
}

export function useSystemState() {
  return useContext(SystemStateContext);
}
