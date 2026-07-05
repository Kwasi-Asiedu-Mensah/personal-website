"use client";

/**
 * Photos — a gallery over images the site already ships plus any the owner
 * drops into /public/photos/ (photo-1.jpg … photo-24.jpg are probed at
 * runtime; missing files are skipped silently).
 *
 * Favorites persist to localStorage. Clicking a photo opens a lightbox
 * inside the window with prev/next.
 */

import { useEffect, useMemo, useState } from "react";
import { useSessionState } from "@/lib/sidebar-persistence";

type Photo = { id: string; url: string; label: string; album: string };

/** Wallpapers double as the seed library so the app is never empty. */
const WALLPAPER_PHOTOS: Photo[] = [
  "snow-leopard",
  "lion",
  "mountain-lion",
  "mavericks",
  "yosemite",
  "el-capitan",
  "sierra",
  "mojave",
  "sonoma",
].map((id) => ({
  id: `wp-${id}`,
  url: `/wallpapers/${id}.jpg`,
  label: id.replace(/-/g, " "),
  album: "wallpapers",
}));

const DROPPED_CANDIDATES = Array.from({ length: 24 }, (_, i) => ({
  id: `ph-${i + 1}`,
  url: `/photos/photo-${i + 1}.jpg`,
  label: `photo ${i + 1}`,
  album: "library",
}));

const FAV_KEY = "photos-favorites";

function useAvailablePhotos(): Photo[] {
  const [dropped, setDropped] = useState<Photo[]>([]);
  useEffect(() => {
    let cancelled = false;
    const found: Photo[] = [];
    let pending = DROPPED_CANDIDATES.length;
    DROPPED_CANDIDATES.forEach((p) => {
      const img = new window.Image();
      const done = () => {
        pending -= 1;
        if (pending === 0 && !cancelled) {
          found.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
          setDropped([...found]);
        }
      };
      img.onload = () => {
        found.push(p);
        done();
      };
      img.onerror = done;
      img.src = p.url;
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return useMemo(() => [...dropped, ...WALLPAPER_PHOTOS], [dropped]);
}

type View = "library" | "favorites" | "wallpapers";

export default function Photos() {
  const photos = useAvailablePhotos();
  const [view, setView] = useSessionState<View>("photos", "view", "library");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites, hydrated]);

  const visible = photos.filter((p) => {
    if (view === "favorites") return favorites.includes(p.id);
    if (view === "wallpapers") return p.album === "wallpapers";
    return true;
  });

  function toggleFav(id: string) {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  const open = openIdx !== null ? visible[openIdx] : null;

  const sidebarItems: { id: View; label: string; icon: string }[] = [
    { id: "library", label: "library", icon: "▦" },
    { id: "favorites", label: "favorites", icon: "♡" },
    { id: "wallpapers", label: "wallpapers", icon: "🖥" },
  ];

  return (
    <div
      className="flex h-full relative"
      style={{ background: "var(--window-bg)" }}
    >
      {/* sidebar */}
      <div
        className="w-[200px] shrink-0 py-2 px-1.5"
        style={{
          background: "var(--searchbar-bg)",
          borderRight: "1px solid var(--window-divider)",
        }}
      >
        <div
          className="px-2 pb-1.5 text-[11px] uppercase tracking-wide"
          style={{ color: "var(--section-label)" }}
        >
          photos
        </div>
        <div className="space-y-0.5">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setOpenIdx(null);
              }}
              className="w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 text-[13px]"
              style={{
                background:
                  view === item.id ? "rgba(120,120,128,0.20)" : undefined,
                color: "var(--window-text)",
              }}
            >
              <span
                className="w-4 text-center"
                style={{ color: "var(--window-text-muted)" }}
              >
                {item.icon}
              </span>
              {item.label}
              {item.id === "favorites" && favorites.length > 0 && (
                <span
                  className="ml-auto text-[11px]"
                  style={{ color: "var(--window-text-muted)" }}
                >
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div
          className="px-2 pt-3 text-[11px] leading-snug"
          style={{ color: "var(--window-text-faint)" }}
        >
          drop jpgs at /public/photos/photo-1.jpg … photo-24.jpg and they show
          up here.
        </div>
      </div>

      {/* grid */}
      <div className="flex-1 min-w-0 overflow-y-auto p-3">
        {visible.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-1">
            <div className="text-[13px]" style={{ color: "var(--window-text)" }}>
              {view === "favorites" ? "no favorites yet" : "no photos yet"}
            </div>
            <div
              className="text-[12px] opacity-70"
              style={{ color: "var(--window-text-muted)" }}
            >
              {view === "favorites"
                ? "hover a photo and tap the heart"
                : "drop images into /public/photos/"}
            </div>
          </div>
        ) : (
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            }}
          >
            {visible.map((p, i) => (
              <div key={p.id} className="relative group">
                <button
                  onClick={() => setOpenIdx(i)}
                  className="block w-full aspect-square overflow-hidden rounded-md"
                  style={{ background: "var(--row-active)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.url}
                    alt={p.label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.04]"
                  />
                </button>
                <button
                  onClick={() => toggleFav(p.id)}
                  aria-label="favorite"
                  className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full text-[12px] flex items-center justify-center transition-opacity ${
                    favorites.includes(p.id)
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    background: "rgba(0,0,0,0.45)",
                    color: favorites.includes(p.id) ? "#ff375f" : "#ffffff",
                  }}
                >
                  {favorites.includes(p.id) ? "♥" : "♡"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* lightbox */}
      {open && (
        <div
          className="absolute inset-0 flex flex-col"
          style={{ background: "rgba(0,0,0,0.88)" }}
        >
          <div className="flex items-center justify-between px-3 py-2">
            <button
              onClick={() => setOpenIdx(null)}
              className="text-[13px] px-2 py-1 rounded-md"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              ← back
            </button>
            <div
              className="text-[12px]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {open.label}
            </div>
            <button
              onClick={() => toggleFav(open.id)}
              className="text-[15px] px-2 py-1"
              style={{
                color: favorites.includes(open.id)
                  ? "#ff375f"
                  : "rgba(255,255,255,0.85)",
              }}
              aria-label="favorite"
            >
              {favorites.includes(open.id) ? "♥" : "♡"}
            </button>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center px-10 pb-6 relative">
            {openIdx !== null && openIdx > 0 && (
              <button
                onClick={() => setOpenIdx(openIdx - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-white"
                style={{ background: "rgba(255,255,255,0.12)" }}
                aria-label="previous"
              >
                ‹
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={open.url}
              alt={open.label}
              className="max-w-full max-h-full object-contain rounded-md"
            />
            {openIdx !== null && openIdx < visible.length - 1 && (
              <button
                onClick={() => setOpenIdx(openIdx + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-white"
                style={{ background: "rgba(255,255,255,0.12)" }}
                aria-label="next"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
