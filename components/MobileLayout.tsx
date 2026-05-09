"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallpaper, useWallpaperImage } from "@/lib/wallpaper";
import Notes from "./apps/Notes";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function MobileLayout() {
  const { current: wallpaper } = useWallpaper();
  const imageUrl = useWallpaperImage(wallpaper.id);
  const [notesOpen, setNotesOpen] = useState(false);
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

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: bg }}
    >
      {/* Readability overlay */}
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

      {/* Lock screen content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-14 pb-0">
          <span className="text-white/90 text-[14px] font-medium">
            {clockFace} {ampm}
          </span>
          <div className="flex items-center gap-2">
            {/* wifi */}
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
            {/* battery */}
            <svg width="24" height="13" viewBox="0 0 24 13" fill="none">
              <rect x="0.5" y="1" width="19" height="11" rx="2.5" stroke="white" strokeOpacity="0.5" />
              <rect x="2" y="2.5" width="14" height="8" rx="1.5" fill="white" fillOpacity="0.9" />
              <path d="M21 4.5v4a2 2 0 000-4z" fill="white" fillOpacity="0.45" />
            </svg>
          </div>
        </div>

        {/* Clock + date */}
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

        {/* Tap to explore */}
        <div className="mt-auto flex flex-col items-center pb-16 gap-4">
          <button
            onClick={() => setNotesOpen(true)}
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
            best experienced on desktop
          </p>
        </div>
      </div>

      {/* Full-screen Notes sheet */}
      <AnimatePresence>
        {notesOpen && (
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
            {/* Header */}
            <div
              className="shrink-0 flex items-center px-5 pt-14 pb-3"
              style={{
                background: "var(--titlebar-bg)",
                borderBottom: "1px solid var(--window-divider)",
              }}
            >
              <button
                onClick={() => setNotesOpen(false)}
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
                notes
              </span>
            </div>

            {/* Notes content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <Notes isMobile />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
