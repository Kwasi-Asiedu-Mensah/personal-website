"use client";

import { useEffect, useRef, useState } from "react";
import { useWindows } from "@/lib/use-windows";
import { useWallpaper, useWallpaperImage } from "@/lib/wallpaper";
import { useSystemState } from "@/lib/system-state";
import { appByLabel, WINDOW_RENDER_ORDER, type WindowId } from "@/lib/app-config";
import { useAppNavigation } from "@/lib/app-navigation";
import { usePlayer } from "@/lib/player";
import Window from "./Window";
import Menubar from "./Menubar";
import Dock from "./Dock";
import Notes from "./apps/Notes";
import Settings from "./apps/Settings";
import Terminal from "./apps/Terminal";
import Finder from "./apps/Finder";
import Preview from "./apps/Preview";
import Music from "./apps/Music";
import Weather from "./apps/Weather";
import ScreenOverlay from "./ScreenOverlay";
import Spotlight from "./Spotlight";
import { useFilePreview } from "@/lib/file-preview";
import { getFileContent } from "@/lib/file-contents";
import { useRecents } from "@/lib/recents";
import { Z } from "@/lib/z-index";

export default function Desktop() {
  const {
    windows,
    bringToFront,
    update,
    close,
    minimize,
    toggleFullscreen,
    open,
    activeId,
  } = useWindows();
  const { current: wallpaper } = useWallpaper();
  const imageUrl = useWallpaperImage(wallpaper.id);
  const { brightness } = useSystemState();
  const { openedFile, setOpenedFile } = useFilePreview();
  const { addRecent } = useRecents();

  // When a non-Finder surface (e.g. dock trash icon) wants to send the
  // user to a specific Finder sidebar destination, bump this nonce and
  // set the target. Finder picks it up via prop and navigates once.
  const [finderJump, setFinderJump] = useState<{
    sidebarId: string;
    nonce: number;
  } | null>(null);

  // Cross-app navigation requests (e.g. clicking a song in the Notes app
  // to deep-link into Music). Opens the window here; the destination app
  // reads `request.view` / `request.data` from the same context to apply
  // the rest. We dedupe with a ref so the same nonce only opens once.
  const { request: navRequest } = useAppNavigation();
  const lastNavNonceRef = useRef<number | null>(null);
  useEffect(() => {
    if (!navRequest) return;
    if (lastNavNonceRef.current === navRequest.nonce) return;
    lastNavNonceRef.current = navRequest.nonce;
    open(navRequest.app);
  }, [navRequest, open]);

  // Pause music whenever the Music window goes from "visible" to
  // "not visible" — covers both close and minimize. The audio element
  // itself lives in PlayerProvider (so it persists across remounts), but
  // the user's expectation is "if I can't see the player, music stops".
  // Detection is done via a transition ref so we only pause on the
  // open->closed edge, not on every render.
  const player = usePlayer();
  const musicVisible =
    !!windows.music?.open && !windows.music?.minimized;
  const wasMusicVisibleRef = useRef(musicVisible);
  useEffect(() => {
    if (wasMusicVisibleRef.current && !musicVisible) {
      player.pause();
    }
    wasMusicVisibleRef.current = musicVisible;
  }, [musicVisible, player]);

  const openFinderAt = (sidebarId: string) => {
    setFinderJump({ sidebarId, nonce: Date.now() });
    open("finder");
  };

  // Open a file in the Preview window. Looks up content by filename;
  // unknown files get a "Cannot preview" placeholder. Also records the
  // open in the Recents store so the Finder Recents folder updates.
  const openFile = (name: string) => {
    const content = getFileContent(name) ?? {
      kind: "binary" as const,
      body: name,
    };
    setOpenedFile({ name, content });
    addRecent(name);
    open("preview");
  };

  // Open an app by its display label (used when double-clicking entries
  // in Finder /Applications/). Resolves to a WindowId via the registry.
  const openAppByName = (name: string) => {
    const app = appByLabel(name);
    if (app) open(app.id);
  };

  // Global keyboard shortcut: Cmd+, opens settings
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return;
      if (e.key === ",") {
        e.preventDefault();
        open("settings");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Apply the Display brightness slider as a CSS filter on the entire site.
  // Min 0.25 keeps things readable so the user can always drag it back up.
  useEffect(() => {
    const root = document.documentElement;
    const factor = 0.25 + 0.75 * (brightness / 100);
    root.style.transition = "filter 0.15s linear";
    root.style.filter = `brightness(${factor})`;
    return () => {
      root.style.filter = "";
      root.style.transition = "";
    };
  }, [brightness]);

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);

  // Include minimized windows so the dock dot persists — minimized ≠ closed.
  const openIds = new Set(
    Object.values(windows)
      .filter((w) => w.open)
      .map((w) => w.id)
  );

  const minimizedIds = new Set(
    Object.values(windows)
      .filter((w) => w.open && w.minimized)
      .map((w) => w.id)
  ) as Set<WindowId>;

  // Image takes precedence over the gradient fallback.
  const desktopBg = imageUrl
    ? `url(${imageUrl}) center/cover no-repeat`
    : wallpaper.desktop;

  // Hide stars when a real photo wallpaper is loaded — the stars only make
  // sense on the cosmic gradient placeholders.
  const showStars = !imageUrl && wallpaper.stars;

  return (
    <div
      data-shell="desktop"
      className="fixed inset-0 overflow-hidden transition-[background] duration-500"
      style={{ background: desktopBg }}
      onContextMenu={(e) => {
        // Only trigger on the desktop surface itself, not on windows/dock
        if ((e.target as HTMLElement).closest("[data-window], [data-dock]")) return;
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }}
    >
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

      <Menubar activeId={activeId} onOpenWindow={open} />

      <div className="absolute inset-0 pt-7">
        {WINDOW_RENDER_ORDER.map((id) => {
          const state = windows[id];
          return (
            <Window
              key={id}
              state={state}
              title={id === "preview" ? openedFile?.name : undefined}
              isActive={activeId === id}
              onUpdate={(patch) => update(id, patch)}
              onClose={() => close(id)}
              onMinimize={() => minimize(id)}
              onFullscreen={() => toggleFullscreen(id)}
              onFocus={() => bringToFront(id)}
            >
              {id === "notes" && <Notes isActive={activeId === "notes"} />}
              {id === "settings" && <Settings />}
              {id === "terminal" && <Terminal />}
              {id === "finder" && (
                <Finder
                  onOpenFile={openFile}
                  onOpenApp={openAppByName}
                  jumpTo={finderJump}
                />
              )}
              {id === "preview" && <Preview />}
              {id === "music" && <Music />}
              {id === "weather" && <Weather />}
            </Window>
          );
        })}
      </div>

      <Dock
        openIds={openIds}
        activeId={activeId}
        onOpen={open}
        onTrashClick={() => openFinderAt("trash")}
        minimizedIds={minimizedIds}
        onRestore={(id) => open(id)}
      />

      <Spotlight
        onOpen={open}
        onOpenFile={openFile}
        onOpenNote={(id) => { void id; open("notes"); }}
      />
      <ScreenOverlay />

      {ctxMenu && (
        <DesktopContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onClose={() => setCtxMenu(null)}
          onChangeWallpaper={() => { open("settings"); setCtxMenu(null); }}
          onAbout={() => { open("settings"); setCtxMenu(null); }}
        />
      )}
    </div>
  );
}

function DesktopContextMenu({
  x, y, onClose, onChangeWallpaper, onAbout,
}: {
  x: number; y: number;
  onClose: () => void;
  onChangeWallpaper: () => void;
  onAbout: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: Z.popoverBackdrop }}
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
        aria-hidden
      />
      <div
        className="fixed min-w-[200px] py-1 rounded-md select-none cursor-default"
        style={{
          zIndex: Z.popover,
          left: Math.min(x, window.innerWidth - 210),
          top: Math.min(y, window.innerHeight - 100),
          background: "rgba(38, 38, 38, 0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <CtxBtn onClick={onChangeWallpaper}>Change Wallpaper…</CtxBtn>
        <div className="my-1 mx-2 h-px bg-white/10" />
        <CtxBtn onClick={onAbout}>About This Mac</CtxBtn>
      </div>
    </>
  );
}

function CtxBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-1.5 text-[13px]"
      style={{ color: "rgba(255,255,255,0.95)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#0a72e0"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      {children}
    </button>
  );
}
