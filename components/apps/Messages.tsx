"use client";

/**
 * Messages — a client-side guestbook styled like iMessage.
 *
 * Two threads:
 *   - "kwasi" — visitors can type; a scripted auto-reply answers. Everything
 *     stays in the visitor's localStorage; nothing is sent anywhere.
 *   - "site tips" — a static scripted thread that doubles as a tour.
 */

import { useEffect, useRef, useState } from "react";
import { useSessionState } from "@/lib/sidebar-persistence";

type Msg = {
  id: string;
  from: "me" | "them";
  text: string;
  ts: number;
};

const STORAGE_KEY = "messages-guestbook";

const AUTO_REPLIES = [
  "hey — thanks for stopping by.",
  "fun fact: this whole inbox lives in your browser. nothing you type leaves this tab.",
  "have you tried dragging these windows around? go on.",
  "the music app has my actual rotation. start with the on-repeat playlist.",
  "if you break something, refresh. the desktop remembers most things.",
  "type `help` in the terminal — it knows more than it lets on.",
  "still here? open settings and change the wallpaper. treat yourself.",
  "ok i'm out of scripted replies. it was nice talking. sort of.",
];

const TIPS_THREAD: Msg[] = [
  { id: "t1", from: "them", text: "welcome to the desktop. a few things worth knowing —", ts: 0 },
  { id: "t2", from: "them", text: "windows drag, resize from all 8 edges, and remember where you left them.", ts: 1 },
  { id: "t3", from: "them", text: "the terminal has a simulated filesystem. poke around with `ls` and `cat`.", ts: 2 },
  { id: "t4", from: "them", text: "songs in the notes app are clickable — they open the music app on the right track.", ts: 3 },
  { id: "t5", from: "them", text: "wallpapers, themes, and about live in system settings.", ts: 4 },
];

type ThreadId = "kwasi" | "tips";

function loadGuestbook(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [
    {
      id: "seed",
      from: "them",
      text: "hey. this is a guestbook pretending to be an inbox. say anything.",
      ts: Date.now(),
    },
  ];
}

export default function Messages() {
  const [thread, setThread] = useSessionState<ThreadId>(
    "messages",
    "thread",
    "kwasi"
  );
  const [guestbook, setGuestbook] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyCount = useRef(0);

  useEffect(() => {
    const msgs = loadGuestbook();
    setGuestbook(msgs);
    replyCount.current = msgs.filter((m) => m.from === "them").length - 1;
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestbook.slice(-200)));
    } catch {
      // ignore
    }
  }, [guestbook, hydrated]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [guestbook, typing, thread]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setGuestbook((prev) => [
      ...prev,
      { id: String(Date.now()), from: "me", text, ts: Date.now() },
    ]);
    setTyping(true);
    const reply =
      AUTO_REPLIES[Math.min(replyCount.current, AUTO_REPLIES.length - 1)];
    replyCount.current += 1;
    setTimeout(() => {
      setTyping(false);
      setGuestbook((prev) => [
        ...prev,
        { id: String(Date.now() + 1), from: "them", text: reply, ts: Date.now() },
      ]);
    }, 900 + Math.random() * 700);
  }

  const messages = thread === "kwasi" ? guestbook : TIPS_THREAD;
  const threads: { id: ThreadId; name: string; preview: string }[] = [
    {
      id: "kwasi",
      name: "kwasi",
      preview:
        guestbook.length > 0
          ? guestbook[guestbook.length - 1].text
          : "say anything",
    },
    { id: "tips", name: "site tips", preview: "welcome to the desktop…" },
  ];

  return (
    <div className="flex h-full" style={{ background: "var(--window-bg)" }}>
      {/* sidebar */}
      <div
        className="w-[200px] shrink-0 flex flex-col py-2 px-1.5"
        style={{
          background: "var(--searchbar-bg)",
          borderRight: "1px solid var(--window-divider)",
        }}
      >
        <div
          className="px-2 pb-1.5 text-[11px] uppercase tracking-wide"
          style={{ color: "var(--section-label)" }}
        >
          conversations
        </div>
        <div className="space-y-0.5">
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setThread(t.id)}
              className="w-full text-left px-2 py-1.5 rounded-md flex items-start gap-2"
              style={{
                background: thread === t.id ? "rgba(120,120,128,0.20)" : undefined,
              }}
            >
              <span
                className="mt-0.5 w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[12px] text-white"
                style={{
                  background:
                    t.id === "kwasi"
                      ? "linear-gradient(180deg, #34c759, #1f9d43)"
                      : "linear-gradient(180deg, #0a84ff, #0060df)",
                }}
              >
                {t.id === "kwasi" ? "k" : "?"}
              </span>
              <span className="min-w-0">
                <span
                  className="block text-[13px] leading-tight"
                  style={{ color: "var(--window-text)" }}
                >
                  {t.name}
                </span>
                <span
                  className="block text-[11px] truncate"
                  style={{ color: "var(--window-text-muted)" }}
                >
                  {t.preview}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div
          className="mt-auto px-2 pt-2 text-[11px] leading-snug"
          style={{ color: "var(--window-text-faint)" }}
        >
          messages stay in your browser. nothing is sent.
        </div>
      </div>

      {/* thread */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[70%] px-3 py-1.5 rounded-2xl text-[13px] leading-snug"
                style={
                  m.from === "me"
                    ? { background: "#0a84ff", color: "#ffffff" }
                    : {
                        background: "var(--row-active)",
                        color: "var(--window-text)",
                      }
                }
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing && thread === "kwasi" && (
            <div className="flex justify-start">
              <div
                className="px-3 py-2 rounded-2xl text-[13px] tracking-widest"
                style={{
                  background: "var(--row-active)",
                  color: "var(--window-text-muted)",
                }}
              >
                •••
              </div>
            </div>
          )}
        </div>

        {/* composer */}
        {thread === "kwasi" ? (
          <div
            className="px-3 py-2.5 flex items-center gap-2"
            style={{ borderTop: "1px solid var(--window-divider)" }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="imessage (not really)"
              className="flex-1 px-3 py-1.5 rounded-full text-[13px] outline-none"
              style={{
                background: "var(--searchbar-bg)",
                border: "1px solid var(--searchbar-border)",
                color: "var(--window-text)",
              }}
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[13px] disabled:opacity-30"
              style={{ background: "#0a84ff" }}
              aria-label="send"
            >
              ↑
            </button>
          </div>
        ) : (
          <div
            className="px-3 py-2.5 text-center text-[12px]"
            style={{
              borderTop: "1px solid var(--window-divider)",
              color: "var(--window-text-faint)",
            }}
          >
            scripted thread — replies are off
          </div>
        )}
      </div>
    </div>
  );
}
