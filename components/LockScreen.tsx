"use client";

import { useEffect, useState } from "react";
import { useWallpaper, useWallpaperImage } from "@/lib/wallpaper";
import { Z } from "@/lib/z-index";

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { current: wallpaper } = useWallpaper();
  const imageUrl = useWallpaperImage(wallpaper.id);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const desktopBg = imageUrl
    ? `url(${imageUrl}) center/cover no-repeat`
    : wallpaper.desktop;

  const dayStr = now ? formatDay(now) : "";
  const timeStr = now ? formatTime(now) : "";

  return (
    <div
      className="fixed inset-0 cursor-pointer select-none flex flex-col"
      style={{ background: desktopBg, zIndex: Z.screenOverlay }}
      onClick={onUnlock}
      role="button"
      aria-label="Unlock"
    >
      {/* Date + time at top third */}
      <div className="flex-1 flex flex-col items-center justify-end pb-12">
        <div
          className="text-white text-[20px] font-medium"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}
        >
          {dayStr}
        </div>
        <div
          className="text-white font-bold tabular-nums tracking-tight"
          style={{
            fontSize: "150px",
            lineHeight: 1,
            textShadow: "0 4px 24px rgba(0,0,0,0.4)",
            fontFeatureSettings: '"tnum"',
          }}
        >
          {timeStr}
        </div>
      </div>

      {/* Avatar + name + prompt at bottom third */}
      <div className="flex-1 flex flex-col items-center justify-end pb-20 gap-2">
        <Avatar />
        <div
          className="text-white text-[16px] font-medium"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
        >
          Kwasi Asiedu-Mensah
        </div>
        <div
          className="text-white/85 text-[12px]"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
        >
          Touch ID or Enter Password
        </div>
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[22px] font-semibold"
      style={{
        background: "linear-gradient(160deg, #6366f1, #8b5cf6)",
        boxShadow:
          "0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
        border: "1.5px solid rgba(255,255,255,0.3)",
      }}
    >
      K
    </div>
  );
}

function formatDay(d: Date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function formatTime(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes();
  if (h === 0) h = 12;
  else if (h > 12) h = h - 12;
  return `${h}:${m < 10 ? "0" + m : m}`;
}
