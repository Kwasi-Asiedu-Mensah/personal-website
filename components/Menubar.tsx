"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { appLabel, type WindowId } from "@/lib/app-config";
import { useSettingsRouter, type SettingsPane } from "@/lib/settings-router";
import { useScreenState, type ScreenState } from "@/lib/screen-state";
import { useNotesStore } from "@/lib/notes-store";
import { Z } from "@/lib/z-index";
import MenubarStatus from "./MenubarStatus";
import AboutThisMac from "./AboutThisMac";

type Props = {
  activeId: string | null;
  onOpenWindow: (id: WindowId) => void;
};

export default function Menubar({ activeId, onOpenWindow }: Props) {
  const [now, setNow] = useState<Date | null>(null);
  const [appleOpen, setAppleOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { setPane } = useSettingsRouter();
  const { setState: setScreenState } = useScreenState();

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(t);
  }, []);

  const formattedTime = now ? formatTime(now) : "";
  const activeLabel = activeId ? appLabel(activeId) : "Finder";

  const openSettings = (pane?: SettingsPane, anchor?: string) => {
    if (pane) setPane(pane, anchor);
    onOpenWindow("settings");
    setAppleOpen(false);
  };

  const goScreen = (s: ScreenState) => {
    setScreenState(s);
    setAppleOpen(false);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-7 backdrop-blur border-b border-white/[0.08] flex items-center justify-between px-4 text-[13px] text-white/90 select-none"
      style={{ zIndex: Z.menubar, background: "var(--menubar-bg)" }}
    >
      <div className="flex items-center gap-4">
        <button
          aria-label="Apple menu"
          onClick={() => setAppleOpen((v) => !v)}
          className="flex items-center justify-center px-2 py-0.5 rounded-sm transition-colors"
          style={{
            background: appleOpen ? "rgba(255,255,255,0.15)" : "transparent",
          }}
        >
          <AppleLogoIcon />
        </button>
        <span className="font-semibold">{activeLabel}</span>
        {activeId === "notes" && <NotesFileMenu />}
        {/* Finder, Settings, Terminal: no extra menus */}
      </div>
      <div className="flex items-center gap-2 text-white/85">
        <MenubarStatus onOpenWindow={onOpenWindow} />
        <button
          onClick={() => setNotifOpen((v) => !v)}
          className="text-[12px] tabular-nums px-1.5 py-0.5 rounded transition-colors"
          style={{ background: notifOpen ? "rgba(255,255,255,0.15)" : "transparent", color: "rgba(255,255,255,0.85)" }}
        >
          {formattedTime}
        </button>
        {notifOpen && <NotificationCenter now={now} onClose={() => setNotifOpen(false)} />}
      </div>

      {appleOpen && (
        <AppleMenu
          onClose={() => setAppleOpen(false)}
          onOpenAbout={() => { setAboutOpen(true); setAppleOpen(false); }}
          onOpenSettings={() => openSettings()}
          onSleep={() => goScreen("sleep")}
          onRestart={() => goScreen("restart")}
          onShutDown={() => goScreen("shutdown")}
          onLockScreen={() => goScreen("lock")}
          onLogOut={() => goScreen("lock")}
        />
      )}
      {aboutOpen && <AboutThisMac onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

function formatTime(d: Date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let hours = d.getHours();
  const mins = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const m = mins < 10 ? "0" + mins : `${mins}`;
  return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()} ${hours}:${m} ${ampm}`;
}

/* =========================== Notes File Menu =========================== */

function NotesFileMenu() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<{ left: number; top: number }>({
    left: 0,
    top: 28,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { selectedNote, createNote, deleteSelected } = useNotesStore();

  const canDelete = selectedNote?.author === "user";

  const openMenu = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setOrigin({ left: rect.left, top: rect.bottom + 1 });
    }
    setOpen(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="px-2 py-0.5 -mx-1 rounded-sm transition-colors"
        style={{
          background: open ? "rgba(255,255,255,0.15)" : "transparent",
          color: "rgba(255,255,255,0.95)",
        }}
      >
        File
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: Z.popoverBackdrop }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            className="fixed w-[200px] rounded-md py-1 select-none cursor-default"
            style={{
              zIndex: Z.popover,
              left: origin.left,
              top: origin.top,
              background: "rgba(38, 38, 38, 0.88)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <FileMenuItem
              onClick={() => {
                createNote();
                setOpen(false);
              }}
              shortcut="⌥⌘N"
            >
              New Note
            </FileMenuItem>
            <FileMenuItem
              onClick={() => {
                if (canDelete) deleteSelected();
                setOpen(false);
              }}
              disabled={!canDelete}
              shortcut="⌫"
            >
              Delete Note
            </FileMenuItem>
          </div>
        </>
      )}
    </>
  );
}

function FileMenuItem({
  onClick,
  disabled,
  shortcut,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[13.5px] disabled:opacity-40 disabled:cursor-default"
      style={{ color: "rgba(255,255,255,0.95)" }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.background = "#0a72e0";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <span>{children}</span>
      {shortcut && (
        <span className="text-[12px] opacity-70 tabular-nums">{shortcut}</span>
      )}
    </button>
  );
}

/* ============================ Apple Menu ============================ */

function AppleMenu({
  onClose,
  onOpenAbout,
  onOpenSettings,
  onSleep,
  onRestart,
  onShutDown,
  onLockScreen,
  onLogOut,
}: {
  onClose: () => void;
  onOpenAbout: () => void;
  onOpenSettings: () => void;
  onSleep: () => void;
  onRestart: () => void;
  onShutDown: () => void;
  onLockScreen: () => void;
  onLogOut: () => void;
}) {
  return (
    <>
      {/* invisible backdrop catches outside clicks */}
      <div
        className="fixed inset-0"
        style={{ zIndex: Z.popoverBackdrop }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed top-7 left-2 w-[260px] rounded-md py-1 select-none cursor-default"
        style={{
          zIndex: Z.popover,
          background: "rgba(38, 38, 38, 0.88)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem icon={<MonitorIcon />} onClick={onOpenAbout}>
          About This Mac
        </MenuItem>
        <Divider />
        <MenuItem icon={<GearIcon />} onClick={onOpenSettings}>
          System Settings…
        </MenuItem>
        <Divider />
        <MenuItem icon={<MoonIcon />} onClick={onSleep}>
          Sleep
        </MenuItem>
        <MenuItem icon={<RestartIcon />} onClick={onRestart}>
          Restart…
        </MenuItem>
        <MenuItem icon={<PowerIcon />} onClick={onShutDown}>
          Shut Down…
        </MenuItem>
        <Divider />
        <MenuItem icon={<LockIcon />} onClick={onLockScreen}>
          Lock Screen
        </MenuItem>
        <MenuItem icon={<LogOutIcon />} onClick={onLogOut}>
          Log Out Kwasi…
        </MenuItem>
      </div>
    </>
  );
}

/* ========================= Notification Center ========================= */

function NotificationCenter({ now, onClose }: { now: Date | null; onClose: () => void }) {
  const today = now ?? new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  // Build calendar grid for current month
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <div className="fixed inset-0" style={{ zIndex: Z.popoverBackdrop }} onClick={onClose} aria-hidden />
      <div
        className="fixed top-8 right-2 rounded-2xl py-5 px-5 shadow-2xl select-none"
        style={{
          zIndex: Z.popover,
          width: 300,
          background: "rgba(28, 28, 30, 0.92)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Date header */}
        <div className="mb-4">
          <div className="text-[13px] text-white/50 uppercase tracking-widest mb-0.5">{monthNames[month]}</div>
          <div className="text-[52px] font-thin leading-none text-white">{day}</div>
          <div className="text-[13px] text-white/50 mt-1">
            {["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][today.getDay()]}
          </div>
        </div>

        <div className="h-px bg-white/10 mb-4" />

        {/* Mini calendar */}
        <div className="text-[11px] text-white/40 text-center mb-2">{monthNames[month]} {year}</div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {dayNames.map((d) => (
            <div key={d} className="text-[10px] text-white/30 pb-1">{d}</div>
          ))}
          {cells.map((d, i) => (
            <div
              key={i}
              className="h-7 flex items-center justify-center text-[12px] rounded-full"
              style={{
                background: d === day ? "#0a72e0" : "transparent",
                color: d === day ? "#fff" : d ? "rgba(255,255,255,0.75)" : "transparent",
                fontWeight: d === day ? 600 : 400,
              }}
            >
              {d ?? "·"}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================ Apple Menu Items ============================ */

function MenuItem({
  icon,
  onClick,
  children,
}: {
  icon: ReactNode;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-1.5 text-left text-[13.5px]"
      style={{ color: "rgba(255,255,255,0.95)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "#0a72e0";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <span className="w-4 h-4 inline-flex items-center justify-center shrink-0 opacity-90">
        {icon}
      </span>
      <span>{children}</span>
    </button>
  );
}

function Divider() {
  return <div className="my-1 mx-2 h-px bg-white/15" />;
}

/* ============================== Icons ============================== */

const AppleLogoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[14px] h-[14px]" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const MonitorIcon = () => (
  <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
    <rect
      x="1.6"
      y="2.4"
      width="12.8"
      height="8.4"
      rx="1.2"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M 6 13.6 H 10 M 8 11 V 13.6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="currentColor">
    <g transform="translate(8 8)">
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="-0.9"
          y="-7.4"
          width="1.8"
          height="2.6"
          rx="0.4"
          transform={`rotate(${i * 45})`}
        />
      ))}
      <circle r="3.6" />
      <circle r="1.4" fill="rgba(38,38,38,0.95)" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="currentColor">
    <path d="M 11.6 9.5 A 4.6 4.6 0 1 1 6.5 4.4 A 3.6 3.6 0 0 0 11.6 9.5 Z" />
  </svg>
);

const RestartIcon = () => (
  <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
    <path
      d="M 13.5 8 A 5.5 5.5 0 1 1 8 2.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path
      d="M 8 1 L 8 4 L 11 4"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PowerIcon = () => (
  <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
    <path
      d="M 8 2.5 V 8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M 5 4.4 A 4.5 4.5 0 1 0 11 4.4"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
    <rect x="3.5" y="7.2" width="9" height="6.4" rx="1.2" fill="currentColor" />
    <path
      d="M 5.4 7.2 V 5.4 A 2.6 2.6 0 0 1 10.6 5.4 V 7.2"
      stroke="currentColor"
      strokeWidth="1.4"
    />
  </svg>
);

const LogOutIcon = () => (
  <svg viewBox="0 0 16 16" className="w-[15px] h-[15px]" fill="none">
    <path
      d="M 9 3 H 4 V 13 H 9"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M 8 8 H 14 M 11.4 5.4 L 14 8 L 11.4 10.6"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
