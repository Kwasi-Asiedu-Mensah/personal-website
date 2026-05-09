"use client";

import { useScreenState } from "@/lib/screen-state";
import { Z } from "@/lib/z-index";
import LockScreen from "./LockScreen";

export default function ScreenOverlay() {
  const { state, setState } = useScreenState();

  if (state === "active") return null;

  if (state === "sleep") {
    return (
      <div
        className="fixed inset-0 bg-black cursor-pointer"
        style={{ zIndex: Z.screenOverlay }}
        onClick={() => setState("lock")}
        role="button"
        aria-label="Wake from sleep"
      />
    );
  }

  if (state === "shutdown") {
    return (
      <div
        className="fixed inset-0 bg-black cursor-pointer"
        style={{ zIndex: Z.screenOverlay }}
        onClick={() => setState("restart")}
        role="button"
        aria-label="Power on"
      />
    );
  }

  if (state === "restart") {
    return (
      <div
        className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-10"
        style={{ zIndex: Z.screenOverlay }}
      >
        <BigAppleLogo />
        <ProgressBar />
      </div>
    );
  }

  // lock
  return <LockScreen onUnlock={() => setState("active")} />;
}

function BigAppleLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-[72px] h-[72px]"
      fill="white"
      fillOpacity="0.92"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function ProgressBar() {
  return (
    <div className="w-[180px] h-[4px] rounded-full bg-white/15 overflow-hidden">
      <div
        className="h-full bg-white/70 rounded-full"
        style={{
          width: "100%",
          animation: "boot-progress 3s linear forwards",
        }}
      />
    </div>
  );
}
