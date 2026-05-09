"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type GroupKey,
  GROUP_ORDER,
  groupNotes,
  dateFromDaysAgo,
  formatShortDate,
} from "@/lib/notes-data";
import { useNotesStore, type DisplayNote } from "@/lib/notes-store";
import { Z } from "@/lib/z-index";

type Props = {
  notes: DisplayNote[];
  selectedId: string;
  onSelect: (id: string) => void;
  fullWidth?: boolean;
};

type ContextMenuState = {
  x: number;
  y: number;
  note: DisplayNote;
};

export default function NotesSidebar({ notes, selectedId, onSelect, fullWidth = false }: Props) {
  const [query, setQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<ContextMenuState | null>(null);
  const { createNote, deleteUserNote, togglePinned } = useNotesStore();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return notes;
    const q = query.toLowerCase();
    return notes.filter((n) => {
      if (n.title.toLowerCase().includes(q)) return true;
      if (n.preview.toLowerCase().includes(q)) return true;
      if (n.author === "user") return n.body.toLowerCase().includes(q);
      // Search all block content for owner notes
      return n.blocks.some((block) => {
        if ("text" in block) return block.text.toLowerCase().includes(q);
        if ("items" in block)
          return block.items.some((item) => item.toLowerCase().includes(q));
        return false;
      });
    });
  }, [notes, query]);

  const grouped = useMemo(() => groupNotes(filtered), [filtered]);

  const handleContextMenu = (e: React.MouseEvent, note: DisplayNote) => {
    e.preventDefault();
    onSelect(note.id);
    setCtxMenu({ x: e.clientX, y: e.clientY, note });
  };

  return (
    <aside
      className={`${fullWidth ? "w-full" : "w-[300px]"} shrink-0 flex flex-col h-full`}
      style={{
        background: "var(--window-bg)",
        borderRight: "1px solid var(--window-divider)",
      }}
    >
      {/* Top toolbar with new note button */}
      <div className="flex items-center justify-end px-3 pt-3 pb-2">
        <button
          aria-label="New note"
          title="New note (⌥⌘N)"
          onClick={() => createNote()}
          className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[var(--row-hover)] transition-colors"
        >
          <span className="text-[14px]">✎</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-3 pb-3">
        <div
          className="flex items-center gap-2 px-2.5 h-8 rounded-md"
          style={{
            background: "var(--searchbar-bg)",
            border: "1px solid var(--searchbar-border)",
          }}
        >
          <span
            className="text-[12px]"
            style={{ color: "var(--window-text-muted)" }}
          >
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-[var(--window-text-faint)]"
            style={{ color: "var(--window-text)" }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] leading-none transition-opacity hover:opacity-80"
              style={{ background: "var(--window-text-muted)", color: "var(--window-bg)" }}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-6">
        {GROUP_ORDER.map((group) => {
          const items = grouped[group];
          if (!items || items.length === 0) return null;
          return (
            <Section
              key={group}
              label={group}
              notes={items}
              selectedId={selectedId}
              onSelect={onSelect}
              hydrated={hydrated}
              onContextMenu={handleContextMenu}
            />
          );
        })}
        {hydrated && filtered.length === 0 && (
          <div
            className="px-5 py-3 text-[12px]"
            style={{ color: "var(--window-text-muted)" }}
          >
            No matches.
          </div>
        )}
      </div>

      {ctxMenu && (
        <NoteContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          note={ctxMenu.note}
          onClose={() => setCtxMenu(null)}
          onTogglePin={() => {
            togglePinned(ctxMenu.note.id);
            setCtxMenu(null);
          }}
          onDelete={() => {
            if (ctxMenu.note.author === "user") {
              deleteUserNote(ctxMenu.note.id);
            }
            setCtxMenu(null);
          }}
        />
      )}
    </aside>
  );
}

function Section({
  label,
  notes,
  selectedId,
  onSelect,
  hydrated,
  onContextMenu,
}: {
  label: GroupKey;
  notes: DisplayNote[];
  selectedId: string;
  onSelect: (id: string) => void;
  hydrated: boolean;
  onContextMenu: (e: React.MouseEvent, note: DisplayNote) => void;
}) {
  return (
    <div>
      <div
        className="px-5 pt-3 pb-1 text-[11px] font-semibold tracking-tight"
        style={{ color: "var(--section-label)" }}
      >
        {label === "Pinned" && (
          <span className="inline-block mr-1.5" aria-hidden>
            ⊜
          </span>
        )}
        {label}
      </div>
      <ul>
        {notes.map((n) => {
          const active = n.id === selectedId;
          const date = hydrated
            ? formatShortDate(dateFromDaysAgo(n.daysAgo))
            : "";
          return (
            <li key={n.id}>
              <button
                onClick={() => onSelect(n.id)}
                onContextMenu={(e) => onContextMenu(e, n)}
                className="w-full text-left px-5 py-2.5 transition-colors rounded-md mx-1 my-px"
                style={{
                  background: active
                    ? "var(--note-selected-bg)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--row-hover)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                }}
              >
                <div
                  className="flex items-center gap-2 text-[14px] font-semibold"
                  style={{ color: "var(--window-text)" }}
                >
                  <span className="text-[14px] leading-none">{n.emoji}</span>
                  {n.title && <span>{n.title}</span>}
                </div>
                <div
                  className="text-[12px] mt-1 flex items-center gap-2 truncate"
                  style={{ color: "var(--window-text-muted)" }}
                >
                  <span className="shrink-0">{date}</span>
                  {n.preview && <span className="truncate">{n.preview}</span>}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NoteContextMenu({
  x,
  y,
  note,
  onClose,
  onTogglePin,
  onDelete,
}: {
  x: number;
  y: number;
  note: DisplayNote;
  onClose: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const isPinned = !!note.pinned;
  const canDelete = note.author === "user";
  return (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: Z.popoverBackdrop }}
        onClick={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
        aria-hidden
      />
      <div
        className="fixed min-w-[170px] py-1 rounded-md select-none cursor-default"
        style={{
          zIndex: Z.popover,
          left: x,
          top: y,
          background: "rgba(38, 38, 38, 0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <ContextMenuButton onClick={onTogglePin}>
          {isPinned ? "Unpin Note" : "Pin Note"}
        </ContextMenuButton>
        <CtxDivider />
        <ContextMenuButton onClick={onDelete} disabled={!canDelete}>
          Delete
        </ContextMenuButton>
        {!canDelete && (
          <div
            className="px-3 pt-0.5 pb-1 text-[10px]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            owner notes are read-only
          </div>
        )}
      </div>
    </>
  );
}

function CtxDivider() {
  return <div className="my-1 mx-2 h-px bg-white/10" />;
}

function ContextMenuButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="w-full text-left px-3 py-1.5 text-[13px] disabled:opacity-40 disabled:cursor-default"
      style={{ color: "rgba(255,255,255,0.95)" }}
      onMouseEnter={(e) => {
        if (!disabled)
          (e.currentTarget as HTMLButtonElement).style.background = "#0a72e0";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}
