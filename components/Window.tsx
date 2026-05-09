"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { WindowState } from "@/lib/use-windows";

type Direction = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type Props = {
  state: WindowState;
  title?: string;
  onUpdate: (patch: Partial<WindowState>) => void;
  onClose: () => void;
  onMinimize: () => void;
  onFullscreen: () => void;
  onFocus: () => void;
  isActive?: boolean;
  children: React.ReactNode;
};

export default function Window({
  state,
  title,
  onUpdate,
  onClose,
  onMinimize,
  onFullscreen,
  onFocus,
  isActive,
  children,
}: Props) {
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const resizeRef = useRef<{
    dir: Direction;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const { startX, startY, origX, origY } = dragRef.current;
        onUpdate({
          x: Math.max(0, origX + (e.clientX - startX)),
          y: Math.max(28, origY + (e.clientY - startY)),
        });
      }
      if (resizeRef.current) {
        const r = resizeRef.current;
        let nx = r.origX,
          ny = r.origY,
          nw = r.origW,
          nh = r.origH;
        const dx = e.clientX - r.startX;
        const dy = e.clientY - r.startY;
        if (r.dir.includes("e")) nw = Math.max(420, r.origW + dx);
        if (r.dir.includes("s")) nh = Math.max(320, r.origH + dy);
        if (r.dir.includes("w")) {
          nw = Math.max(420, r.origW - dx);
          nx = r.origX + (r.origW - nw);
        }
        if (r.dir.includes("n")) {
          nh = Math.max(320, r.origH - dy);
          ny = Math.max(28, r.origY + (r.origH - nh));
        }
        onUpdate({ x: nx, y: ny, width: nw, height: nh });
      }
    };
    const onUp = () => {
      dragRef.current = null;
      resizeRef.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [onUpdate]);

  const startDrag = (e: React.MouseEvent) => {
    if (state.fullscreen) return;
    e.preventDefault();
    onFocus();
    document.body.style.userSelect = "none";
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: state.x,
      origY: state.y,
    };
  };

  const startResize = (dir: Direction) => (e: React.MouseEvent) => {
    if (state.fullscreen) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    document.body.style.userSelect = "none";
    resizeRef.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      origX: state.x,
      origY: state.y,
      origW: state.width,
      origH: state.height,
    };
  };

  const [exitType, setExitType] = useState<"close" | "minimize">("close");

  const handleClose = () => {
    setExitType("close");
    onClose();
  };

  const handleMinimize = () => {
    setExitType("minimize");
    onMinimize();
  };

  const isVisible = state.open && !state.minimized;

  // 92px reserves room at the bottom for the dock (~70px tall) plus a 12px
  // breathing gap. Without this, the dock sits on top of fullscreened
  // windows and steals clicks on the bottom edge (e.g. the Music
  // now-playing bar).
  const style: React.CSSProperties = state.fullscreen
    ? {
        left: 0,
        top: 28,
        width: "100vw",
        height: "calc(100vh - 28px - 92px)",
        zIndex: state.z,
        borderRadius: 0,
      }
    : {
        left: state.x,
        top: state.y,
        width: state.width,
        height: state.height,
        zIndex: state.z,
      };

  return (
    <AnimatePresence>
      {isVisible && (
    <motion.div
      custom={exitType}
      variants={{
        initial: { opacity: 0, scale: 0.93 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] as number[] } },
        exit: (et: string) =>
          et === "minimize"
            ? { opacity: 0, scale: 0.08, y: 220, transition: { duration: 0.28, ease: [0.4, 0, 0.6, 1] } }
            : { opacity: 0, scale: 0.93, transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      data-window
      className={`absolute overflow-hidden flex flex-col transition-shadow ${
        state.fullscreen ? "" : "rounded-[12px]"
      }`}
      style={{
        ...style,
        background: "var(--window-bg)",
        color: "var(--window-text)",
        border: "1px solid var(--window-border)",
        boxShadow: isActive
          ? "var(--shadow-window)"
          : "0 15px 40px rgba(0,0,0,0.35)",
        opacity: isActive ? 1 : 0.95,
        transformOrigin: "50% 50%",
      }}
      onMouseDown={onFocus}
    >
      <div
        className="relative h-[34px] w-full flex items-center justify-center px-4 select-none"
        style={{
          background: "var(--titlebar-bg)",
          borderBottom: "1px solid var(--window-divider)",
          cursor: state.fullscreen ? "default" : "grab",
        }}
        onMouseDown={startDrag}
        onDoubleClick={onFullscreen}
      >
        <div className="group absolute left-[12px] top-1/2 -translate-y-1/2 flex items-center gap-[8px]">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            className="flex items-center justify-center w-[12px] h-[12px] rounded-full bg-[#ff5f57] hover:brightness-110 active:brightness-90 outline-none"
            aria-label="close"
          >
            <svg className="opacity-0 desktop:can-hover:group-hover:opacity-100 transition-opacity duration-100" width="6" height="6" viewBox="0 0 6 6" aria-hidden>
              <path d="M1.5 1.5l3 3M4.5 1.5l-3 3" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
            className="flex items-center justify-center w-[12px] h-[12px] rounded-full bg-[#febc2e] hover:brightness-110 active:brightness-90 outline-none"
            aria-label="minimize"
          >
            <svg className="opacity-0 desktop:can-hover:group-hover:opacity-100 transition-opacity duration-100" width="6" height="6" viewBox="0 0 6 6" aria-hidden>
              <path d="M1 3h4" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
            className="flex items-center justify-center w-[12px] h-[12px] rounded-full bg-[#28c840] hover:brightness-110 active:brightness-90 outline-none"
            aria-label="fullscreen"
          >
            <svg className="opacity-0 desktop:can-hover:group-hover:opacity-100 transition-opacity duration-100" width="6" height="6" viewBox="0 0 6 6" aria-hidden>
              <path d="M1 2.5V1h1.5M4.5 1H6v1.5M1 3.5V5h1.5M4.5 5H6V3.5" stroke="rgba(0,0,0,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {title && (
          <div
            className="text-[13px] pointer-events-none"
            style={{ color: "var(--window-text-soft)" }}
          >
            {title}
          </div>
        )}
      </div>

      <div
        className="flex-1 min-h-0 overflow-hidden"
        onMouseDownCapture={(e) => {
          if (!isActive) {
            onFocus();
            e.stopPropagation();
          }
        }}
      >
        {children}
      </div>

      {!state.fullscreen && (
        <>
          <div
            onMouseDown={startResize("n")}
            className="absolute left-3 right-3 top-0 h-[5px] cursor-ns-resize"
          />
          <div
            onMouseDown={startResize("s")}
            className="absolute left-3 right-3 bottom-0 h-[5px] cursor-ns-resize"
          />
          <div
            onMouseDown={startResize("e")}
            className="absolute top-3 bottom-3 right-0 w-[5px] cursor-ew-resize"
          />
          <div
            onMouseDown={startResize("w")}
            className="absolute top-3 bottom-3 left-0 w-[5px] cursor-ew-resize"
          />
          <div
            onMouseDown={startResize("ne")}
            className="absolute right-0 top-0 w-[14px] h-[14px] cursor-nesw-resize"
          />
          <div
            onMouseDown={startResize("nw")}
            className="absolute left-0 top-0 w-[14px] h-[14px] cursor-nwse-resize"
          />
          <div
            onMouseDown={startResize("se")}
            className="absolute right-0 bottom-0 w-[14px] h-[14px] cursor-nwse-resize"
          />
          <div
            onMouseDown={startResize("sw")}
            className="absolute left-0 bottom-0 w-[14px] h-[14px] cursor-nesw-resize"
          />
        </>
      )}
    </motion.div>
      )}
    </AnimatePresence>
  );
}
