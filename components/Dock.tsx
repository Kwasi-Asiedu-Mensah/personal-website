"use client";

import { useMotionValue } from "framer-motion";
import DockIcon from "./DockIcon";
import { TrashIcon } from "./icons/DockIcons";
import { APPS, DOCK_LAYOUT, type WindowId } from "@/lib/app-config";
import { Z } from "@/lib/z-index";

type Props = {
  openIds: Set<string>;
  activeId: string | null;
  onOpen: (id: WindowId) => void;
  /** Click handler for the Trash dock icon. */
  onTrashClick?: () => void;
  minimizedIds: Set<WindowId>;
  onRestore: (id: WindowId) => void;
  /** Whether the trash has items in it. */
  trashFull?: boolean;
};

export default function Dock({
  openIds,
  activeId,
  onOpen,
  onTrashClick,
  minimizedIds,
  onRestore,
  trashFull,
}: Props) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div
      data-dock
      className="fixed bottom-3 left-1/2 -translate-x-1/2"
      style={{ zIndex: Z.dock }}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
    >
      <div
        className="flex items-end gap-3 px-4 py-2.5 rounded-[20px] backdrop-blur-xl"
        style={{
          background: "var(--dock-bg)",
          border: "1px solid var(--dock-border)",
          boxShadow: "var(--dock-shadow)",
        }}
      >
        {DOCK_LAYOUT.map((entry, i) => {
          if (entry === "divider") {
            return (
              <span
                key={`divider-${i}`}
                className="self-center w-px h-9 mx-1"
                style={{ background: "var(--dock-divider)" }}
                aria-hidden
              />
            );
          }
          if (entry === "trash") {
            return (
              <div key="trash" id="dock-trash" className="relative">
                <DockIcon
                  mouseX={mouseX}
                  label={trashFull ? "Trash (full)" : "Trash"}
                  onClick={onTrashClick}
                >
                  <span className="relative block w-full h-full">
                    <TrashIcon />
                    {trashFull && (
                      <span
                        className="absolute inset-x-0 top-[10%] mx-auto w-[55%] h-[26%] rounded-sm pointer-events-none"
                        style={{
                          background:
                            "repeating-linear-gradient(135deg, #f5f5f5 0 3px, #d8d8d8 3px 6px)",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
                        }}
                        aria-hidden
                      />
                    )}
                  </span>
                </DockIcon>
              </div>
            );
          }
          const app = APPS[entry];
          if (!app || !app.showOnDock) return null;
          const Icon = app.Icon;
          return (
            <DockIcon
              key={app.id}
              mouseX={mouseX}
              label={app.label}
              open={openIds.has(app.id)}
              active={activeId === app.id}
              onClick={() => onOpen(app.id)}
            >
              <Icon />
            </DockIcon>
          );
        })}

        {/* Minimized windows */}
        {minimizedIds.size > 0 && (
          <>
            <span className="self-center w-px h-9 mx-1" style={{ background: "var(--dock-divider)" }} aria-hidden />
            {Array.from(minimizedIds).map((id) => {
              const app = APPS[id];
              const AppIcon = app.Icon;
              return (
                <DockIcon
                  key={`min-${id}`}
                  mouseX={mouseX}
                  label={`${app.label} (minimized)`}
                  onClick={() => onRestore(id)}
                  minimized
                >
                  <AppIcon />
                </DockIcon>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
