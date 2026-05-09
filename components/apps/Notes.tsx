"use client";

import { useEffect, useState } from "react";
import { useNotesStore } from "@/lib/notes-store";
import NotesSidebar from "./NotesSidebar";
import NotesEditor from "./NotesEditor";

type Props = {
  isActive?: boolean;
  isMobile?: boolean;
};

export default function Notes({ isActive = true, isMobile = false }: Props) {
  const {
    allNotes,
    selectedId,
    selectedNote,
    setSelectedId,
    createNote,
    deleteSelected,
  } = useNotesStore();

  const [mobilePanel, setMobilePanel] = useState<"list" | "editor">("list");

  // Keyboard shortcuts (only when Notes is the active window)
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      // ⌥⌘N (or Ctrl+Alt+N) → new note. Browsers reserve plain ⌘N for new
      // window so we use Option as the extra modifier. Use e.code so Option
      // doesn't change the key into a special character on macOS.
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.code === "KeyN") {
        e.preventDefault();
        createNote();
        return;
      }

      // Backspace / Delete on a user note (only when not typing in an input)
      if ((e.key === "Backspace" || e.key === "Delete") && !isInput) {
        if (selectedNote?.author === "user") {
          e.preventDefault();
          deleteSelected();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, createNote, deleteSelected, selectedNote]);

  if (isMobile) {
    const handleMobileSelect = (id: string) => {
      setSelectedId(id);
      setMobilePanel("editor");
    };

    return (
      <div className="flex flex-col h-full" style={{ background: "var(--window-bg)" }}>
        {mobilePanel === "list" ? (
          <NotesSidebar
            notes={allNotes}
            selectedId={selectedId ?? ""}
            onSelect={handleMobileSelect}
            fullWidth
          />
        ) : (
          <>
            <div
              className="shrink-0 flex items-center px-4 py-2.5"
              style={{ borderBottom: "1px solid var(--window-divider)" }}
            >
              <button
                onClick={() => setMobilePanel("list")}
                className="flex items-center gap-1 text-[#007AFF] active:opacity-60"
              >
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                  <path
                    d="M6.5 1.5L1 6.5l5.5 5"
                    stroke="#007AFF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-[14px]">notes</span>
              </button>
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[14px] font-medium truncate max-w-[55%]"
                style={{ color: "var(--window-text-soft)" }}
              >
                {selectedNote?.title ?? ""}
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {selectedNote ? (
                <NotesEditor note={selectedNote} />
              ) : (
                <section
                  className="flex-1 flex items-center justify-center text-[13px]"
                  style={{ color: "var(--window-text-muted)" }}
                >
                  no note selected
                </section>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex h-full w-full"
      style={{ background: "var(--window-bg)" }}
    >
      <NotesSidebar
        notes={allNotes}
        selectedId={selectedId ?? ""}
        onSelect={setSelectedId}
      />
      {selectedNote ? (
        <NotesEditor note={selectedNote} />
      ) : (
        <section
          className="flex-1 flex items-center justify-center text-[13px]"
          style={{ color: "var(--window-text-muted)" }}
        >
          No note selected
        </section>
      )}
    </div>
  );
}
