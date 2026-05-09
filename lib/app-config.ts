/**
 * Single source of truth for every app in the desktop.
 *
 * If you're adding a new app, this is the only file you should need to
 * edit (plus creating the app component itself). The Dock, Menubar,
 * Finder /Applications/, window-state defaults, and render order all
 * read from this registry.
 *
 * Don't sprinkle app-aware lookups elsewhere — add a helper here.
 */

import type { ReactNode } from "react";
import {
  FinderIcon,
  NotesIcon,
  SettingsIcon,
  TerminalIcon,
  PreviewIcon,
  MusicIcon,
  WeatherIcon,
} from "@/components/icons/DockIcons";

/* =============================== Types =============================== */

/** Canonical identifier for each app/window. */
export type WindowId =
  | "finder"
  | "notes"
  | "terminal"
  | "settings"
  | "preview"
  | "music"
  | "weather";

export type DefaultWindow = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Whether the window is open at first render. Used by Notes. */
  initiallyOpen?: boolean;
};

export type AppConfig = {
  id: WindowId;
  /** Display name in the dock tooltip, menu bar, Finder Applications, etc. */
  label: string;
  /** Icon component used by Dock and Finder /Applications/. */
  Icon: () => ReactNode;
  /** Default window dimensions and starting position. */
  defaultWindow: DefaultWindow;
  /** Whether this app appears as a clickable dock icon. */
  showOnDock: boolean;
  /** Whether this app appears in Finder /Applications/. */
  showInApplications: boolean;
  /** Brand hex used for active indicators, selection highlights, and app-specific accents. */
  accentColor: string;
};

/* ============================== Registry ============================== */

export const APPS: Record<WindowId, AppConfig> = {
  finder: {
    id: "finder",
    label: "Finder",
    Icon: FinderIcon,
    defaultWindow: { x: 160, y: 100, width: 920, height: 560 },
    showOnDock: true,
    showInApplications: true,
    accentColor: "#007AFF",
  },
  notes: {
    id: "notes",
    label: "Notes",
    Icon: NotesIcon,
    defaultWindow: {
      x: 80,
      y: 80,
      width: 1100,
      height: 720,
      initiallyOpen: true,
    },
    showOnDock: true,
    showInApplications: true,
    accentColor: "#FFCC00",
  },
  terminal: {
    id: "terminal",
    label: "Terminal",
    Icon: TerminalIcon,
    defaultWindow: { x: 280, y: 180, width: 820, height: 520 },
    showOnDock: true,
    showInApplications: true,
    accentColor: "#00D455",
  },
  settings: {
    id: "settings",
    label: "System Settings",
    Icon: SettingsIcon,
    defaultWindow: { x: 220, y: 140, width: 900, height: 620 },
    showOnDock: true,
    showInApplications: true,
    accentColor: "#8E8E93",
  },
  preview: {
    id: "preview",
    label: "Preview",
    Icon: PreviewIcon,
    defaultWindow: { x: 320, y: 140, width: 720, height: 560 },
    /** Preview is launched implicitly by opening files in Finder. */
    showOnDock: false,
    showInApplications: true,
    accentColor: "#007AFF",
  },
  music: {
    id: "music",
    label: "Music",
    Icon: MusicIcon,
    // 640 height keeps the now-playing bar above the dock at the default
    // position (110 + 640 = 750, well above a typical dock at 800+).
    defaultWindow: { x: 240, y: 90, width: 1080, height: 640 },
    showOnDock: true,
    showInApplications: true,
    accentColor: "#FA2D48",
  },
  weather: {
    id: "weather",
    label: "Weather",
    Icon: WeatherIcon,
    defaultWindow: { x: 200, y: 80, width: 820, height: 580 },
    showOnDock: true,
    showInApplications: true,
    accentColor: "#0A7CFF",
  },
};

/**
 * Layout of the dock left-to-right. Mix of app ids and special slots.
 *   - "divider" renders a vertical separator line
 *   - "trash" renders the (currently inert) trash icon
 */
export type DockEntry = WindowId | "divider" | "trash";

export const DOCK_LAYOUT: DockEntry[] = [
  "finder",
  "notes",
  "music",
  "weather",
  "terminal",
  "settings",
  "divider",
  "trash",
];

/**
 * Render order for window components in the desktop. Lower index renders
 * first (lower z-index in the static order). Focus state then mutates the
 * z dynamically — see `lib/use-windows.ts`.
 */
export const WINDOW_RENDER_ORDER: WindowId[] = [
  "finder",
  "settings",
  "terminal",
  "preview",
  "weather",
  "music",
  "notes",
];

/* ============================== Helpers ============================== */

/** Get the AppConfig for a window id. Always returns a value. */
export function getApp(id: WindowId): AppConfig {
  return APPS[id];
}

/** All apps that should appear in Finder /Applications/, in registry order. */
export function applicationsList(): AppConfig[] {
  return WINDOW_ID_ORDER.map((id) => APPS[id]).filter(
    (a) => a.showInApplications
  );
}

/** Reverse lookup by display label (e.g. "System Settings" → settings app). */
export function appByLabel(label: string): AppConfig | undefined {
  for (const id of WINDOW_ID_ORDER) {
    if (APPS[id].label === label) return APPS[id];
  }
  return undefined;
}

/** Display label for a window id; falls back to the id itself if unknown. */
export function appLabel(id: string): string {
  return (APPS as Record<string, AppConfig | undefined>)[id]?.label ?? id;
}

/** All registered window ids, in registry order. */
export const WINDOW_ID_ORDER: WindowId[] = [
  "finder",
  "notes",
  "terminal",
  "settings",
  "preview",
  "music",
  "weather",
];
