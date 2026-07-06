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
import { useAppNavigation } from "@/lib/app-navigation";
import type { MLCEngine } from "@mlc-ai/web-llm";

type Msg = {
  id: string;
  from: "me" | "them";
  text: string;
  ts: number;
  /** tapback heart (double-click a bubble) */
  react?: boolean;
};

const STORAGE_KEY = "messages-guestbook";

/**
 * Tiny intent engine. Each rule: match patterns → reply pool. First rule
 * that matches wins; a random reply from its pool is used (avoiding the
 * immediately previous reply). Falls back to a rotating small-talk pool.
 *
 * Pool entries may be functions of the live desktop context, so replies can
 * reference the actual wallpaper, theme, or hour. A rule may also carry an
 * `action` — an app the desktop actually opens after the reply lands.
 */
type Ctx = { hour: number; wallpaper: string; theme: string };
type PoolItem = string | ((ctx: Ctx) => string);
type Rule = {
  match: RegExp;
  pool: PoolItem[];
  action?: "music" | "photos" | "settings";
};

const NAME_RE =
  /(?:i'?m|i am|my name'?s|my name is|name'?s|call me)\s+([a-z][a-z'-]{1,20})\s*$/i;

/** Volunteered facts we remember and weave back in later. */
const FACT_RES: { key: "from" | "work"; re: RegExp; ack: (v: string) => string }[] = [
  {
    key: "from",
    re: /(?:i'?m from|i live in|calling from|writing from)\s+([a-z][a-z .'-]{2,30})/i,
    ack: (v) =>
      `${v}. noted — this desktop gets around more than its owner does.`,
  },
  {
    key: "work",
    re: /i (?:work (?:as|at|in)|study)\s+([a-z][a-z .'-]{2,40})/i,
    ack: (v) => `${v} — respect. sounds busier than being a chat window.`,
  },
];

const RULES: Rule[] = [
  {
    match: /^(hi|hey|hello|yo|sup|hiya|howdy|good (morning|afternoon|evening))\b/i,
    pool: [
      (c) =>
        c.hour < 5
          ? "awake at this hour? respect. welcome to the desktop."
          : c.hour < 12
            ? "morning. the desktop's just waking up too."
            : c.hour >= 22
              ? "late one. make yourself at home — the windows drag."
              : "hey. welcome to the desktop.",
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
    match: /music|song|playlist|track|listen|play (me )?something/i,
    pool: [
      "say less — opening the rotation for you.",
      "one sec, putting you on. on-repeat is the truth.",
    ],
    action: "music",
  },
  {
    match: /photo|picture|image|gallery/i,
    pool: ["real camera roll energy — here, i'll open it."],
    action: "photos",
  },
  {
    match: /terminal|command|hack/i,
    pool: ["type `help` in the terminal — it knows more than it lets on."],
  },
  {
    match: /wallpaper|theme|dark mode|background/i,
    pool: [
      (c) =>
        `you're on ${c.wallpaper.replace(/-/g, " ")} in ${c.theme} mode right now. settings → appearance if you want to redecorate — i'll take you.`,
    ],
    action: "settings",
  },
  {
    match: /what time|the time/i,
    pool: [
      (c) =>
        `your machine says ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase()}. the menubar agrees.`,
    ],
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
    match: /joke|make me laugh|funny/i,
    pool: [
      "i asked the terminal for a joke. it said `command not found`. i thought that was pretty good.",
      "my whole existence is pretending to be an operating system inside an operating system. that's the joke.",
      "two windows walk into a bar. the z-index handled it.",
    ],
  },
  {
    match: /ghana|accra|africa/i,
    pool: [
      "ghana first — every decision on this desktop was made in accra.",
      "accra built. the wallpapers are california, the code is ghana.",
    ],
  },
  {
    match: /(thank|thanks|thx|merci|medaase)/i,
    pool: ["anytime.", "that's what i'm rendered for."],
  },
  {
    match: /weather/i,
    pool: ["there's a whole weather app in the dock — it takes its job very seriously."],
  },
  {
    match: /help|what can (you|i) do|commands/i,
    pool: [
      "i can talk about the site, the stack, the music, the photos. or just keep you company while the windows drift.",
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

/* ------------------------------ smart mode ------------------------------ */
/**
 * Opt-in in-browser LLM (WebLLM). The model downloads once (~700MB, then
 * cached by the browser) and runs fully client-side — nothing leaves the
 * visitor's machine, same privacy story as the scripted engine.
 */
const LLM_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";
const LLM_SYSTEM = `you are the messages app on kwasi asiedu-mensah's personal website — a macos desktop that runs in the browser. you are a playful, dry, lowercase stand-in for kwasi, not the real person.

facts you may use: the site is built with next.js 14, typescript, tailwind, framer motion; no backend — everything is client-side; there are working apps: finder, notes, terminal, music (his real playlists), photos (his real camera roll), weather, settings, messages (you); kwasi is based in accra, ghana. you yourself run entirely in the visitor's browser via webllm.

rules: reply in lowercase only. keep replies to one to three short sentences. be warm and a little wry. never invent personal facts about kwasi (relationships, employer, age, etc.) — if asked, say the real kwasi keeps that off the record and point them to exploring the site. never share contact details. no emoji unless the visitor uses them first.`;

type LlmState = "off" | "loading" | "on" | "error";

const FALLBACKS = [
  "noted. this whole inbox lives in your browser, by the way — nothing you type leaves this tab.",
  "have you tried dragging these windows around? go on.",
  "if you break something, refresh. the desktop remembers most things.",
  "still here? open settings and change the wallpaper. treat yourself.",
  "the notes app is where the actual writing lives.",
  "ok, i'm mostly scripted — but you're keeping me on my toes.",
];

function pickReply(
  input: string,
  lastReply: string,
  visitorName: string | null,
  ctx: Ctx,
  lastRule: Rule | null
): { reply: string; name: string | null; action?: Rule["action"]; rule: Rule | null } {
  const nameMatch = input.match(NAME_RE);
  if (nameMatch) {
    const name = nameMatch[1].toLowerCase();
    return {
      reply: `nice to meet you, ${name}. i'd shake your hand but i'm two divs and a border-radius.`,
      name,
      rule: null,
    };
  }
  // "another one" — rerun the previous intent
  let rule =
    /another|again|one more|more of (that|those)/i.test(input) && lastRule
      ? lastRule
      : RULES.find((r) => r.match.test(input)) ?? null;
  const pool: PoolItem[] = rule ? rule.pool : FALLBACKS;
  const resolved = pool.map((p) => (typeof p === "function" ? p(ctx) : p));
  const options = resolved.filter((p) => p !== lastReply);
  let reply = options[Math.floor(Math.random() * options.length)] ?? resolved[0];
  if (visitorName && Math.random() < 0.25) {
    reply = `${visitorName} — ${reply}`;
  }
  return { reply, name: visitorName, action: rule?.action, rule };
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
  const awaitingName = useRef(false);
  const lastRule = useRef<Rule | null>(null);
  const facts = useRef<{ from?: string; work?: string }>({});
  const { navigate } = useAppNavigation();
  const [llm, setLlm] = useState<LlmState>("off");
  const [llmProgress, setLlmProgress] = useState("");
  const engineRef = useRef<MLCEngine | null>(null);

  async function enableSmartMode() {
    if (llm === "loading" || llm === "on") return;
    setLlm("loading");
    setLlmProgress("warming up…");
    try {
      const webllm = await import("@mlc-ai/web-llm");
      const engine = await webllm.CreateMLCEngine(LLM_MODEL, {
        initProgressCallback: (p) => {
          const pct = Math.round((p.progress ?? 0) * 100);
          setLlmProgress(
            pct > 0 ? `downloading brain… ${pct}%` : p.text.toLowerCase().slice(0, 60)
          );
        },
      });
      engineRef.current = engine;
      setLlm("on");
      try {
        localStorage.setItem("messages-smart-mode", "1");
      } catch {
        // ignore
      }
      setGuestbook((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          from: "them",
          text: "ok — real brain online. it lives entirely in your browser, so it's still just us in here.",
          ts: Date.now(),
        },
      ]);
    } catch {
      setLlm("error");
      setLlmProgress("");
      setGuestbook((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          from: "them",
          text: "couldn't load the big brain (this needs a recent browser with webgpu). the scripted me will have to do.",
          ts: Date.now(),
        },
      ]);
    }
  }

  // visitor opted in before → bring the brain back automatically (cached)
  useEffect(() => {
    if (!hydrated) return;
    try {
      if (localStorage.getItem("messages-smart-mode") === "1" && llm === "off") {
        void enableSmartMode();
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function llmReply(userText: string): Promise<string | null> {
    const engine = engineRef.current;
    if (!engine) return null;
    try {
      const history = guestbook.slice(-8).map((m) => ({
        role: m.from === "me" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
      const nameLine = visitorName.current
        ? ` the visitor's name is ${visitorName.current}.`
        : "";
      const res = await engine.chat.completions.create({
        messages: [
          { role: "system", content: LLM_SYSTEM + nameLine },
          ...history,
          { role: "user", content: userText },
        ],
        temperature: 0.8,
        max_tokens: 110,
      });
      const out = res.choices[0]?.message?.content?.trim();
      return out ? out.toLowerCase() : null;
    } catch {
      return null;
    }
  }

  const desktopCtx = (): Ctx => {
    let wallpaper = "tahoe";
    let theme = "light";
    try {
      wallpaper = localStorage.getItem("macos-desktop-wallpaper") ?? wallpaper;
      theme = localStorage.getItem("macos-desktop-theme") ?? theme;
    } catch {
      // ignore
    }
    return { hour: new Date().getHours(), wallpaper, theme };
  };

  useEffect(() => {
    const msgs = loadGuestbook();
    const lastThem = [...msgs].reverse().find((m) => m.from === "them");
    if (lastThem) lastReply.current = lastThem.text;
    try {
      visitorName.current = localStorage.getItem("messages-visitor-name");
      facts.current = JSON.parse(
        localStorage.getItem("messages-visitor-facts") ?? "{}"
      );
      // returning visitor: greet by name if it's been a while
      const lastSeen = Number(localStorage.getItem("messages-last-seen") ?? 0);
      const away = Date.now() - lastSeen;
      if (visitorName.current && lastSeen > 0 && away > 6 * 3600_000) {
        const tail = facts.current.from
          ? ` how's ${facts.current.from}?`
          : " the desktop kept your windows exactly where you left them.";
        msgs.push({
          id: String(Date.now()),
          from: "them",
          text: `back again, ${visitorName.current}.${tail}`,
          ts: Date.now(),
        });
      }
      localStorage.setItem("messages-last-seen", String(Date.now()));
    } catch {
      // ignore
    }
    setGuestbook(msgs);
    setHydrated(true);
  }, []);

  // one gentle nudge if the window sits open untouched (once per session)
  useEffect(() => {
    if (!hydrated) return;
    let nudged = false;
    try {
      nudged = sessionStorage.getItem("messages-nudged") === "1";
    } catch {
      // ignore
    }
    if (nudged) return;
    const t = setTimeout(() => {
      setGuestbook((prev) => {
        if (prev.some((m) => m.from === "me")) return prev;
        try {
          sessionStorage.setItem("messages-nudged", "1");
        } catch {
          // ignore
        }
        return [
          ...prev,
          {
            id: String(Date.now()),
            from: "them",
            text: "no pressure. the dock's not going anywhere.",
            ts: Date.now(),
          },
        ];
      });
    }, 45_000);
    return () => clearTimeout(t);
  }, [hydrated]);

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

    // remember names/facts no matter which brain answers
    const silentName = text.match(NAME_RE);
    if (silentName && !visitorName.current) {
      visitorName.current = silentName[1].toLowerCase();
      try {
        localStorage.setItem("messages-visitor-name", visitorName.current);
      } catch {
        // ignore
      }
    }

    // smart mode: the in-browser model answers instead of the script
    if (llm === "on" && engineRef.current) {
      setTyping(true);
      void (async () => {
        const out = await llmReply(text);
        const fallback = pickReply(
          text,
          lastReply.current,
          visitorName.current,
          desktopCtx(),
          lastRule.current
        );
        const replyText = out ?? fallback.reply;
        lastReply.current = replyText;
        setTyping(false);
        setGuestbook((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            from: "them",
            text: replyText,
            ts: Date.now(),
          },
        ]);
      })();
      return;
    }

    setTyping(true);
    let picked = pickReply(
      text,
      lastReply.current,
      visitorName.current,
      desktopCtx(),
      lastRule.current
    );
    // if we just asked their name, a bare one-or-two-word answer IS the name
    if (
      awaitingName.current &&
      !visitorName.current &&
      /^[a-z][a-z '-]{1,24}$/i.test(text) &&
      text.split(/\s+/).length <= 2
    ) {
      const bare = text.split(/\s+/)[0].toLowerCase();
      picked = {
        reply: `${bare}. good name. it's on the guest list now.`,
        name: bare,
        rule: null,
      };
    }
    // volunteered facts (where they're from, what they do) get remembered
    if (!picked.rule) {
      for (const f of FACT_RES) {
        const m = text.match(f.re);
        if (m) {
          const v = m[1].trim().toLowerCase();
          facts.current = { ...facts.current, [f.key]: v };
          try {
            localStorage.setItem(
              "messages-visitor-facts",
              JSON.stringify(facts.current)
            );
          } catch {
            // ignore
          }
          picked = { reply: f.ack(v), name: visitorName.current, rule: null };
          break;
        }
      }
    }
    awaitingName.current = false;
    const { reply, name, action } = picked;
    lastRule.current = picked.rule;
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
    if (followUp === "what should i call you?") awaitingName.current = true;
    // typing time scales loosely with reply length, like a person
    const delay = 700 + reply.length * 12 + Math.random() * 600;
    // sometimes kwasi hearts your message before replying, like a person
    const willHeart = Math.random() < 0.18;
    setTimeout(() => {
      setTyping(false);
      setGuestbook((prev) => {
        let next = prev;
        if (willHeart) {
          const lastMe = [...prev].reverse().find((m) => m.from === "me");
          if (lastMe) {
            next = prev.map((m) =>
              m.id === lastMe.id ? { ...m, react: true } : m
            );
          }
        }
        return [
          ...next,
          {
            id: String(Date.now() + 1),
            from: "them",
            text: reply,
            ts: Date.now(),
          },
        ];
      });
      if (action) {
        // actually open the app it just talked about
        setTimeout(() => {
          if (action === "music") {
            navigate({ app: "music", view: "playlist:on-repeat" });
          } else {
            navigate({ app: action });
          }
        }, 900);
      }
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
      preview: typing
        ? "typing…"
        : guestbook.length > 0
          ? guestbook[guestbook.length - 1].text
          : "say anything",
    },
    { id: "tips", name: "site tips", preview: "welcome to the desktop…" },
  ];

  const fmtTime = (ts: number) =>
    new Date(ts)
      .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      .toLowerCase();

  /** double-click tapback, like the real thing */
  function toggleReact(id: string) {
    setGuestbook((prev) =>
      prev.map((m) => (m.id === id ? { ...m, react: !m.react } : m))
    );
  }

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
      </div>

      {/* thread */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4"
        >
          {messages.map((m, idx) => {
            const lastMeIdx = messages
              .map((x) => x.from)
              .lastIndexOf("me");
            const isLastMe = m.from === "me" && idx === lastMeIdx;
            const answered =
              isLastMe &&
              (typing || messages.slice(idx + 1).some((x) => x.from === "them"));
            const prev = messages[idx - 1];
            const sameSender = prev && prev.from === m.from;
            const showTime =
              thread === "kwasi" &&
              m.ts > 0 &&
              (!prev || m.ts - prev.ts > 3600_000);
            return (
              <div key={m.id} className={sameSender && !showTime ? "mt-[3px]" : "mt-3"}>
                {showTime && (
                  <div
                    className="text-center text-[10px] mb-2"
                    style={{ color: "var(--window-text-faint)" }}
                  >
                    {fmtTime(m.ts)}
                  </div>
                )}
                <div
                  className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    onDoubleClick={
                      thread === "kwasi" ? () => toggleReact(m.id) : undefined
                    }
                    className="relative max-w-[70%] px-3 py-1.5 rounded-2xl text-[13px] leading-snug select-none"
                    style={
                      m.from === "me"
                        ? { background: "#0a84ff", color: "#ffffff" }
                        : {
                            background: "var(--row-active)",
                            color: "var(--window-text)",
                          }
                    }
                  >
                    {m.react && (
                      <span
                        className="absolute -top-3 text-[13px]"
                        style={{
                          [m.from === "me" ? "left" : "right"]: "-6px",
                        }}
                      >
                        ❤️
                      </span>
                    )}
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

        {/* smart mode */}
        {thread === "kwasi" && (
          <div className="px-3 pb-1 flex items-center gap-2">
            {llm === "off" && (
              <button
                onClick={() => void enableSmartMode()}
                className="px-2.5 py-1 rounded-full text-[11px]"
                style={{
                  border: "1px solid var(--searchbar-border)",
                  color: "var(--window-text-muted)",
                  background: "var(--searchbar-bg)",
                }}
                title="downloads a small language model that runs entirely in your browser"
              >
                ✨ smarter replies (one-time ~700mb download)
              </button>
            )}
            {llm === "loading" && (
              <span
                className="text-[11px]"
                style={{ color: "var(--window-text-muted)" }}
              >
                ✨ {llmProgress}
              </span>
            )}
            {llm === "on" && (
              <span className="text-[11px]" style={{ color: "#34c759" }}>
                ✨ smart mode — runs in your browser
              </span>
            )}
          </div>
        )}

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
