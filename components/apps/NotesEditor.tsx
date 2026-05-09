"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  type NoteBlock,
  parseSegments,
  dateFromDaysAgo,
  formatLongDate,
} from "@/lib/notes-data";
import { useNotesStore, type DisplayNote } from "@/lib/notes-store";
import { useAppNavigation } from "@/lib/app-navigation";

export default function NotesEditor({ note }: { note: DisplayNote }) {
  if (note.author === "owner") return <OwnerView note={note} />;
  return <UserEditor note={note} />;
}

/* ============================ Owner read-only ============================ */

function OwnerView({
  note,
}: {
  note: Extract<DisplayNote, { author: "owner" }>;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const longDate = hydrated
    ? formatLongDate(dateFromDaysAgo(note.daysAgo))
    : "";

  const useCollapsible = !!note.collapsibleSections;
  const alwaysExpanded = note.alwaysExpandedHeadings ?? [];

  // A heading is treated as "always expanded" if its text starts with any
  // of the entries in alwaysExpandedHeadings (case-insensitive). Using a
  // prefix match keeps it forgiving when the display text gets tweaks like
  // "rent-free (i'm always saying these things)" — the entry "rent-free"
  // still matches.
  const isAlwaysExpanded = (text: string) =>
    alwaysExpanded.some((prefix) =>
      text.toLowerCase().startsWith(prefix.toLowerCase())
    );

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const toggleHeading = (text: string) => {
    if (isAlwaysExpanded(text)) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(text)) next.delete(text);
      else next.add(text);
      return next;
    });
  };

  // Group blocks into sections (heading + content until next heading) when
  // collapsible mode is on. Blocks that appear before the first heading are
  // rendered as `preBlocks` above the sections, always visible.
  type Section = {
    heading: Extract<NoteBlock, { type: "heading" }>;
    content: NoteBlock[];
  };
  const sections: Section[] = [];
  const preBlocks: NoteBlock[] = [];
  if (useCollapsible) {
    let current: Section | null = null;
    for (const block of note.blocks) {
      if (block.type === "heading") {
        if (current) sections.push(current);
        current = { heading: block, content: [] };
      } else {
        if (current) current.content.push(block);
        else preBlocks.push(block);
      }
    }
    if (current) sections.push(current);
  }

  return (
    <section
      className="flex-1 min-w-0 h-full overflow-y-auto"
      style={{ background: "var(--window-bg)" }}
    >
      <div className="px-12 py-10 max-w-[760px] mx-auto">
        <div
          className="text-[12px] mb-5 text-center"
          style={{ color: "var(--window-text-faint)" }}
        >
          {longDate}
        </div>
        <h1
          className="flex items-center gap-3 text-[28px] font-bold tracking-tight mb-7"
          style={{ color: "var(--window-text)" }}
        >
          <span className="text-[24px] leading-none">{note.emoji}</span>
          <span>{note.title}</span>
        </h1>
        {useCollapsible ? (
          <div className="space-y-3">
            {preBlocks.map((b, i) => (
              <RenderBlock key={`pre-${i}`} block={b} />
            ))}
            {sections.map((section, i) => {
              const isAlwaysOpen = isAlwaysExpanded(section.heading.text);
              const isOpen =
                isAlwaysOpen || expanded.has(section.heading.text);
              return (
                <div key={i}>
                  {isAlwaysOpen ? (
                    <RenderBlock block={section.heading} />
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleHeading(section.heading.text)}
                      aria-expanded={isOpen}
                      className="group w-full flex items-center gap-3 -mx-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-[var(--pill-bg)]"
                      style={{ color: "var(--window-text)" }}
                    >
                      <h3 className="flex-1 text-[17px] font-semibold">
                        {section.heading.text}
                      </h3>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        className="shrink-0 transition-transform duration-300 ease-out group-hover:scale-110"
                        style={{
                          color: "var(--window-text-soft)",
                          transform: isOpen
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                        }}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 4 L10 8 L6 12" />
                      </svg>
                    </button>
                  )}
                  {isAlwaysOpen ? (
                    <div className="space-y-5 mt-5">
                      {section.content.map((b, j) => (
                        <RenderBlock key={j} block={b} />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="grid transition-[grid-template-rows] duration-300 ease-out"
                      style={{
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                      }}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-5 pt-5">
                          {section.content.map((b, j) => (
                            <RenderBlock key={j} block={b} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-5">
            {note.blocks.map((b, i) => (
              <RenderBlock key={i} block={b} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RenderBlock({ block }: { block: NoteBlock }) {
  if (block.type === "heading") {
    return (
      <h3
        className="text-[17px] font-semibold pt-2"
        style={{ color: "var(--window-text)" }}
      >
        {block.text}
      </h3>
    );
  }
  if (block.type === "paragraph") {
    return (
      <p
        className="text-[15px] leading-relaxed"
        style={{ color: "var(--window-text-soft)" }}
      >
        <InlineSegments text={block.text} />
      </p>
    );
  }
  if (block.type === "list") {
    return (
      <ul className="space-y-1.5 pl-1">
        {block.items.map((item, j) => (
          <li
            key={j}
            className="flex items-start gap-3 text-[15px] leading-relaxed"
            style={{ color: "var(--window-text-soft)" }}
          >
            <span
              className="mt-[10px] inline-block w-[3px] h-[3px] rounded-full shrink-0"
              style={{ background: "var(--window-text-muted)" }}
            />
            <span>
              <InlineSegments text={item} />
            </span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === "tags") {
    return (
      <div className="flex flex-wrap gap-2 pt-1">
        {block.items.map((t, j) => (
          <span
            key={j}
            className="px-3 py-1 rounded-full text-[13px]"
            style={{
              border: "1px solid var(--pill-border)",
              background: "var(--pill-bg)",
              color: "var(--window-text-soft)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Render a string with inline `[label](url)` links. URLs that use the
 * `music:` scheme are rendered as buttons that deep-link into the Music
 * app via the cross-app navigation bus — clicking jumps to the on-repeat
 * playlist and starts playback for that track.
 */
function InlineSegments({ text }: { text: string }): ReactNode {
  const { navigate } = useAppNavigation();
  const segs = parseSegments(text);
  return (
    <>
      {segs.map((seg, i) => {
        if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
        if (seg.kind === "bold")
          return (
            <strong key={i} className="font-semibold" style={{ color: "var(--window-text)" }}>
              {seg.text}
            </strong>
          );
        if (seg.kind === "code")
          return (
            <code
              key={i}
              className="px-1 py-px rounded text-[13px] font-mono"
              style={{ background: "var(--pill-bg)", color: "var(--window-text-soft)" }}
            >
              {seg.text}
            </code>
          );
        if (seg.url.startsWith("music:")) {
          const trackId = seg.url.slice("music:".length);
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                // No `view` here on purpose — the Music app picks the
                // right playlist view based on which playlist actually
                // contains the track. Avoids hardcoding "on-repeat" as
                // the destination for songs that only live in favorites.
                navigate({
                  app: "music",
                  data: { trackId },
                })
              }
              className="note-link cursor-pointer bg-transparent border-0 p-0 text-left"
              style={{ font: "inherit" }}
            >
              {seg.label}
            </button>
          );
        }
        return (
          <a
            key={i}
            href={seg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="note-link"
          >
            {seg.label}
          </a>
        );
      })}
    </>
  );
}

/* ============================== User editor ============================== */

function UserEditor({
  note,
}: {
  note: Extract<DisplayNote, { author: "user" }>;
}) {
  const { updateUserNote } = useNotesStore();
  const titleRef = useRef<HTMLInputElement>(null);
  const longDate = formatLongDate(new Date(note.createdAt));

  // Auto-focus the title for fresh empty notes
  useEffect(() => {
    if (note.title === "" && note.body === "" && titleRef.current) {
      titleRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  return (
    <section
      className="flex-1 min-w-0 h-full overflow-y-auto"
      style={{ background: "var(--window-bg)" }}
    >
      <div className="px-12 py-10 max-w-[760px] mx-auto flex flex-col h-full">
        <div
          className="text-[12px] text-center mb-7"
          style={{ color: "var(--window-text-faint)" }}
        >
          {longDate}
        </div>

        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-[26px] leading-none">{note.emoji}</span>
          <input
            ref={titleRef}
            value={note.title}
            onChange={(e) => updateUserNote(note.id, { title: e.target.value })}
            placeholder="Your title here…"
            className="flex-1 bg-transparent outline-none border-none text-[28px] font-bold tracking-tight placeholder:text-[var(--window-text-faint)]"
            style={{ color: "var(--window-text)" }}
            spellCheck={false}
          />
        </div>

        <textarea
          value={note.body}
          onChange={(e) => updateUserNote(note.id, { body: e.target.value })}
          placeholder="Start writing…"
          className="flex-1 w-full bg-transparent outline-none border-none text-[15px] leading-relaxed resize-none placeholder:text-[var(--window-text-faint)]"
          style={{ color: "var(--window-text-soft)", minHeight: "320px" }}
        />
      </div>
    </section>
  );
}
