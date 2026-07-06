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

/**
 * Tiny intent engine. Each rule: match patterns → reply pool. First rule
 * that matches wins; a random reply from its pool is used (avoiding the
 * immediately previous reply). Falls back to a rotating small-talk pool.
 */
type Rule = { match: RegExp; pool: string[] };

const NAME_RE =
  /(?:i'?m|i am|my name'?s|my name is|name'?s|call me)\s+([a-z][a-z'-]{1,20})/i;

const RULES: Rule[] = [
  {
    match: /^(hi|hey|hello|yo|sup|hiya|howdy|good (morning|afternoon|evening))\b/i,
    pool: [
      "hey. welcome to the desktop.",
      "yo. make yourself at home — the windows drag.",
      "hey hey. poke around, nothing here bites.",
    ],
  },
  {
    match: /how (are|r) (you|u)|how'?s it going|you good/i,
    pool: [
      "running at 60fps, thanks for asking. you?",
      "all processes nominal. how are you doing?",
    ],
  },
  {
    match: /(how|what).*(build|built|made|make|stack|tech|framework|code)/i,
    pool: [
      "next.js 14, typescript, tailwind, framer motion. no backend — the whole desktop is client-side.",
      "it's all react — every window, the dock, even this conversation. state lives in your browser's localstorage.",
      "hand-rolled window manager: drag, 8-way resize, z-index layers. no libraries for the windowing.",
    ],
  },
  {
    match: /music|song|playlist|track|listen/i,
    pool: [
      "the music app has the actual rotation. start with on-repeat.",
      "open the music app — the on-repeat note in notes links straight into it.",
    ],
  },
  {
    match: /photo|picture|image|gallery/i,
    pool: ["there's a photos app in the dock now. real camera roll energy."],
  },
  {
    match: /terminal|command|hack/i,
    pool: ["type `help` in the terminal — it knows more than it lets on."],
  },
  {
    match: /wallpaper|theme|dark mode|background/i,
    pool: ["system settings → appearance. the wallpapers are worth the click."],
  },
  {
    match: /contact|email|hire|job|work with|reach (you|him)|linkedin/i,
    pool: [
      "the real inbox lives outside this site — look around the desktop for links.",
      "this thread stays in your browser, so for real contact, check the notes app.",
    ],
  },
  {
    match: /(cool|nice|awesome|amazing|love|dope|sick|impressive|fire)\b/i,
    pool: [
      "appreciated. it was mostly a lot of css.",
      "thanks — tell your friends there's a mac in a browser somewhere.",
      "glad it lands. try breaking it, it's sturdier than it looks.",
    ],
  },
  {
    match: /(bye|goodbye|later|cya|see you|gtg|good night)\b/i,
    pool: [
      "later. the desktop will remember you were here.",
      "bye — the windows will stay where you left them.",
    ],
  },
  {
    match: /who('s| is| are)? (you|kwasi|this)/i,
    pool: [
      "i'm the scripted stand-in. the real one built everything you're looking at — the notes app is the best introduction.",
      "a few hundred lines of typescript doing an impression of the guy who wrote them.",
    ],
  },
  {
    match: /\?$/,
    pool: [
      "good question. i'm a scripted guestbook though — the real kwasi answers that one.",
      "above my pay grade — i'm client-side. but keep exploring, most answers are on this desktop.",
    ],
  },
];

/** Optional second bubble for some intents — the double-text. */
function followUpFor(input: string, visitorName: string | null): string | null {
  if (/^(hi|hey|hello|yo|sup|hiya|howdy)\b/i.test(input) && !visitorName) {
    return "what should i call you?";
  }
  if (/(build|built|made|stack|tech)/i.test(input)) {
    return "the code tour is in the terminal — type `help` and wander.";
  }
  if (/(cool|nice|awesome|amazing|love|dope|sick|impressive|fire)\b/i.test(input) && Math.random() < 0.5) {
    return "the photos app is new, by the way. real camera roll.";
  }
  return null;
}

const STARTERS = ["how was this built?", "who's kwasi?", "any music tips?"];

const FALLBACKS = [
  "noted. this whole inbox lives in your browser, by the way — nothing you type leaves this tab.",
  "have you tried dragging these windows around? go on.",
  "if you break something, refresh. the desktop remembers most things.",
  "still here? open settings and change the wallpaper. treat yourself.",
  "the notes app is where the actual writing lives.",
  "ok, i'm mostly scripted — but you're keeping me on my toes.",
];

function pickReply(input: string, lastReply: string, visitorName: string | null): { reply: string; name: string | null } {
  const nameMatch = input.match(NAME_RE);
  if (nameMatch) {
    const name = nameMatch[1].toLowerCase();
    return {
      reply: `nice to meet you, ${name}. i'd shake your hand but i'm two divs and a border-radius.`,
      name,
    };
  }
  const pools = RULES.filter((r) => r.match.test(input)).map((r) => r.pool);
  const pool = pools.length > 0 ? pools[0] : FALLBACKS;
  const options = pool.filter((p) => p !== lastReply);
  let reply = options[Math.floor(Math.random() * options.length)] ?? pool[0];
  if (visitorName && Math.random() < 0.25) {
    reply = `${visitorName} — ${reply}`;
  }
  return { reply, name: visitorName };
}

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
  const lastReply = useRef("");
  const visitorName = useRef<string | null>(null);

  useEffect(() => {
    const msgs = loadGuestbook();
    setGuestbook(msgs);
    const lastThem = [...msgs].reverse().find((m) => m.from === "them");
    if (lastThem) lastReply.current = lastThem.text;
    try {
      visitorName.current = localStorage.getItem("messages-visitor-name");
    } catch {
      // ignore
    }
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

  function send(preset?: string) {
    const text = (preset ?? draft).trim();
    if (!text) return;
    setDraft("");
    setGuestbook((prev) => [
      ...prev,
      { id: String(Date.now()), from: "me", text, ts: Date.now() },
    ]);
    setTyping(true);
    const { reply, name } = pickReply(text, lastReply.current, visitorName.current);
    lastReply.current = reply;
    if (name && name !== visitorName.current) {
      visitorName.current = name;
      try {
        localStorage.setItem("messages-visitor-name", name);
      } catch {
        // ignore
      }
    }
    const followUp = followUpFor(text, visitorName.current);
    // typing time scales loosely with reply length, like a person
    const delay = 700 + reply.length * 12 + Math.random() * 600;
    setTimeout(() => {
      setTyping(false);
      setGuestbook((prev) => [
        ...prev,
        { id: String(Date.now() + 1), from: "them", text: reply, ts: Date.now() },
      ]);
      if (followUp) {
        setTimeout(() => setTyping(true), 400);
        setTimeout(() => {
          setTyping(false);
          setGuestbook((prev) => [
            ...prev,
            {
              id: String(Date.now() + 2),
              from: "them",
              text: followUp,
              ts: Date.now(),
            },
          ]);
        }, 400 + Math.min(500 + followUp.length * 12, 1800));
      }
    }, Math.min(delay, 2600));
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
          {messages.map((m, idx) => {
            const lastMeIdx = messages
              .map((x) => x.from)
              .lastIndexOf("me");
            const isLastMe = m.from === "me" && idx === lastMeIdx;
            const answered =
              isLastMe &&
              (typing || messages.slice(idx + 1).some((x) => x.from === "them"));
            return (
              <div key={m.id}>
                <div
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
                {isLastMe && thread === "kwasi" && (
                  <div
                    className="text-right text-[10px] mt-0.5 pr-1"
                    style={{ color: "var(--window-text-faint)" }}
                  >
                    {answered ? "read" : "delivered"}
                  </div>
                )}
              </div>
            );
          })}
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

        {/* starter chips */}
        {thread === "kwasi" && guestbook.length <= 2 && !typing && (
          <div className="px-3 pb-1.5 flex gap-1.5 flex-wrap">
            {STARTERS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-2.5 py-1 rounded-full text-[12px]"
                style={{
                  border: "1px solid var(--searchbar-border)",
                  color: "var(--window-text-muted)",
                  background: "var(--searchbar-bg)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

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
              onClick={() => send()}
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
