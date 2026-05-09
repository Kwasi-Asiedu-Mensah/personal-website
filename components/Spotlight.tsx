"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WINDOW_ID_ORDER, APPS, type WindowId } from "@/lib/app-config";
import { Z } from "@/lib/z-index";
import { notes } from "@/lib/notes-data";

const SEARCHABLE_FILES = [
  "Kwasi Asiedu-Mensah Curriculum Vitae.pdf",
  "AWS Certified Solutions Architect - Associate certificate.pdf",
  "AWS Certified Cloud Practitioner.pdf",
  "Omni_Pitch_Deck.pptx",
  "Centient Pitch Deck.pptx",
  "resume.pdf",
  "server.py",
  "docker-compose.yml",
];

type AppResult = { kind: "app"; id: WindowId; label: string };
type NoteResult = { kind: "note"; id: string; title: string; emoji: string };
type FileResult = { kind: "file"; name: string };
type AnyResult = AppResult | NoteResult | FileResult;

type Props = {
  onOpen: (id: WindowId) => void;
  onOpenFile: (name: string) => void;
  onOpenNote: (id: string) => void;
};

export default function Spotlight({ onOpen, onOpenFile, onOpenNote }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allApps: AppResult[] = WINDOW_ID_ORDER.map((id) => ({
    kind: "app" as const,
    id,
    label: APPS[id].label,
  }));

  const allNotes: NoteResult[] = notes.map((n) => ({
    kind: "note" as const,
    id: n.id,
    title: n.title,
    emoji: n.emoji,
  }));

  const allFiles: FileResult[] = SEARCHABLE_FILES.map((name) => ({
    kind: "file" as const,
    name,
  }));

  const q = query.trim().toLowerCase();

  const matchedApps: AppResult[] = q
    ? allApps.filter((a) => a.label.toLowerCase().includes(q)).slice(0, 4)
    : allApps.slice(0, 4);

  const matchedNotes: NoteResult[] = q
    ? allNotes.filter((n) => n.title.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchedFiles: FileResult[] = q
    ? allFiles.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  // Flat list for keyboard navigation
  const flatResults: AnyResult[] = [
    ...matchedApps,
    ...matchedNotes,
    ...matchedFiles,
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !prev;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    setQuery("");
  };

  const activate = (result: AnyResult) => {
    if (result.kind === "app") {
      onOpen(result.id);
    } else if (result.kind === "note") {
      onOpenNote(result.id);
    } else {
      onOpenFile(result.name);
    }
    dismiss();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      dismiss();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      const r = flatResults[selectedIndex];
      if (r) activate(r);
    }
  };

  // Build a global index offset so we can map section items to flatResults indices
  let globalIdx = 0;

  const renderSection = (
    label: string,
    items: AnyResult[],
    startIndex: number
  ) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <div
          className="px-4 pt-2.5 pb-1 text-[11px] font-medium tracking-wide uppercase"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {label}
        </div>
        {items.map((r, localI) => {
          const idx = startIndex + localI;
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={
                r.kind === "app"
                  ? r.id
                  : r.kind === "note"
                  ? `note-${r.id}`
                  : `file-${r.name}`
              }
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
              style={{
                background: isSelected ? "rgba(10, 114, 224, 0.7)" : "transparent",
                color: "rgba(255,255,255,0.92)",
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
              onClick={() => activate(r)}
            >
              <div className="w-9 h-9 shrink-0 flex items-center justify-center">
                {r.kind === "app" ? (
                  (() => {
                    const AppIcon = APPS[r.id].Icon;
                    return <AppIcon />;
                  })()
                ) : r.kind === "note" ? (
                  <span className="text-2xl leading-none">{r.emoji}</span>
                ) : (
                  <FileIcon name={r.name} />
                )}
              </div>
              <span className="text-[15px] truncate">
                {r.kind === "app"
                  ? r.label
                  : r.kind === "note"
                  ? r.title
                  : r.name}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const hasResults = flatResults.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: Z.popoverBackdrop, background: "rgba(0,0,0,0.28)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={dismiss}
          />
          <motion.div
            className="fixed left-1/2 -translate-x-1/2"
            style={{ top: "20vh", zIndex: Z.popover, width: 620 }}
            initial={{ opacity: 0, scale: 0.92, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -12 }}
            transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div
              className="rounded-[18px] overflow-hidden"
              style={{
                background: "rgba(28, 28, 30, 0.82)",
                backdropFilter: "blur(40px) saturate(180%)",
                WebkitBackdropFilter: "blur(40px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.06)",
              }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{
                  borderBottom: hasResults ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <circle cx="8.5" cy="8.5" r="5.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" />
                  <path d="M13 13l3.5 3.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="spotlight search"
                  className="flex-1 bg-transparent outline-none text-[20px] placeholder:text-white/25"
                  style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "-0.01em" }}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] leading-none"
                    style={{ background: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Results */}
              {hasResults && (
                <div className="pb-2 max-h-[400px] overflow-y-auto">
                  {(() => {
                    globalIdx = 0;
                    const sections = [];

                    if (matchedApps.length > 0) {
                      sections.push(renderSection("applications", matchedApps, globalIdx));
                      globalIdx += matchedApps.length;
                    }
                    if (matchedNotes.length > 0) {
                      sections.push(renderSection("notes", matchedNotes, globalIdx));
                      globalIdx += matchedNotes.length;
                    }
                    if (matchedFiles.length > 0) {
                      sections.push(renderSection("files", matchedFiles, globalIdx));
                    }
                    return sections;
                  })()}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = ext === "pdf";
  const isPptx = ext === "pptx";
  const isPy = ext === "py";
  const isYml = ext === "yml";

  const color = isPdf
    ? "#FF3B30"
    : isPptx
    ? "#FF6B00"
    : isPy
    ? "#3776AB"
    : isYml
    ? "#89D44D"
    : "rgba(255,255,255,0.5)";

  const label = isPdf
    ? "PDF"
    : isPptx
    ? "PPTX"
    : isPy
    ? "PY"
    : isYml
    ? "YML"
    : ext.toUpperCase();

  return (
    <div
      className="w-8 h-9 rounded flex items-end justify-center pb-1"
      style={{ background: color }}
    >
      <span
        className="text-[9px] font-bold leading-none"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        {label}
      </span>
    </div>
  );
}
