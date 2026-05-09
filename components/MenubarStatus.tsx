"use client";

import {
  forwardRef,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSystemState, type AirDropMode } from "@/lib/system-state";
import { useSettingsRouter } from "@/lib/settings-router";
import type { WindowId } from "@/lib/use-windows";
import { Z } from "@/lib/z-index";
import { useClickOutside } from "@/lib/use-click-outside";
import { usePlayer } from "@/lib/player";
import { trackArtUrl } from "@/lib/music-data";
import { useAppNavigation } from "@/lib/app-navigation";

/* ============================ Top-level row ============================ */

type OpenId = "battery" | "wifi" | "control" | null;

export default function MenubarStatus({
  onOpenWindow,
}: {
  onOpenWindow: (id: WindowId) => void;
}) {
  const [open, setOpen] = useState<OpenId>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const batteryRef = useRef<HTMLButtonElement>(null);
  const wifiRef = useRef<HTMLButtonElement>(null);
  const ctrlRef = useRef<HTMLButtonElement>(null);

  // Close on click outside the container or popover, or on Escape.
  useClickOutside(containerRef, () => setOpen(null), {
    enabled: open !== null,
    ignoreSelector: "[data-status-popover]",
  });

  const positionFor = (
    ref: React.RefObject<HTMLButtonElement>
  ): { right: number; top: number } => {
    if (typeof window === "undefined" || !ref.current)
      return { right: 8, top: 32 };
    const rect = ref.current.getBoundingClientRect();
    return {
      right: Math.max(8, window.innerWidth - rect.right - 4),
      top: rect.bottom + 6,
    };
  };

  return (
    <div ref={containerRef} className="flex items-center gap-1.5">
      <StatusButton
        ref={batteryRef}
        active={open === "battery"}
        onClick={() => setOpen(open === "battery" ? null : "battery")}
        ariaLabel="Battery"
      >
        <BatteryIcon />
      </StatusButton>

      <StatusButton
        ref={wifiRef}
        active={open === "wifi"}
        onClick={() => setOpen(open === "wifi" ? null : "wifi")}
        ariaLabel="Wi-Fi"
      >
        <WifiIcon />
      </StatusButton>

      <StatusButton
        ref={ctrlRef}
        active={open === "control"}
        onClick={() => setOpen(open === "control" ? null : "control")}
        ariaLabel="Control Center"
      >
        <ControlCenterIcon />
      </StatusButton>

      {open === "battery" && (
        <BatteryPopover
          position={positionFor(batteryRef)}
          onClose={() => setOpen(null)}
        />
      )}
      {open === "wifi" && (
        <WifiPopover
          position={positionFor(wifiRef)}
          onClose={() => setOpen(null)}
          onOpenSettings={() => {
            onOpenWindow("settings");
            setOpen(null);
          }}
        />
      )}
      {open === "control" && (
        <ControlCenterPopover
          position={positionFor(ctrlRef)}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

type StatusButtonProps = {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
};

const StatusButton = forwardRef<HTMLButtonElement, StatusButtonProps>(
  function StatusButton({ active, onClick, ariaLabel, children }, ref) {
    return (
      <button
        ref={ref}
        onClick={onClick}
        aria-label={ariaLabel}
        title={ariaLabel}
        className="flex items-center justify-center px-1.5 py-0.5 rounded-sm transition-colors"
        style={{
          background: active ? "rgba(255,255,255,0.18)" : "transparent",
          color: "rgba(255,255,255,0.95)",
        }}
      >
        {children}
      </button>
    );
  }
);

/* =============================== Icons =============================== */

function BatteryIcon() {
  const { battery } = useSystemState();
  // Visual fill width within inner area (12px wide).
  const fillWidth = Math.max(2, Math.round((battery / 100) * 12));
  return (
    <svg
      viewBox="0 0 22 11"
      width="22"
      height="11"
      fill="none"
      aria-hidden
    >
      <rect
        x="0.5"
        y="1"
        width="17"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.65"
      />
      <rect
        x="2"
        y="2.5"
        width={fillWidth}
        height="6"
        rx="0.8"
        fill="currentColor"
      />
      <rect
        x="18.5"
        y="3.5"
        width="1.6"
        height="4"
        rx="0.4"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}

function WifiIcon() {
  const { wifiOn } = useSystemState();
  return (
    <svg viewBox="0 0 100 100" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M 17 61 Q 50 24 83 61"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        opacity={wifiOn ? 1 : 0.35}
      />
      <path
        d="M 29 68 Q 50 42 71 68"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        opacity={wifiOn ? 1 : 0.35}
      />
      <path
        d="M 40 74 Q 50 60 60 74"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        opacity={wifiOn ? 1 : 0.35}
      />
      <circle
        cx="50"
        cy="80"
        r="6"
        fill="currentColor"
        opacity={wifiOn ? 1 : 0.5}
      />
    </svg>
  );
}

function ControlCenterIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" aria-hidden>
      <line
        x1="2.5"
        y1="6"
        x2="15.5"
        y2="6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="6" r="2.4" fill="currentColor" />
      <line
        x1="2.5"
        y1="12"
        x2="15.5"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="6" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

function BluetoothIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
      {/* Vertical spine + two right-facing hooks forming the ᛒ symbol */}
      <path
        d="M 50 90 L 50 10 L 75 30 L 50 50 L 75 70 L 50 90"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AirDropIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none">
      {/* Three nested U-shaped arcs (radar waves), opening downward */}
      <path
        d="M 18 78 Q 18 22 50 22 Q 82 22 82 78"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 32 78 Q 32 35 50 35 Q 68 35 68 78"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 44 78 Q 44 50 50 50 Q 56 50 56 78"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Solid triangle pointing up, sitting inside the smallest arc */}
      <polygon points="50 60, 40 78, 60 78" fill="currentColor" />
    </svg>
  );
}

function SunIcon({
  filled = false,
  size = 14,
}: {
  filled?: boolean;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <circle cx="12" cy="12" r={filled ? 5 : 4} fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1="12"
          y1={filled ? "1.5" : "2.5"}
          x2="12"
          y2={filled ? "5" : "5.5"}
          stroke="currentColor"
          strokeWidth={filled ? 2 : 1.6}
          strokeLinecap="round"
          transform={`rotate(${a} 12 12)`}
        />
      ))}
    </svg>
  );
}

function SpeakerIcon({
  bars = 0,
  size = 14,
}: {
  bars?: 0 | 1 | 2 | 3;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path
        d="M 4 9 H 8 L 13 4 V 20 L 8 15 H 4 Z"
        fill="currentColor"
      />
      {bars >= 1 && (
        <path
          d="M 16 10 Q 17.5 12 16 14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {bars >= 2 && (
        <path
          d="M 18.5 8 Q 21 12 18.5 16"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {bars >= 3 && (
        <path
          d="M 21 6 Q 24.5 12 21 18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

function MoonIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor">
      <path d="M 11.6 9.5 A 4.6 4.6 0 1 1 6.5 4.4 A 3.6 3.6 0 0 0 11.6 9.5 Z" />
    </svg>
  );
}

function PhoneIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none">
      <rect
        x="4.5"
        y="1.5"
        width="7"
        height="13"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <line
        x1="7"
        y1="12.5"
        x2="9"
        y2="12.5"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function ChevronRight({ size = 12 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 8 12"
      width={size * 0.66}
      height={size}
      fill="none"
      aria-hidden
    >
      <path
        d="M 1.5 1 L 6.5 6 L 1.5 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 12 14" width={size} height={size * 1.16} fill="none">
      <path
        d="M 3 6 V 4 a 3 3 0 0 1 6 0 V 6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect
        x="1.5"
        y="6"
        width="9"
        height="7"
        rx="1.3"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

function WifiBars({ bars = 3 }: { bars?: 1 | 2 | 3 }) {
  return (
    <svg viewBox="0 0 14 11" width="14" height="11" fill="none">
      <path
        d="M 1 7.5 Q 7 4 13 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity={bars >= 3 ? 1 : 0.3}
      />
      <path
        d="M 3 9.2 Q 7 6.8 11 9.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity={bars >= 2 ? 1 : 0.3}
      />
      <circle cx="7" cy="10.4" r="0.8" fill="currentColor" />
    </svg>
  );
}

/* ============================== Popover shell ============================== */

function PopoverShell({
  position,
  onClose,
  width = 320,
  children,
}: {
  position: { right: number; top: number };
  onClose: () => void;
  width?: number;
  children: ReactNode;
}) {
  return (
    <>
      {/* Backdrop only covers below the menubar so menubar buttons remain clickable */}
      <div
        className="fixed left-0 right-0 bottom-0"
        style={{ top: 28, zIndex: Z.popoverBackdrop }}
        onClick={onClose}
        aria-hidden
      />
      <div
        data-status-popover
        className="fixed rounded-[14px] select-none"
        style={{
          zIndex: Z.popover,
          right: position.right,
          top: position.top,
          width,
          background: "rgba(28, 28, 30, 0.85)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
          color: "rgba(255,255,255,0.92)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
}

/* ============================== Battery ============================== */

function BatteryPopover({
  position,
  onClose,
}: {
  position: { right: number; top: number };
  onClose: () => void;
}) {
  const { battery } = useSystemState();
  return (
    <PopoverShell position={position} onClose={onClose} width={300}>
      <div className="px-4 pt-3 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-semibold">Battery</span>
          <span className="text-[14px] tabular-nums">{battery}%</span>
        </div>
        <div className="text-[12px] mt-0.5 text-white/60">
          Power Source: Battery
        </div>
      </div>
      <PopoverDivider />
      <div className="px-4 pt-3 pb-3">
        <div className="text-[11px] uppercase tracking-wide text-white/45 mb-2">
          Energy Mode
        </div>
        <button className="w-full flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-white/[0.06]">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <BatteryIcon />
          </span>
          <span className="text-[13px] flex-1 text-left">Low Power</span>
          <span className="text-white/55">
            <ChevronRight />
          </span>
        </button>
      </div>
      <PopoverDivider />
      <div className="px-4 py-3">
        <div className="text-[12px] text-white/55">
          No Apps Using Significant Energy
        </div>
      </div>
    </PopoverShell>
  );
}

/* =============================== Wi-Fi =============================== */

function WifiPopover({
  position,
  onClose,
  onOpenSettings,
}: {
  position: { right: number; top: number };
  onClose: () => void;
  onOpenSettings: () => void;
}) {
  const { wifiOn, setWifiOn, networkName } = useSystemState();
  const { setPane } = useSettingsRouter();

  const openWifiSettings = () => {
    setPane("wifi");
    onOpenSettings();
  };

  return (
    <PopoverShell position={position} onClose={onClose} width={320}>
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-[15px] font-semibold">Wi-Fi</span>
        <Toggle on={wifiOn} onChange={setWifiOn} />
      </div>

      {wifiOn && (
        <>
          <PopoverDivider />
          <div className="px-4 pt-3 pb-1">
            <div className="text-[11px] uppercase tracking-wide text-white/45">
              Personal Hotspot
            </div>
          </div>
          <div className="px-2 pb-2">
            <PopoverRow
              icon={
                <CircleBg color="#34c759">
                  <PhoneIcon size={13} />
                </CircleBg>
              }
              label="Kwasi's iPhone"
              right={
                <span className="flex items-center gap-1.5 text-white/65 text-[11px]">
                  <WifiBars />
                  5G
                </span>
              }
            />
          </div>

          <PopoverDivider />

          <div className="px-4 pt-3 pb-1">
            <div className="text-[11px] uppercase tracking-wide text-white/45">
              Known Network
            </div>
          </div>
          <div className="px-2 pb-2">
            <PopoverRow
              icon={
                <CircleBg color="#0a72e0">
                  <WifiIconSmall />
                </CircleBg>
              }
              label={networkName}
              right={<LockIcon />}
            />
          </div>

          <PopoverDivider />
          <button
            onClick={openWifiSettings}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.06] text-[13px]"
          >
            <span>Other Networks</span>
            <ChevronRight />
          </button>
        </>
      )}

      <PopoverDivider />
      <button
        onClick={openWifiSettings}
        className="w-full text-left px-4 py-2.5 hover:bg-white/[0.06] text-[13px]"
      >
        Wi-Fi Settings…
      </button>
    </PopoverShell>
  );
}

function WifiIconSmall() {
  return (
    <svg viewBox="0 0 100 100" width="13" height="13" fill="none">
      <path
        d="M 17 61 Q 50 24 83 61"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 29 68 Q 50 42 71 68"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 40 74 Q 50 60 60 74"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="50" cy="80" r="6" fill="white" />
    </svg>
  );
}

/* =========================== Control Center =========================== */

function ControlCenterPopover({
  position,
  onClose,
}: {
  position: { right: number; top: number };
  onClose: () => void;
}) {
  const {
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
    networkName,
  } = useSystemState();

  const cycleAirdrop = () => {
    const order: AirDropMode[] = ["off", "contacts", "everyone"];
    const next = order[(order.indexOf(airdropMode) + 1) % order.length];
    setAirdropMode(next);
  };

  return (
    <PopoverShell position={position} onClose={onClose} width={356}>
      <div className="p-3 space-y-2">
        {/* Top: 2 cards */}
        <div className="grid grid-cols-2 gap-2">
          {/* Connectivity card */}
          <CCCard className="py-1">
            <CCToggleRow
              icon={
                <CircleBg color={wifiOn ? "#0a72e0" : "rgba(255,255,255,0.18)"}>
                  <WifiIconSmall />
                </CircleBg>
              }
              label="Wi-Fi"
              sublabel={wifiOn ? networkName : "Off"}
              onClick={() => setWifiOn(!wifiOn)}
            />
            <CCToggleRow
              icon={
                <CircleBg
                  color={
                    bluetoothOn ? "#0a72e0" : "rgba(255,255,255,0.18)"
                  }
                >
                  <BluetoothIcon size={13} />
                </CircleBg>
              }
              label="Bluetooth"
              sublabel={bluetoothOn ? "On" : "Off"}
              onClick={() => setBluetoothOn(!bluetoothOn)}
            />
            <CCToggleRow
              icon={
                <CircleBg
                  color={
                    airdropMode !== "off"
                      ? "#0a72e0"
                      : "rgba(255,255,255,0.18)"
                  }
                >
                  <AirDropIcon size={14} />
                </CircleBg>
              }
              label="AirDrop"
              sublabel={
                airdropMode === "off"
                  ? "Off"
                  : airdropMode === "contacts"
                    ? "Contacts Only"
                    : "Everyone"
              }
              onClick={cycleAirdrop}
            />
          </CCCard>

          {/* Right column: Now Playing + Focus */}
          <div className="grid grid-rows-[1fr_auto] gap-2">
            <NowPlayingCard onClose={onClose} />
            <CCCard>
              <CCToggleRow
                icon={
                  <CircleBg
                    color={focusOn ? "#a855f7" : "rgba(255,255,255,0.18)"}
                  >
                    <MoonIcon size={13} />
                  </CircleBg>
                }
                label="Focus"
                sublabel={focusOn ? "On" : "Off"}
                onClick={() => setFocusOn(!focusOn)}
              />
            </CCCard>
          </div>
        </div>

        {/* Display */}
        <CCCard>
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide">
            Display
          </div>
          <div className="px-3 pb-3">
            <Slider
              value={brightness}
              onChange={setBrightness}
              leadingIcon={<SunIcon size={13} />}
              trailingIcon={<SunIcon filled size={16} />}
            />
          </div>
        </CCCard>

        {/* Sound */}
        <CCCard>
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide">
            Sound
          </div>
          <div className="px-3 pb-3">
            <Slider
              value={volume}
              onChange={setVolume}
              leadingIcon={
                <SpeakerIcon size={14} bars={volume > 0 ? 1 : 0} />
              }
              trailingIcon={
                <SpeakerIcon
                  size={14}
                  bars={volume > 66 ? 3 : volume > 33 ? 2 : 1}
                />
              }
            />
          </div>
        </CCCard>
      </div>
    </PopoverShell>
  );
}

function NowPlayingCard({ onClose }: { onClose: () => void }) {
  const { currentTrack, isPlaying, toggle, next, prev } = usePlayer();
  const { navigate } = useAppNavigation();
  const [artErrored, setArtErrored] = useState(false);
  const artUrl = currentTrack ? trackArtUrl(currentTrack) : null;

  const goToTrack = () => {
    if (!currentTrack) return;
    navigate({ app: "music", data: { trackId: currentTrack.id } });
    onClose();
  };

  return (
    <div
      className="rounded-[10px] p-2.5 flex flex-col gap-1.5 min-h-[100px] justify-between overflow-hidden"
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      <button
        className="flex items-center gap-2 min-w-0 text-left w-full"
        onClick={goToTrack}
        disabled={!currentTrack}
        aria-label={currentTrack ? `Go to ${currentTrack.title} in Music` : undefined}
      >
        <div
          className="w-9 h-9 rounded-md shrink-0 overflow-hidden relative"
          style={{
            background:
              "linear-gradient(160deg, #fb4368, #b21e3f 60%, #4d0e1c)",
          }}
        >
          {artUrl && !artErrored && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artUrl}
              alt=""
              onError={() => setArtErrored(true)}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ borderRadius: "inherit" }}
              draggable={false}
            />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {currentTrack ? (
            <>
              <div className="text-[12px] font-semibold truncate">
                {currentTrack.title}
              </div>
              <div className="text-[11px] text-white/55 truncate">
                {currentTrack.artist}
              </div>
            </>
          ) : (
            <div className="text-[11px] text-white/55">not playing</div>
          )}
        </div>
      </button>
      <div className="flex items-center justify-around mt-0.5 text-white/85">
        <PlayCtrlButton onClick={prev} aria-label="Previous">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M 5 4 H 6 V 12 H 5 Z M 6.5 8 L 12 4 V 12 Z" />
          </svg>
        </PlayCtrlButton>
        <PlayCtrlButton onClick={toggle} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? (
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <rect x="4" y="3" width="3" height="10" rx="0.6" />
              <rect x="9" y="3" width="3" height="10" rx="0.6" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M 4 3 V 13 L 13 8 Z" />
            </svg>
          )}
        </PlayCtrlButton>
        <PlayCtrlButton onClick={next} aria-label="Next">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M 4 4 L 9.5 8 L 4 12 Z M 10 4 H 11 V 12 H 10 Z" />
          </svg>
        </PlayCtrlButton>
      </div>
    </div>
  );
}

function PlayCtrlButton({
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/[0.08]"
    >
      {children}
    </button>
  );
}

/* ============================ Shared bits ============================ */

function CCCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[10px] ${className}`}
      style={{ background: "rgba(255,255,255,0.06)" }}
    >
      {children}
    </div>
  );
}

function CCToggleRow({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white/[0.06]"
    >
      {icon}
      <div className="min-w-0 flex-1 text-left">
        <div className="text-[12px] font-semibold">{label}</div>
        <div className="text-[11px] text-white/55 truncate">{sublabel}</div>
      </div>
    </button>
  );
}

function CircleBg({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white"
      style={{ background: color }}
    >
      {children}
    </span>
  );
}

function PopoverDivider() {
  return <div className="h-px bg-white/10 mx-3" />;
}

function PopoverRow({
  icon,
  label,
  right,
}: {
  icon: ReactNode;
  label: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-1.5 rounded-md">
      {icon}
      <span className="flex-1 text-[13px] truncate">{label}</span>
      {right && (
        <span className="shrink-0 text-white/65 flex items-center gap-1.5">
          {right}
        </span>
      )}
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-[36px] h-[20px] rounded-full transition-colors shrink-0"
      style={{ background: on ? "#34c759" : "rgba(255,255,255,0.2)" }}
      aria-pressed={on}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[16px]" : ""
        }`}
      />
    </button>
  );
}

function Slider({
  value,
  onChange,
  leadingIcon,
  trailingIcon,
}: {
  value: number;
  onChange: (v: number) => void;
  leadingIcon: ReactNode;
  trailingIcon: ReactNode;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromEvent = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(
      0,
      Math.min(100, ((clientX - rect.left) / rect.width) * 100)
    );
    onChange(Math.round(pct));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    updateFromEvent(e.clientX);
    const onMove = (ev: PointerEvent) => updateFromEvent(ev.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      className="relative h-7 rounded-full overflow-hidden cursor-pointer"
      style={{ background: "rgba(255,255,255,0.12)" }}
    >
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${value}%`,
          background: "rgba(255,255,255,0.92)",
        }}
      />
      <div
        className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2.5 pointer-events-none"
        style={{ color: "rgba(0,0,0,0.45)", mixBlendMode: "difference" }}
      >
        <span style={{ color: "white" }}>{leadingIcon}</span>
        <span style={{ color: "white" }}>{trailingIcon}</span>
      </div>
    </div>
  );
}
