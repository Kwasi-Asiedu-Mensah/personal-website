"use client";

/**
 * Mobile experience — lock screen → springboard → full-screen apps.
 *
 * The desktop needs a pointer and room; phones get the iPhone treatment
 * instead: the existing lock screen, then a home screen grid of the same
 * apps, each opening as a full-screen sheet with a back header.
 */

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallpaper, useWallpaperImage } from "@/lib/wallpaper";
import {
  NotesIcon,
  MusicIcon,
  MessagesIcon,
  PhotosIcon,
  WeatherIcon,
  TerminalIcon,
} from "./icons/DockIcons";
import Notes from "./apps/Notes";
import Music from "./apps/Music";
import Messages from "./apps/Messages";
import Photos from "./apps/Photos";
import Weather from "./apps/Weather";
import Terminal from "./apps/Terminal";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

type MobileAppId =
  | "notes"
  | "music"
  | "messages"
  | "photos"
  | "weather"
  | "terminal";

const MOBILE_APPS: {
  id: MobileAppId;
  label: string;
  Icon: () => ReactNode;
}[] = [
  { id: "notes", label: "notes", Icon: NotesIcon },
  { id: "music", label: "music", Icon: MusicIcon },
  { id: "messages", label: "messages", Icon: MessagesIcon },
  { id: "photos", label: "photos", Icon: PhotosIcon },
  { id: "weather", label: "weather", Icon: WeatherIcon },
  { id: "terminal", label: "terminal", Icon: TerminalIcon },
];

const DOCK_APPS: MobileAppId[] = ["notes", "music", "messages", "photos"];

function StatusBar({ time }: { time: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-14 pb-0">
      <span className="text-white/90 text-[14px] font-medium">{time}</span>
      <div className="flex items-center gap-2">
        <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
          <circle cx="8.5" cy="11" r="1.6" fill="white" fillOpacity="0.9" />
          <path
            d="M5 8C6.1 6.9 7.2 6.3 8.5 6.3s2.4.6 3.5 1.7"
            stroke="white"
            strokeOpacity="0.9"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M2 5C4 3.1 6.1 2 8.5 2s4.5 1.1 6.5 3"
            stroke="white"
            strokeOpacity="0.9"
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <svg width="24" height="13" viewBox="0 0 24 13" fill="none">
          <rect x="0.5" y="1" width="19" height="11" rx="2.5" stroke="white" strokeOpacity="0.5" />
          <rect x="2" y="2.5" width="14" height="8" rx="1.5" fill="white" fillOpacity="0.9" />
          <path d="M21 4.5v4a2 2 0 000-4z" fill="white" fillOpacity="0.45" />
        </svg>
      </div>
    </div>
  );
}

export default function MobileLayout() {
  const { current: wallpaper } = useWallpaper();
  const imageUrl = useWallpaperImage(wallpaper.id);
  const [view, setView] = useState<"lock" | "home">("lock");
  const [openApp, setOpenApp] = useState<MobileAppId | null>(null);
  const now = useClock();

  const bg = imageUrl
    ? `url(${imageUrl}) center/cover no-repeat`
    : wallpaper.desktop;

  const showStars = !imageUrl && wallpaper.stars;

  const hourMin = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const ampm = hourMin.slice(-2).toLowerCase();
  const clockFace = hourMin.slice(0, -3).trim();
  const dateStr = now
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toLowerCase();

  const statusTime = `${clockFace} ${ampm}`;
  const currentApp = MOBILE_APPS.find((a) => a.id === openApp) ?? null;

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: bg }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "rgba(0,0,0,0.25)" }}
      />

      {showStars && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.6), transparent 50%), radial-gradient(1px 1px at 38% 62%, rgba(255,255,255,0.5), transparent 50%), radial-gradient(1.5px 1.5px at 72% 28%, rgba(255,255,255,0.55), transparent 50%), radial-gradient(1px 1px at 88% 78%, rgba(255,255,255,0.45), transparent 50%), radial-gradient(1px 1px at 22% 82%, rgba(255,255,255,0.4), transparent 50%), radial-gradient(1px 1px at 56% 12%, rgba(255,255,255,0.5), transparent 50%), radial-gradient(2px 2px at 64% 92%, rgba(255,255,255,0.5), transparent 50%)",
          }}
        />
      )}

      {/* ------------------------------ lock ------------------------------ */}
      {view === "lock" && (
        <div className="relative z-10 flex flex-col h-full">
          <StatusBar time={statusTime} />
          <div className="flex flex-col items-center mt-16">
            <div
              className="text-white leading-none drop-shadow-lg"
              style={{
                fontSize: "clamp(80px, 22vw, 108px)",
                fontWeight: 200,
                letterSpacing: "-0.02em",
              }}
            >
              {clockFace}
            </div>
            <div className="mt-2 text-white/80 text-[16px] tracking-wide drop-shadow">
              {dateStr}
            </div>
          </div>
          <div className="mt-auto flex flex-col items-center pb-16 gap-4">
            <button
              onClick={() => setView("home")}
              className="px-8 py-3 rounded-full text-white/90 text-[15px] font-medium tracking-wide active:scale-95 transition-transform"
              style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              explore →
            </button>
            <p className="text-white/40 text-[12px]">
              the full desktop lives on bigger screens
            </p>
          </div>
        </div>
      )}

      {/* --------------------------- springboard --------------------------- */}
      {view === "home" && (
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative z-10 flex flex-col h-full"
        >
          <StatusBar time={statusTime} />

          <div className="grid grid-cols-4 gap-x-4 gap-y-6 px-6 pt-10">
            {MOBILE_APPS.map((app) => (
              <button
                key={app.id}
                onClick={() => setOpenApp(app.id)}
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
              >
                <span className="block w-[60px] h-[60px] rounded-[14px] overflow-hidden shadow-lg">
                  <app.Icon />
                </span>
                <span
                  className="text-white text-[11px]"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}
                >
                  {app.label}
                </span>
              </button>
            ))}
          </div>

          {/* dock */}
          <div className="mt-auto pb-8 px-4">
            <div
              className="mx-auto max-w-[360px] flex items-center justify-around px-4 py-3 rounded-[28px]"
              style={{
                background: "rgba(255,255,255,0.16)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {DOCK_APPS.map((id) => {
                const app = MOBILE_APPS.find((a) => a.id === id)!;
                return (
                  <button
                    key={id}
                    onClick={() => setOpenApp(id)}
                    className="w-[56px] h-[56px] rounded-[13px] overflow-hidden active:scale-90 transition-transform shadow-md"
                  >
                    <app.Icon />
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* ------------------------- full-screen app ------------------------- */}
      <AnimatePresence>
        {currentApp && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280, mass: 0.9 }}
            className="absolute inset-0 flex flex-col z-50"
            data-shell="desktop"
            style={{
              background: "var(--window-bg)",
              color: "var(--window-text)",
            }}
          >
            <div
              className="relative shrink-0 flex items-center px-5 pt-14 pb-3"
              style={{
                background: "var(--titlebar-bg)",
                borderBottom: "1px solid var(--window-divider)",
              }}
            >
              <button
                onClick={() => setOpenApp(null)}
                className="flex items-center gap-1.5 text-[#007AFF] active:opacity-60"
              >
                <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
                  <path
                    d="M7.5 1.5L1.5 7.5l6 6"
                    stroke="#007AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[16px]">back</span>
              </button>
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold"
                style={{ color: "var(--window-text)" }}
              >
                {currentApp.label}
              </span>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
              {openApp === "notes" && <Notes isMobile />}
              {openApp === "music" && <Music />}
              {openApp === "messages" && <Messages />}
              {openApp === "photos" && <Photos />}
              {openApp === "weather" && <Weather />}
              {openApp === "terminal" && <Terminal />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
