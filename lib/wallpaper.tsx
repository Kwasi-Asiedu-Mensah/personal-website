"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * If the user drops a JPG/PNG named after a wallpaper id into
 * /public/wallpapers/, this hook reports that the image is loadable so the
 * Desktop / Sphere can swap from CSS gradient to the real photo.
 */
export function useImageExists(url: string): boolean {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setExists(true);
    };
    img.onerror = () => {
      if (!cancelled) setExists(false);
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [url]);
  return exists;
}

export const WALLPAPER_EXTENSIONS = ["jpg", "jpeg", "png", "heic"] as const;

/** Returns a list of candidate URLs to try, in priority order. */
export function wallpaperUrlCandidates(id: string): string[] {
  return WALLPAPER_EXTENSIONS.map((ext) => `/wallpapers/${id}.${ext}`);
}

/**
 * Tries each candidate URL until one loads. Returns the first matching URL
 * (or null if none resolved yet / they all 404).
 */
export function useWallpaperImage(id: string): string | null {
  const [resolved, setResolved] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    setResolved(null);
    const tryNext = (i: number) => {
      const candidates = wallpaperUrlCandidates(id);
      if (i >= candidates.length) return;
      const img = new window.Image();
      img.onload = () => {
        if (!cancelled) setResolved(candidates[i]);
      };
      img.onerror = () => {
        if (!cancelled) tryNext(i + 1);
      };
      img.src = candidates[i];
    };
    tryNext(0);
    return () => {
      cancelled = true;
    };
  }, [id]);
  return resolved;
}

export type WallpaperId =
  | "leopard"
  | "snow-leopard"
  | "lion"
  | "mountain-lion"
  | "mavericks"
  | "yosemite"
  | "el-capitan"
  | "sierra"
  | "mojave"
  | "sonoma"
  | "sequoia"
  | "tahoe";

export type Wallpaper = {
  id: WallpaperId;
  label: string;
  subtitle: string;
  /** CSS background for the small picker orb */
  sphere: string;
  /** CSS background for the full desktop */
  desktop: string;
  /** Whether to overlay subtle stars on the desktop (space-y wallpapers) */
  stars?: boolean;
};

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "leopard",
    label: "Leopard",
    subtitle: "10.5",
    sphere:
      "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4) 0%, transparent 25%), radial-gradient(circle at 50% 50%, #6e9aff 0%, #1a3a8a 40%, #0a1a4a 70%, #050818 100%)",
    desktop:
      "radial-gradient(ellipse at 50% 25%, rgba(170,200,255,0.55) 0%, transparent 50%), linear-gradient(180deg, #1a3a8a 0%, #0a1a4a 60%, #02061a 100%)",
    stars: true,
  },
  {
    id: "snow-leopard",
    label: "Snow Leopard",
    subtitle: "10.6",
    sphere:
      "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.4) 0%, transparent 25%), radial-gradient(circle at 50% 50%, #ff9bc8 0%, #d04080 40%, #6e1438 75%, #1a040d 100%)",
    desktop:
      "radial-gradient(ellipse at 50% 35%, rgba(255,150,200,0.55) 0%, transparent 55%), linear-gradient(180deg, #c5408a 0%, #4a0d2e 60%, #1a040d 100%)",
    stars: true,
  },
  {
    id: "lion",
    label: "Lion",
    subtitle: "10.7",
    sphere:
      "radial-gradient(circle at 32% 28%, rgba(120,160,200,0.3) 0%, transparent 25%), radial-gradient(circle at 60% 50%, #4060a0 0%, #1a2050 50%, #050818 100%)",
    desktop:
      "radial-gradient(ellipse at 30% 30%, rgba(80,100,160,0.5) 0%, transparent 35%), radial-gradient(ellipse at 75% 65%, rgba(60,40,120,0.4) 0%, transparent 35%), linear-gradient(180deg, #050818 0%, #02040c 100%)",
    stars: true,
  },
  {
    id: "mountain-lion",
    label: "Mountain Lion",
    subtitle: "10.8",
    sphere:
      "radial-gradient(circle at 32% 28%, rgba(150,180,220,0.3) 0%, transparent 25%), radial-gradient(circle at 50% 55%, #5070d0 0%, #1a3070 50%, #050a30 100%)",
    desktop:
      "radial-gradient(ellipse at 50% 40%, rgba(80,120,200,0.4) 0%, transparent 50%), linear-gradient(180deg, #1a3070 0%, #050a30 60%, #000510 100%)",
    stars: true,
  },
  {
    id: "mavericks",
    label: "Mavericks",
    subtitle: "10.9",
    sphere:
      "radial-gradient(circle at 32% 28%, rgba(170,210,240,0.3) 0%, transparent 25%), linear-gradient(180deg, #2080b0 0%, #0d4f7a 50%, #02101a 100%)",
    desktop:
      "linear-gradient(180deg, #2080b0 0%, #0d4f7a 50%, #02101a 100%)",
  },
  {
    id: "yosemite",
    label: "Yosemite",
    subtitle: "10.10",
    sphere:
      "radial-gradient(circle at 32% 22%, rgba(255,255,255,0.5) 0%, transparent 28%), linear-gradient(180deg, #5499ff 0%, #2050a0 60%, #0a1a4a 100%)",
    desktop:
      "linear-gradient(180deg, #5499ff 0%, #2050a0 70%, #0a1a4a 100%)",
  },
  {
    id: "el-capitan",
    label: "El Capitan",
    subtitle: "10.11",
    sphere:
      "radial-gradient(circle at 32% 22%, rgba(255,200,160,0.5) 0%, transparent 28%), linear-gradient(180deg, #d5604c 0%, #7a2818 50%, #2a0e08 100%)",
    desktop:
      "linear-gradient(180deg, #d5604c 0%, #7a2818 50%, #1a0808 100%)",
  },
  {
    id: "sierra",
    label: "Sierra",
    subtitle: "10.12",
    sphere:
      "radial-gradient(circle at 32% 22%, rgba(255,180,160,0.5) 0%, transparent 28%), linear-gradient(180deg, #e07050 0%, #c04030 40%, #401814 100%)",
    desktop:
      "linear-gradient(180deg, #e07050 0%, #c04030 40%, #401814 100%)",
  },
  {
    id: "mojave",
    label: "Mojave",
    subtitle: "10.14",
    sphere:
      "radial-gradient(circle at 32% 22%, rgba(255,200,140,0.5) 0%, transparent 28%), linear-gradient(180deg, #d77a3a 0%, #6a3a18 60%, #1a0e05 100%)",
    desktop:
      "linear-gradient(180deg, #d77a3a 0%, #6a3a18 60%, #1a0e05 100%)",
  },
  {
    id: "sonoma",
    label: "Sonoma",
    subtitle: "14.0",
    sphere:
      "radial-gradient(circle at 32% 22%, rgba(180,220,255,0.5) 0%, transparent 28%), linear-gradient(180deg, #8db8a0 0%, #4a8aa0 50%, #1a3050 100%)",
    desktop:
      "linear-gradient(180deg, #8db8a0 0%, #4a8aa0 50%, #1a3050 100%)",
  },
  {
    id: "sequoia",
    label: "Sequoia",
    subtitle: "15.0",
    sphere:
      "radial-gradient(circle at 32% 22%, rgba(220,200,160,0.4) 0%, transparent 28%), linear-gradient(180deg, #4a6850 0%, #2a4030 50%, #0a1a10 100%)",
    desktop:
      "linear-gradient(180deg, #4a6850 0%, #2a4030 50%, #0a1a10 100%)",
  },
  {
    id: "tahoe",
    label: "Tahoe",
    subtitle: "26.0",
    sphere:
      "radial-gradient(circle at 32% 22%, rgba(180,220,240,0.5) 0%, transparent 28%), radial-gradient(circle at 50% 50%, #4a90c0 0%, #1a4a70 60%, #050f1a 100%)",
    desktop:
      "radial-gradient(ellipse at 30% 20%, rgba(180,220,240,0.45) 0%, transparent 40%), radial-gradient(ellipse at 70% 70%, rgba(80,140,180,0.35) 0%, transparent 40%), linear-gradient(180deg, #2a6a8a 0%, #1a4a70 50%, #050f1a 100%)",
    stars: true,
  },
];

export const DEFAULT_WALLPAPER: WallpaperId = "tahoe";

const STORAGE_KEY = "macos-desktop-wallpaper";

type WallpaperContextValue = {
  id: WallpaperId;
  current: Wallpaper;
  setId: (id: WallpaperId) => void;
};

const WallpaperContext = createContext<WallpaperContextValue>({
  id: DEFAULT_WALLPAPER,
  current: WALLPAPERS.find((w) => w.id === DEFAULT_WALLPAPER) ?? WALLPAPERS[0],
  setId: () => {},
});

export function WallpaperProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<WallpaperId>(DEFAULT_WALLPAPER);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as WallpaperId | null;
      if (saved && WALLPAPERS.some((w) => w.id === saved)) {
        setId(saved);
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, [id, hydrated]);

  const current =
    WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[WALLPAPERS.length - 1];

  return (
    <WallpaperContext.Provider value={{ id, current, setId }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  return useContext(WallpaperContext);
}
