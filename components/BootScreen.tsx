"use client";

/**
 * Boot sequence — shown once per browser session, before the desktop.
 * Black screen → apple glyph → progress bar → fade into the desktop.
 */

import { useEffect, useState } from "react";
import { Z } from "@/lib/z-index";

const BOOT_MS = 2400;
const FADE_MS = 600;

export default function BootScreen() {
  const [phase, setPhase] = useState<"boot" | "fade" | "done">(() => {
    if (typeof window === "undefined") return "boot";
    try {
      return sessionStorage.getItem("booted") === "1" ? "done" : "boot";
    } catch {
      return "boot";
    }
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "boot") return;
    const start = Date.now();
    const tick = setInterval(() => {
      const t = (Date.now() - start) / BOOT_MS;
      // ease: quick start, brief hesitation near the end, like the real thing
      const eased = t < 0.7 ? t * 1.15 : 0.8 + (t - 0.7) * 0.67;
      setProgress(Math.min(eased, 1));
      if (t >= 1) {
        clearInterval(tick);
        try {
          sessionStorage.setItem("booted", "1");
        } catch {
          // ignore
        }
        setPhase("fade");
        setTimeout(() => setPhase("done"), FADE_MS);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center select-none"
      style={{
        background: "#000",
        zIndex: Z.screenOverlay + 1,
        opacity: phase === "fade" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      <div
        className="text-white"
        style={{ fontSize: 84, lineHeight: 1, marginBottom: 56 }}
        aria-hidden
      >

      </div>
      <div
        className="rounded-full overflow-hidden"
        style={{
          width: 220,
          height: 5,
          background: "rgba(255,255,255,0.2)",
        }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress * 100}%`,
            background: "#fff",
            transition: "width 60ms linear",
          }}
        />
      </div>
    </div>
  );
}
