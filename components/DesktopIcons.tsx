"use client";

/**
 * Files that live on the desktop. Draggable; double-click opens Preview;
 * drop one on the dock's trash and it's trashed (restorable from the
 * desktop context menu). Which files remain on the desktop — and where —
 * persists to localStorage.
 */

import { useEffect, useRef, useState } from "react";
import { useTrash } from "@/lib/trash";
import { Z } from "@/lib/z-index";

export type DesktopFile = { name: string; ext: string };

export const DEFAULT_DESKTOP_FILES: DesktopFile[] = [
  { name: "README.md", ext: "md" },
  { name: "resume.pdf", ext: "pdf" },
  { name: "Screenshot 2026-04-29.png", ext: "png" },
  { name: "todo.md", ext: "md" },
];

const POS_KEY = "desktop-icon-positions";
const GONE_KEY = "desktop-icons-trashed";

type Pos = { x: number; y: number };

function iconGlyph(ext: string): string {
  if (ext === "pdf") return "📄";
  if (ext === "png" || ext === "jpg") return "🖼️";
  return "📝";
}

export default function DesktopIcons({
  onOpenFile,
}: {
  onOpenFile: (name: string) => void;
}) {
  const { trash } = useTrash();
  const [gone, setGone] = useState<string[]>([]);
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [hydrated, setHydrated] = useState(false);
  const dragRef = useRef<{
    name: string;
    startX: number;
    startY: number;
    origin: Pos;
    moved: boolean;
  } | null>(null);
  const [dragOverTrash, setDragOverTrash] = useState(false);

  useEffect(() => {
    try {
      setGone(JSON.parse(localStorage.getItem(GONE_KEY) ?? "[]"));
      setPositions(JSON.parse(localStorage.getItem(POS_KEY) ?? "{}"));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  // items put back from the trash need to reappear: listen for the event
  useEffect(() => {
    const onRestore = () => {
      setGone([]);
      try {
        localStorage.setItem(GONE_KEY, "[]");
      } catch {
        // ignore
      }
    };
    window.addEventListener("desktop-restore-icons", onRestore);
    return () => window.removeEventListener("desktop-restore-icons", onRestore);
  }, []);

  const defaultPos = (i: number): Pos => ({
    x: (typeof window !== "undefined" ? window.innerWidth : 1400) - 110,
    y: 60 + i * 96,
  });

  function onMouseDown(e: React.MouseEvent, name: string, i: number) {
    e.preventDefault();
    const origin = positions[name] ?? defaultPos(i);
    dragRef.current = {
      name,
      startX: e.clientX,
      startY: e.clientY,
      origin,
      moved: false,
    };
    const move = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = ev.clientX - d.startX;
      const dy = ev.clientY - d.startY;
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      setPositions((prev) => ({
        ...prev,
        [d.name]: { x: d.origin.x + dx, y: d.origin.y + dy },
      }));
      const t = document.getElementById("dock-trash");
      if (t) {
        const r = t.getBoundingClientRect();
        setDragOverTrash(
          ev.clientX > r.left - 8 &&
            ev.clientX < r.right + 8 &&
            ev.clientY > r.top - 8
        );
      }
    };
    const up = (ev: MouseEvent) => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      const d = dragRef.current;
      dragRef.current = null;
      setDragOverTrash(false);
      if (!d) return;
      const t = document.getElementById("dock-trash");
      if (d.moved && t) {
        const r = t.getBoundingClientRect();
        if (
          ev.clientX > r.left - 8 &&
          ev.clientX < r.right + 8 &&
          ev.clientY > r.top - 8
        ) {
          // dropped on the trash
          const file = DEFAULT_DESKTOP_FILES.find((f) => f.name === d.name);
          if (file) {
            trash({ name: file.name, ext: file.ext });
            setGone((prev) => {
              const next = [...prev, file.name];
              try {
                localStorage.setItem(GONE_KEY, JSON.stringify(next));
              } catch {
                // ignore
              }
              return next;
            });
          }
          return;
        }
      }
      // persist final position
      setPositions((prev) => {
        try {
          localStorage.setItem(POS_KEY, JSON.stringify(prev));
        } catch {
          // ignore
        }
        return prev;
      });
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  if (!hydrated) return null;

  return (
    <>
      {DEFAULT_DESKTOP_FILES.filter((f) => !gone.includes(f.name)).map(
        (f, i) => {
          const pos = positions[f.name] ?? defaultPos(i);
          return (
            <div
              key={f.name}
              onMouseDown={(e) => onMouseDown(e, f.name, i)}
              onDoubleClick={() => onOpenFile(f.name)}
              className="absolute flex flex-col items-center w-[92px] cursor-default select-none group"
              style={{ left: pos.x, top: pos.y, zIndex: Z.windowFloor }}
              title={f.name}
            >
              <span className="text-[40px] leading-none drop-shadow-md">
                {iconGlyph(f.ext)}
              </span>
              <span
                className="mt-1 px-1.5 py-0.5 rounded text-[11px] text-white text-center leading-tight max-w-full truncate"
                style={{
                  background: "rgba(0,0,0,0.35)",
                  textShadow: "0 1px 2px rgba(0,0,0,0.6)",
                }}
              >
                {f.name}
              </span>
            </div>
          );
        }
      )}
      {dragOverTrash && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[12px] text-white"
          style={{ background: "rgba(0,0,0,0.65)", zIndex: Z.popover }}
        >
          release to move to trash
        </div>
      )}
    </>
  );
}
