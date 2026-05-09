/**
 * File content registry. Looked up by file name (since names are unique
 * enough across the demo filesystem). Supports plain text, markdown, code,
 * and "binary" placeholders for things like PDFs, images, and zips.
 */

export type FileKind = "text" | "markdown" | "code" | "image" | "pdf" | "slides" | "binary";

export type PdfPage = {
  title?: string;
  body: string;
};

export type Slide = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  body?: string;
  isTitleSlide?: boolean;
};

export type FileContent =
  | { kind: "text"; body: string; language?: string }
  | { kind: "markdown"; body: string }
  | { kind: "code"; body: string; language?: string }
  | { kind: "image"; svgBody: string; caption?: string }
  | { kind: "pdf"; pages: PdfPage[] }
  | { kind: "slides"; slides: Slide[] }
  | { kind: "binary"; body: string };

export const FILE_CONTENTS: Record<string, FileContent> = {
  // ---------------- Documents ----------------
  "runbook.md": {
    kind: "markdown",
    body: `# Production Runbook

Last reviewed: April 2026

## On-call essentials

1. Check service health: \`kubectl get pods -n prod\`
2. Tail logs: \`kubectl logs -f <pod> -n prod --tail=200\`
3. Check recent deploys: \`kubectl rollout history deploy/<name> -n prod\`
4. Check Grafana dashboards before paging anyone else.

## SLO breach

If error rate > 1% for 5 minutes:
- page on-call (PagerDuty)
- post in #incidents
- start an incident doc from the template

## Rollback

\`\`\`
kubectl rollout undo deploy/<name> -n prod
\`\`\`

If the bad deploy is more than one revision back, specify:

\`\`\`
kubectl rollout undo deploy/<name> --to-revision=<n> -n prod
\`\`\`

## Database

- Read replicas: 3
- Connection pool max: 200 per service
- If pool exhausted: scale service horizontally before touching DB.

## Escalation

- L1 → on-call SRE
- L2 → platform lead
- L3 → CTO (only for revenue-impacting incidents)
`,
  },
  "incidents.md": {
    kind: "markdown",
    body: `# Incidents log

## 2026-04-22 — api gateway brief outage
- Duration: 8 minutes
- Cause: stale TLS cert on edge
- Fix: cert-manager renewal cron was paused
- Owner: platform team

## 2026-03-08 — db connection pool exhausted
- Duration: 22 minutes
- Cause: long-running migration held connections
- Fix: killed migration, ran in batches off-hours
- Owner: data team

## 2026-02-14 — increased p99 latency on checkout
- Duration: 35 minutes
- Cause: misconfigured retry storm from mobile client
- Fix: shipped client-side circuit breaker
- Owner: mobile team
`,
  },
  "notes.md": {
    kind: "markdown",
    body: `# Notes

quick scratch for things i don't want to lose:

- ask about q3 priorities
- review the new oncall rotation policy
- pick up groceries
- read the latest sigops paper
`,
  },
  "resume.pdf": {
    kind: "pdf",
    pages: [
      {
        title: "[your name]",
        body: `[your role] · [your location]
[your email] · [your phone] · [your website]

## Summary

[a short two-line summary about who you are and what you do.
swap this for your real summary.]

## Experience

### [your current role] — [your current company]
[start month] [start year] – Present

- [a thing you owned or shipped]
- [another notable outcome]
- [a third bullet showing scope or impact]

### [your previous role 1] — [your previous company 1]
[start year] – [end year]

- [what you owned]
- [a notable outcome]
- [team / scope]

### [your previous role 2] — [your previous company 2]
[start year] – [end year]

- [what you did]
- [a notable outcome]

## Education

**[your school]** — [your degree], [year]
`,
      },
      {
        title: "[your name] — page 2",
        body: `## Skills

[primary stack or focus area]

- [tool 1]
- [tool 2]
- [tool 3]
- [tool 4]
- [tool 5]

## Selected Projects

### [your project 1]
[one line description]

### [your project 2]
[one line description]

### [your project 3]
[one line description]

## Talks & writing

- [your talk title] — [event] — [year]
- [your post title] — [publication] — [year]

## References

Available on request.
`,
      },
    ],
  },
  "cover-letter.pdf": {
    kind: "pdf",
    pages: [
      {
        body: `[your name]
[your email] · [your phone]
[today's date]

Dear hiring manager,

[opening paragraph — why you're writing, the role, and a hook that
signals you actually read about the company.]

[middle paragraph — connect your experience to what they need. pick
two or three specific things from your background, not a laundry list.]

[third paragraph — what you'd want to do in the role and why it fits
where you're trying to grow.]

Thanks for your time.

[your name]
`,
      },
    ],
  },

  // ---------------- Downloads ----------------
  "macOS-Tahoe-Wallpapers.zip": {
    kind: "binary",
    body: "macOS-Tahoe-Wallpapers.zip — 14 MB archive",
  },
  "Screenshot 2026-04-29.png": {
    kind: "image",
    caption: "Grafana dashboard — request latency p50/p95/p99",
    svgBody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#0f1419"/>
      <rect x="0" y="0" width="800" height="36" fill="#181f2a"/>
      <circle cx="18" cy="18" r="6" fill="#ff5f57"/>
      <circle cx="40" cy="18" r="6" fill="#febc2e"/>
      <circle cx="62" cy="18" r="6" fill="#28c940"/>
      <text x="400" y="22" font-size="13" fill="#9aa4b2" text-anchor="middle" font-family="ui-monospace,monospace">grafana — api / latency</text>
      <text x="40" y="70" font-size="14" fill="#e6edf3" font-family="system-ui">Request latency (last 6h)</text>
      <text x="40" y="92" font-size="11" fill="#7d8590" font-family="system-ui">p50 · p95 · p99</text>
      <rect x="40" y="110" width="720" height="220" fill="#161b22" stroke="#30363d"/>
      <line x1="40" y1="220" x2="760" y2="220" stroke="#30363d" stroke-dasharray="3,3"/>
      <line x1="40" y1="170" x2="760" y2="170" stroke="#30363d" stroke-dasharray="3,3"/>
      <line x1="40" y1="270" x2="760" y2="270" stroke="#30363d" stroke-dasharray="3,3"/>
      <path d="M 40 280 L 100 270 L 160 275 L 220 268 L 280 272 L 340 265 L 400 270 L 460 268 L 520 272 L 580 268 L 640 270 L 700 268 L 760 270" stroke="#3fb950" stroke-width="2" fill="none"/>
      <path d="M 40 240 L 100 235 L 160 232 L 220 228 L 280 230 L 340 220 L 400 228 L 460 215 L 520 232 L 580 218 L 640 230 L 700 222 L 760 228" stroke="#58a6ff" stroke-width="2" fill="none"/>
      <path d="M 40 200 L 100 175 L 160 195 L 220 165 L 280 180 L 340 140 L 400 175 L 460 130 L 520 188 L 580 145 L 640 195 L 700 160 L 760 178" stroke="#f78166" stroke-width="2" fill="none"/>
      <text x="50" y="128" font-size="10" fill="#3fb950" font-family="system-ui">p50</text>
      <text x="80" y="128" font-size="10" fill="#58a6ff" font-family="system-ui">p95</text>
      <text x="110" y="128" font-size="10" fill="#f78166" font-family="system-ui">p99</text>
      <text x="40" y="370" font-size="14" fill="#e6edf3" font-family="system-ui">Error rate</text>
      <rect x="40" y="380" width="720" height="80" fill="#161b22" stroke="#30363d"/>
      <path d="M 40 440 L 100 438 L 160 436 L 220 432 L 280 435 L 340 430 L 400 432 L 460 425 L 520 432 L 580 428 L 640 435 L 700 432 L 760 435" stroke="#3fb950" stroke-width="2" fill="none"/>
      <text x="55" y="455" font-size="10" fill="#7d8590" font-family="ui-monospace,monospace">0.18% — within SLO</text>
    </svg>`,
  },
  "design-mockup.fig": {
    kind: "binary",
    body: "design-mockup.fig — Figma file",
  },

  // ---------------- personal-website ----------------
  "package.json": {
    kind: "code",
    language: "json",
    body: `{
  "name": "personal-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "framer-motion": "11.0.0",
    "tailwindcss": "3.4.0"
  }
}
`,
  },
  "README.md": {
    kind: "markdown",
    body: `# personal-website

a next.js 14 site that simulates a full macOS desktop. notes, finder, terminal,
system settings — all draggable, resizable, persisted.

## stack

- next.js 14 (app router)
- typescript
- tailwind
- framer-motion

## scripts

\`\`\`
npm run dev      # local dev
npm run build    # prod build
npm run start    # serve build
\`\`\`

## structure

- \`app/\` — next routes + global styles
- \`components/\` — desktop, dock, menubar, window chrome, apps
- \`lib/\` — state hooks, providers, data
`,
  },

  "AGENTS.md": {
    kind: "markdown",
    body: `# AGENTS.md

macOS-style desktop website. Next.js 14 (app router), React, TypeScript, Tailwind. No backend — everything is client-side, persisted to \`localStorage\` / \`sessionStorage\`.

## how to work in this repo

1. read \`docs/design-system.md\` before touching any UI — colors, sidebar layout, window chrome, lowercase rules.
2. always start at \`lib/app-config.ts\` when adding or modifying an app. it's the single source of truth.
3. use \`Z\` constants from \`lib/z-index.ts\` — never inline \`z-[NNNN]\` Tailwind utilities.
4. there is no test framework. the only gate is \`npm run build\` and a visual pass in \`npm run dev\`.

## key files

| path | purpose |
|------|---------|
| \`lib/app-config.ts\` | app registry — every app defined here |
| \`lib/use-windows.ts\` | window state machine (open/close/focus/minimize/drag/resize) |
| \`lib/z-index.ts\` | named z-index layers |
| \`lib/sidebar-persistence.ts\` | per-window view state via \`useSessionState\` |
| \`components/Desktop.tsx\` | top-level shell — renders all windows, menubar, dock |
| \`components/Window.tsx\` | window chrome (drag, resize, traffic lights) |
| \`components/apps/\` | each app (Finder, Notes, Settings, Terminal, Preview, Music, Weather) |
| \`app/globals.css\` | CSS variables for both themes + scrollbar styling |

## adding a new app — checklist

1. write the component at \`components/apps/MyApp.tsx\`
2. add an icon to \`components/icons/DockIcons.tsx\`
3. register in \`lib/app-config.ts\` (WindowId, APPS, WINDOW_RENDER_ORDER, DOCK_LAYOUT)
4. add render branch in \`components/Desktop.tsx\`
5. use \`useSessionState\` for view state that should survive minimize
`,
  },
  "CLAUDE.md": {
    kind: "markdown",
    body: `# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Commands

\`\`\`bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build — the only correctness gate
npm run lint     # ESLint
\`\`\`

## What this is

A personal website that renders a full macOS desktop in the browser. No pages, no routing — the entire viewport is a living desktop with draggable/resizable windows, a dock, menubar, wallpapers, and fully functional apps.

Built with Next.js 14 (App Router), TypeScript, Tailwind, and Framer Motion. No backend — everything is client-side.

## High-level architecture

### Providers → Desktop → Windows → Apps

\`app/layout.tsx\` wraps the app in context providers (theme, wallpaper, system state, screen overlays, notes, file preview, recents, audio player, app navigation). \`app/page.tsx\` renders a single \`<Desktop />\`.

### App registry (\`lib/app-config.ts\`)

Single source of truth for every app: id, label, icon, default window size/position, dock visibility.

### Window management

\`useWindows()\` called once in \`Desktop.tsx\`. Each window has position, size, z-index, open/minimized/fullscreen state — persisted to \`localStorage\`.

## Design conventions

- All visible text is lowercase. Exceptions: file extensions (PDF, MD), brand strings, proper nouns.
- Icons: \`components/icons/DockIcons.tsx\` — prefers \`/public/icons/<name>.png\`, falls back to inline SVG.
`,
  },
  "design-system.md": {
    kind: "markdown",
    body: `# Design System

dark-themed macOS desktop. minimal, lowercase, system-font.

## colors

CSS variables in \`app/globals.css\`. Two themes: light and dark via \`[data-theme="dark"]\` on \`<html>\`.

| token | use |
|-------|-----|
| \`--window-bg\` | window background |
| \`--window-text\` | primary text |
| \`--window-text-muted\` | metadata, captions |
| \`--titlebar-bg\` | window title bar |
| \`--row-hover\` | row hover state |
| \`--link\` | inline links |
| \`--dock-bg\` | dock pill background |

Brand accents (hard-coded):
- \`#3478f6\` — Finder selection blue
- \`#ff5f57\` / \`#febc2e\` / \`#28c940\` — traffic lights
- \`#0a84ff\` — active state in Settings

## typography

System font: \`-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif\`

Mono: \`"SF Mono", "JetBrains Mono", Menlo, ui-monospace, monospace\`

Common sizes: 11px (labels), 12px (captions), 13px (body), 14–15px (editor text), 20–28px (page titles)

## conventions

- all visible text lowercase (exceptions: brand strings, file extensions in chrome)
- use \`Z\` from \`lib/z-index.ts\` — never inline z-index numbers
- CSS vars via \`style={{ background: "var(--token)" }}\` — no hardcoded hex inside components
- minimum window size: 420×320
`,
  },

  "tailwind.config.ts": {
    kind: "code",
    language: "typescript",
    body: `import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1a1a1a",
        foreground: "#fafafa",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("can-hover", "@media (any-hover: hover) and (any-pointer: fine)");
      addVariant("desktop", "[data-shell='desktop'] &");
    }),
  ],
};

export default config;
`,
  },
  "app-config.ts": {
    kind: "code",
    language: "typescript",
    body: `/**
 * App registry — single source of truth for every app.
 * Edit this file to add, remove, or reconfigure apps.
 */

export type WindowId =
  | "finder"
  | "notes"
  | "terminal"
  | "settings"
  | "preview"
  | "music"
  | "weather";

export type AppConfig = {
  id: WindowId;
  label: string;
  Icon: React.ComponentType;
  defaultWindow: {
    x: number; y: number;
    width: number; height: number;
    initiallyOpen?: boolean;
  };
  showOnDock: boolean;
  showInApplications: boolean;
  accentColor?: string;
};

export const DOCK_LAYOUT = [
  "finder", "notes", "music", "weather",
  "terminal", "settings", "divider", "trash",
];

export const WINDOW_RENDER_ORDER: WindowId[] = [
  "finder", "settings", "terminal", "preview",
  "weather", "music", "notes",
];
`,
  },
  "use-windows.ts": {
    kind: "code",
    language: "typescript",
    body: `"use client";

import { useCallback, useEffect, useState } from "react";
import { APPS, WINDOW_ID_ORDER, WINDOW_RENDER_ORDER, type WindowId } from "./app-config";
import { clearAppState } from "./sidebar-persistence";

export type WindowState = {
  id: WindowId;
  open: boolean;
  minimized: boolean;
  fullscreen: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
};

const STORAGE_KEY = "macos-desktop-windows-v7";

export function useWindows() {
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>(initialWindows);
  const [hydrated, setHydrated] = useState(false);

  // On mount: restore only geometry from localStorage.
  // open/minimized/z always reset so every session starts clean.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = initialWindows();
        Object.keys(parsed).forEach((id) => {
          if (!merged[id as WindowId]) return;
          const p = parsed[id];
          if (typeof p.x === "number") merged[id as WindowId].x = p.x;
          if (typeof p.y === "number") merged[id as WindowId].y = p.y;
          if (typeof p.width === "number") merged[id as WindowId].width = p.width;
          if (typeof p.height === "number") merged[id as WindowId].height = p.height;
        });
        setWindows(merged);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const bringToFront = useCallback((id: WindowId) => { /* ... */ }, []);
  const open = useCallback((id: WindowId) => { /* ... */ }, []);
  const close = useCallback((id: WindowId) => { clearAppState(id); /* ... */ }, []);
  const minimize = useCallback((id: WindowId) => { /* ... */ }, []);
  const toggleFullscreen = useCallback((id: WindowId) => { /* ... */ }, []);
  const update = useCallback((id: WindowId, patch: Partial<WindowState>) => { /* ... */ }, []);

  return { windows, hydrated, bringToFront, open, close, minimize, toggleFullscreen, update };
}
`,
  },
  "notes-data.ts": {
    kind: "code",
    language: "typescript",
    body: `/**
 * Owner notes — bundled read-only notes shown to all visitors.
 * User-created notes live in localStorage via notes-store.tsx.
 *
 * Each note has blocks rendered by NotesPreview.tsx:
 *   heading | paragraph | list | tags | image | code | divider
 *
 * Markdown-style links in list items:  [label](url) or [label](music:song-id)
 */

export type NoteBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "tags"; items: string[] }
  | { type: "code"; language?: string; body: string }
  | { type: "divider" };

export type OwnerNote = {
  id: string;
  emoji: string;
  title: string;
  daysAgo: number;
  preview: string;
  pinned?: boolean;
  blocks: NoteBlock[];
};

export const notes: OwnerNote[] = [
  // about-me, quick-links, principles, bookmarks,
  // on-repeat, reading-list, films, top-5, people, writing
  // — see full file for content
];
`,
  },

  // ---------------- k8s-cluster ----------------
  Makefile: {
    kind: "code",
    language: "makefile",
    body: `.PHONY: deploy diff destroy logs

deploy:
\tkubectl apply -k manifests/

diff:
\tkubectl diff -k manifests/

destroy:
\tkubectl delete -k manifests/

logs:
\tkubectl logs -f -n prod -l app=$(APP) --tail=100
`,
  },

  // ---------------- Desktop ----------------
  "scratch.md": {
    kind: "markdown",
    body: `quick thoughts:

- the desktop site is becoming the resume itself
- next: pin notion/linear integrations?
- write a post about building this
`,
  },
  "meeting-notes.md": {
    kind: "markdown",
    body: `# meeting notes

## roadmap sync — yesterday

- prioritise reliability work over new features for the next sprint
- staffing on the migration is still tight
- align on cutover date next week

## 1:1 with manager

- focus areas this quarter: latency wins, oncall hygiene
- mentorship opportunities — pair with junior on logging
`,
  },
  "todo.md": {
    kind: "markdown",
    body: `- [ ] update resume
- [ ] reply to recruiter from yesterday
- [ ] finish writeup on the migration
- [ ] book dentist
- [x] water the plants
`,
  },
  "Screenshot 2026-05-01 at 06.12.png": {
    kind: "image",
    caption: "Editor — Desktop.tsx",
    svgBody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#1e1e1e"/>
      <rect x="0" y="0" width="800" height="36" fill="#252526"/>
      <circle cx="18" cy="18" r="6" fill="#ff5f57"/>
      <circle cx="40" cy="18" r="6" fill="#febc2e"/>
      <circle cx="62" cy="18" r="6" fill="#28c940"/>
      <text x="400" y="22" font-size="12" fill="#a0a0a0" text-anchor="middle" font-family="ui-monospace,monospace">Desktop.tsx — personal-website</text>
      <rect x="0" y="36" width="220" height="464" fill="#252526"/>
      <text x="14" y="56" font-size="11" fill="#a0a0a0" font-family="ui-monospace,monospace">EXPLORER</text>
      <text x="14" y="80" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">▾ personal-website</text>
      <text x="28" y="100" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">▾ app</text>
      <text x="42" y="118" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace">layout.tsx</text>
      <text x="42" y="136" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace">page.tsx</text>
      <text x="42" y="154" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace">globals.css</text>
      <text x="28" y="174" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">▾ components</text>
      <rect x="28" y="186" width="190" height="20" fill="#37373d"/>
      <text x="42" y="200" font-size="12" fill="#fff" font-family="ui-monospace,monospace">Desktop.tsx</text>
      <text x="42" y="218" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace">Window.tsx</text>
      <text x="42" y="236" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace">Dock.tsx</text>
      <text x="42" y="254" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace">Menubar.tsx</text>
      <text x="240" y="76" font-size="12" fill="#6a9955" font-family="ui-monospace,monospace">// renders all windows + dock</text>
      <text x="240" y="98" font-size="12" fill="#c586c0" font-family="ui-monospace,monospace">import</text>
      <text x="296" y="98" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace">{ useWindows }</text>
      <text x="408" y="98" font-size="12" fill="#c586c0" font-family="ui-monospace,monospace">from</text>
      <text x="446" y="98" font-size="12" fill="#ce9178" font-family="ui-monospace,monospace">"@/lib/use-windows"</text>
      <text x="240" y="118" font-size="12" fill="#c586c0" font-family="ui-monospace,monospace">import</text>
      <text x="296" y="118" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace">Notes</text>
      <text x="332" y="118" font-size="12" fill="#c586c0" font-family="ui-monospace,monospace">from</text>
      <text x="370" y="118" font-size="12" fill="#ce9178" font-family="ui-monospace,monospace">"./apps/Notes"</text>
      <text x="240" y="148" font-size="12" fill="#c586c0" font-family="ui-monospace,monospace">export default function</text>
      <text x="416" y="148" font-size="12" fill="#dcdcaa" font-family="ui-monospace,monospace">Desktop()</text>
      <text x="496" y="148" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">{</text>
      <text x="252" y="170" font-size="12" fill="#c586c0" font-family="ui-monospace,monospace">const</text>
      <text x="288" y="170" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">{ windows, open } = </text>
      <text x="442" y="170" font-size="12" fill="#dcdcaa" font-family="ui-monospace,monospace">useWindows</text>
      <text x="514" y="170" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">();</text>
      <text x="252" y="200" font-size="12" fill="#c586c0" font-family="ui-monospace,monospace">return</text>
      <text x="296" y="200" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">(</text>
      <text x="264" y="222" font-size="12" fill="#808080" font-family="ui-monospace,monospace">&lt;</text>
      <text x="272" y="222" font-size="12" fill="#4ec9b0" font-family="ui-monospace,monospace">div</text>
      <text x="296" y="222" font-size="12" fill="#9cdcfe" font-family="ui-monospace,monospace"> className</text>
      <text x="370" y="222" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">=</text>
      <text x="380" y="222" font-size="12" fill="#ce9178" font-family="ui-monospace,monospace">"fixed inset-0"</text>
      <text x="492" y="222" font-size="12" fill="#808080" font-family="ui-monospace,monospace">&gt;</text>
      <text x="276" y="244" font-size="12" fill="#808080" font-family="ui-monospace,monospace">&lt;</text>
      <text x="284" y="244" font-size="12" fill="#4ec9b0" font-family="ui-monospace,monospace">Menubar</text>
      <text x="340" y="244" font-size="12" fill="#808080" font-family="ui-monospace,monospace"> /&gt;</text>
      <text x="276" y="266" font-size="12" fill="#808080" font-family="ui-monospace,monospace">&lt;</text>
      <text x="284" y="266" font-size="12" fill="#4ec9b0" font-family="ui-monospace,monospace">Dock</text>
      <text x="316" y="266" font-size="12" fill="#808080" font-family="ui-monospace,monospace"> /&gt;</text>
      <text x="264" y="288" font-size="12" fill="#808080" font-family="ui-monospace,monospace">&lt;/</text>
      <text x="280" y="288" font-size="12" fill="#4ec9b0" font-family="ui-monospace,monospace">div</text>
      <text x="304" y="288" font-size="12" fill="#808080" font-family="ui-monospace,monospace">&gt;</text>
      <text x="252" y="310" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">);</text>
      <text x="240" y="332" font-size="12" fill="#cccccc" font-family="ui-monospace,monospace">}</text>
      <rect x="0" y="476" width="800" height="24" fill="#007acc"/>
      <text x="14" y="492" font-size="11" fill="#fff" font-family="ui-monospace,monospace">main *</text>
      <text x="60" y="492" font-size="11" fill="#fff" font-family="ui-monospace,monospace">TypeScript React</text>
      <text x="780" y="492" font-size="11" fill="#fff" text-anchor="end" font-family="ui-monospace,monospace">UTF-8 · LF</text>
    </svg>`,
  },
  "Screenshot 2026-04-30 at 23.04.png": {
    kind: "image",
    caption: "Terminal — kubectl session",
    svgBody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#0a0a0a"/>
      <rect x="0" y="0" width="800" height="36" fill="#1a1a1a"/>
      <circle cx="18" cy="18" r="6" fill="#ff5f57"/>
      <circle cx="40" cy="18" r="6" fill="#febc2e"/>
      <circle cx="62" cy="18" r="6" fill="#28c940"/>
      <text x="400" y="22" font-size="12" fill="#9a9a9a" text-anchor="middle" font-family="ui-monospace,monospace">kwasi@Kwasis-MacBook-Pro: ~/Projects/k8s-cluster</text>
      <text x="20" y="68" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">kwasi@Kwasis-MacBook-Pro ~/Projects/k8s-cluster % kubectl get pods -n prod</text>
      <text x="20" y="90" font-size="12.5" fill="#9a9a9a" font-family="ui-monospace,monospace">NAME                          READY   STATUS    RESTARTS   AGE</text>
      <text x="20" y="110" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">api-7c4b5d8f9c-7zk9p          2/2     Running   0          14h</text>
      <text x="20" y="130" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">api-7c4b5d8f9c-h8mq2          2/2     Running   0          14h</text>
      <text x="20" y="150" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">api-7c4b5d8f9c-x42tn          2/2     Running   0          14h</text>
      <text x="20" y="170" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">worker-5fb6c9d44d-2n8vp       1/1     Running   1          3d</text>
      <text x="20" y="190" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">worker-5fb6c9d44d-mz4qr       1/1     Running   0          3d</text>
      <text x="20" y="210" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">redis-0                       1/1     Running   0          12d</text>
      <text x="20" y="230" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">postgres-0                    1/1     Running   0          12d</text>
      <text x="20" y="262" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">kwasi@Kwasis-MacBook-Pro ~/Projects/k8s-cluster % make diff</text>
      <text x="20" y="284" font-size="12.5" fill="#9a9a9a" font-family="ui-monospace,monospace">kubectl diff -k manifests/</text>
      <text x="20" y="306" font-size="12.5" fill="#3fb950" font-family="ui-monospace,monospace">+   replicas: 5</text>
      <text x="20" y="326" font-size="12.5" fill="#f85149" font-family="ui-monospace,monospace">-   replicas: 3</text>
      <text x="20" y="358" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">kwasi@Kwasis-MacBook-Pro ~/Projects/k8s-cluster % make deploy</text>
      <text x="20" y="380" font-size="12.5" fill="#9a9a9a" font-family="ui-monospace,monospace">kubectl apply -k manifests/</text>
      <text x="20" y="400" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">deployment.apps/api configured</text>
      <text x="20" y="420" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">deployment.apps/worker unchanged</text>
      <text x="20" y="450" font-size="12.5" fill="#e8e8e8" font-family="ui-monospace,monospace">kwasi@Kwasis-MacBook-Pro ~/Projects/k8s-cluster %</text>
      <rect x="430" y="438" width="8" height="14" fill="#e8e8e8"/>
    </svg>`,
  },

  // ---------------- Trash ----------------
  "old-resume-v2.pdf": {
    kind: "pdf",
    pages: [
      {
        title: "[your name] — older version",
        body: `(this is an older version of the resume kept for reference. the
current version lives in Documents/resume.pdf.)

[your previous role 1] · [your previous company 1]

## Highlights

- [a thing you shipped at this stage of your career]
- [another notable outcome]
- [a metric or scope marker]

## Stack at the time

- [tool 1]
- [tool 2]
- [tool 3]
`,
      },
    ],
  },
  "Screenshot 2025-12-14.png": {
    kind: "image",
    caption: "Old Finder window screenshot",
    svgBody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <rect width="800" height="500" fill="#1a1a1a"/>
      <rect x="40" y="30" width="720" height="440" rx="10" fill="#222"/>
      <circle cx="62" cy="52" r="6" fill="#ff5f57"/>
      <circle cx="84" cy="52" r="6" fill="#febc2e"/>
      <circle cx="106" cy="52" r="6" fill="#28c940"/>
      <text x="400" y="56" font-size="13" fill="#9a9a9a" text-anchor="middle" font-family="system-ui">Documents</text>
      <rect x="40" y="74" width="200" height="396" fill="#1d1d1d"/>
      <text x="58" y="100" font-size="12" fill="#7a7a7a" font-family="system-ui">Recents</text>
      <rect x="48" y="112" width="184" height="24" fill="#3478f6" rx="4"/>
      <text x="58" y="128" font-size="12" fill="#fff" font-family="system-ui">Documents</text>
      <text x="58" y="156" font-size="12" fill="#cfcfcf" font-family="system-ui">Downloads</text>
      <text x="58" y="180" font-size="12" fill="#cfcfcf" font-family="system-ui">Projects</text>
      <text x="58" y="204" font-size="12" fill="#cfcfcf" font-family="system-ui">Pictures</text>
      <text x="58" y="240" font-size="11" fill="#7a7a7a" font-family="system-ui">TAGS</text>
      <circle cx="58" cy="262" r="5" fill="#ff453a"/>
      <text x="74" y="266" font-size="12" fill="#cfcfcf" font-family="system-ui">Red</text>
      <circle cx="58" cy="284" r="5" fill="#ff9f0a"/>
      <text x="74" y="288" font-size="12" fill="#cfcfcf" font-family="system-ui">Orange</text>
      <circle cx="58" cy="306" r="5" fill="#30d158"/>
      <text x="74" y="310" font-size="12" fill="#cfcfcf" font-family="system-ui">Green</text>
      <rect x="240" y="74" width="520" height="32" fill="#262626"/>
      <text x="260" y="94" font-size="11" fill="#9a9a9a" font-family="system-ui">Name</text>
      <text x="600" y="94" font-size="11" fill="#9a9a9a" font-family="system-ui">Date Modified</text>
      <text x="700" y="94" font-size="11" fill="#9a9a9a" font-family="system-ui">Size</text>
      <text x="260" y="130" font-size="12" fill="#fff" font-family="system-ui">resume.pdf</text>
      <text x="600" y="130" font-size="12" fill="#aaa" font-family="system-ui">Yesterday</text>
      <text x="700" y="130" font-size="12" fill="#aaa" font-family="system-ui">847 KB</text>
      <text x="260" y="156" font-size="12" fill="#fff" font-family="system-ui">runbook.md</text>
      <text x="600" y="156" font-size="12" fill="#aaa" font-family="system-ui">3 days ago</text>
      <text x="700" y="156" font-size="12" fill="#aaa" font-family="system-ui">12 KB</text>
      <text x="260" y="182" font-size="12" fill="#fff" font-family="system-ui">incidents.md</text>
      <text x="600" y="182" font-size="12" fill="#aaa" font-family="system-ui">Last week</text>
      <text x="700" y="182" font-size="12" fill="#aaa" font-family="system-ui">23 KB</text>
    </svg>`,
  },
  "draft-blogpost.md": {
    kind: "markdown",
    body: `# why i built my site as a desktop (draft)

this got abandoned partway through. probably resurrect it later.

the basic idea: most personal sites are scrolling-document layouts.
mine is a desktop because that's how i actually live with computers.

(unfinished — pick this back up someday.)
`,
  },
  "Draft.docx": {
    kind: "markdown",
    body: `# [untitled draft]

*started: somewhere in early 2026 — not sure where this is going yet*

---

the thing about building in africa is that the infrastructure assumptions baked into most tools are wrong.

stripe assumes card penetration. twilio assumes reliable termination rates. aws latency calculators assume your users aren't in accra at 6pm when the undersea cable decides to have a moment.

so you end up building around things more than building with things. you patch. you reroute. you cache aggressively and pray.

and then — sometimes — the constraint forces something better. you're forced to design for intermittent connectivity so you build offline-first and suddenly your app works in london too, just for different reasons.

i don't know what the point of this draft is yet. maybe it becomes a substack post. maybe it stays here as a note to myself about why this is interesting.

---

*(unfinished — pick back up)*
`,
  },
  "node_modules-backup.zip": {
    kind: "binary",
    body: "node_modules-backup.zip — 186 MB archive",
  },

  // ---------------- Documents (real files) ----------------
  "Kwasi Asiedu-Mensah Curriculum Vitae.pdf": {
    kind: "pdf",
    pages: [
      {
        body: `# Kwasi Asiedu-Mensah

**DevOps Engineer · Builder · Accra, Ghana**

kwasiasiedumensah@gmail.com · linkedin.com/in/kwasi-asiedu-mensah

---

## Experience

**DevOps Engineer — Inpath Technologies** *(2024 – present)*
Cloud infrastructure, CI/CD pipelines, and platform engineering for a pan-African technology group.

**DevOps Engineer — Axon Information Systems** *(2021 – 2024)*
Designed and maintained infrastructure on AWS and Azure. Automated deployments with Terraform and Kubernetes. Improved deployment frequency by 3× and reduced incident response time.

**Coding Teacher** *(2020 – 2021)*
Designed and delivered programming curriculum to 700+ primary school students across Accra.

---

## Projects

**Omni** — Africa's customer service and commerce layer. Building the infrastructure layer that enables African businesses to manage customer interactions at scale. omnilabsghana.tech

**Centient** — Clean energy platform for the renewable energy sector in Africa.

---

## Education

**BSc Management Information Systems — Ashesi University** *(2017 – 2021)*
Graduated with honours. Ashesi Basketball Association — Coach of the Year 2022 (12-0 season record).

---

## Certifications

- AWS Certified Solutions Architect – Associate
- AWS Certified Cloud Practitioner
`,
      },
      {
        body: `## Skills

**Cloud & Infrastructure**
AWS · Azure · Google Cloud · Kubernetes · Docker · Terraform · Ansible

**Languages**
Python · TypeScript · Java · Bash

**Tools & Platforms**
GitHub Actions · Jenkins · Prometheus · Grafana · PostgreSQL · Redis

---

## Languages

English (native) · French (fluent) · Twi (native) · Fante (native) · Effutu (native) · Spanish (learning)

---

## Interests

Tennis · Swimming · Football · Basketball · Padel · Table Tennis · Chess · Cooking · Music · Film
`,
      },
    ],
  },
  "Omni_Pitch_Deck.pptx": {
    kind: "slides",
    slides: [
      {
        title: "Omni",
        subtitle: "Africa's Customer Service & Commerce Layer",
        isTitleSlide: true,
      },
      {
        title: "The Problem",
        bullets: [
          "African businesses manage customer interactions across fragmented channels — WhatsApp, Instagram, calls, walk-ins — with no unified layer",
          "Response times are slow, context is lost between channels, and teams duplicate work",
          "Existing tools (Zendesk, Intercom) are priced for Western markets and don't fit African business realities",
        ],
      },
      {
        title: "Our Solution",
        bullets: [
          "A unified inbox that aggregates WhatsApp, Instagram DMs, email, and more into one interface",
          "AI-assisted replies that learn from your business's tone and FAQs",
          "Commerce layer: accept orders, process payments, and manage inventory directly from conversations",
          "Built for teams of 1 to 100+ across Ghana, Nigeria, Kenya, and beyond",
        ],
      },
      {
        title: "Traction",
        bullets: [
          "Pilot with 12 SMEs across Accra — avg. 34% reduction in response time",
          "3 enterprise pilots in discussions (retail, logistics, fintech)",
          "Processing 2,000+ customer conversations/month across pilot cohort",
        ],
      },
      {
        title: "Business Model",
        bullets: [
          "SaaS subscription — tiered by seat count and message volume",
          "Starter: $49/mo · Growth: $149/mo · Enterprise: custom",
          "Transaction fee on commerce flows (0.8% per order processed)",
          "Target: 500 paying customers in 18 months",
        ],
      },
      {
        title: "The Team",
        bullets: [
          "Kwasi Asiedu-Mensah — Founder, DevOps & Infrastructure",
          "Background: Ashesi MIS, Axon Information Systems, Inpath Technologies",
          "Domain expertise in cloud infrastructure, AI tooling, and B2B SaaS",
        ],
      },
      {
        title: "Ask",
        subtitle: "Raising $250K pre-seed to complete product and acquire first 50 paying customers",
        isTitleSlide: true,
      },
    ],
  },
  "Centient Pitch Deck.pptx": {
    kind: "slides",
    slides: [
      {
        title: "Centient",
        subtitle: "Intelligent Infrastructure for Renewable Energy",
        isTitleSlide: true,
      },
      {
        title: "The Problem",
        bullets: [
          "Sub-Saharan Africa has 640 million people without reliable electricity",
          "Solar installations are growing fast but lack the monitoring, optimization, and financing infrastructure to scale",
          "Energy asset operators manage fleets manually — no visibility, no predictive maintenance, high downtime",
        ],
      },
      {
        title: "What Centient Does",
        bullets: [
          "IoT-connected energy asset monitoring — real-time performance, fault detection, yield forecasting",
          "AI-driven optimization engine that improves output by 12–18% on average",
          "Financing marketplace connecting energy assets to impact investors and DFIs",
        ],
      },
      {
        title: "Market Opportunity",
        bullets: [
          "$23B renewable energy market in Sub-Saharan Africa by 2030",
          "40,000+ solar mini-grid installations projected in the region by 2027",
          "No dominant platform layer exists — Centient is building the operating system for clean energy",
        ],
      },
      {
        title: "Go-to-Market",
        bullets: [
          "Target: C&I (commercial & industrial) solar operators in Ghana and Nigeria first",
          "Distribution: direct sales to EPCs (engineering, procurement, construction firms)",
          "Expansion: East Africa (Kenya, Tanzania) in Year 2",
        ],
      },
      {
        title: "Ask",
        subtitle: "Raising $400K seed to complete MVP and sign first 10 asset operators",
        isTitleSlide: true,
      },
    ],
  },
  "Centient B2B.docx": {
    kind: "markdown",
    body: `# Centient — B2B Sales Brief

## What We Do

Centient provides an intelligent monitoring and optimization platform for renewable energy asset operators in Sub-Saharan Africa. We help C&I solar operators reduce downtime, improve yield, and access structured financing.

## Target Customers

- **EPC firms** managing solar installations for commercial clients
- **Mini-grid operators** running distributed energy networks
- **Corporate sustainability teams** with owned solar assets (factories, warehouses, campuses)

## Core Offering

**Centient Monitor** — IoT-connected performance dashboard
- Real-time yield, fault alerts, weather-adjusted forecasting
- Predictive maintenance alerts, reducing unplanned downtime by up to 30%
- Multi-site portfolio view for operators managing 10+ installations

**Centient Optimize** — AI performance engine
- Dynamic MPPT tuning recommendations
- Shade and soiling loss analytics
- Average yield improvement: 12–18% in pilot cohort

**Centient Finance** — Asset financing marketplace
- Connect operators to DFI and impact investor capital
- Structured via monitored yield data — better data = better rates

## Pricing

| Tier | Sites | Price |
|------|-------|-------|
| Starter | 1–5 | $200/mo |
| Growth | 6–25 | $600/mo |
| Enterprise | 25+ | Custom |

## Why Now

Ghana's Energy Commission projects 2GW of new solar by 2027. The infrastructure to operate, optimize, and finance these assets doesn't exist at scale. Centient is building it.

---

*For commercial enquiries: kwasiasiedumensah@gmail.com*
`,
  },
  "BUSINESS PLAN - VIVRE.docx": {
    kind: "markdown",
    body: `# Vivre — Business Plan

## Executive Summary

Vivre is a premium African wellness and lifestyle brand offering curated personal care products rooted in African botanicals and traditions. Targeting the growing urban African middle class, Vivre bridges heritage ingredients with modern formulations and clean-beauty standards.

## The Opportunity

The African personal care market is projected to reach $15B by 2030. Urban Africans are increasingly seeking products formulated for their skin and hair types — with African ingredients — rather than adapting Western brands.

## Product Lines

**Vivre Body** — Body butters, oils, and scrubs featuring shea, baobab, black seed, and moringa.

**Vivre Hair** — Natural hair care system built for 4A–4C hair textures, sulphate-free, no silicones.

**Vivre Ritual** — Candles, incense, and space products inspired by West African ceremonial traditions.

## Business Model

- D2C via website and Instagram Shop (primary)
- Retail partnerships with premium supermarkets and lifestyle stores in Accra, Lagos, and Nairobi
- Gift sets and corporate wellness gifting (B2B revenue stream)

## Go-to-Market

Launch with Vivre Body (3 SKUs). Build community via Instagram and Substack before retail push. Target first 1,000 customers in 6 months via pre-order.

## Financial Projections

| Year | Revenue | Units Sold |
|------|---------|-----------|
| 1 | GH₵ 180,000 | 3,200 |
| 2 | GH₵ 620,000 | 10,500 |
| 3 | GH₵ 1.4M | 24,000 |

## Funding Ask

Raising GH₵ 120,000 (seed) to fund initial production run, branding, and 6 months of marketing.
`,
  },
  "AEC VENTURE GRANT WORKPLAN - VIVRE.xlsx": {
    kind: "binary",
    body: "AEC VENTURE GRANT WORKPLAN - VIVRE.xlsx — Excel spreadsheet · 18 KB",
  },
  "Code of Conduct_Inpath Technologies.pdf": {
    kind: "binary",
    body: "Code of Conduct_Inpath Technologies.pdf — PDF · 105 KB",
  },
  "AWS Certified Solutions Architect - Associate certificate.pdf": {
    kind: "pdf",
    pages: [
      {
        body: `## AWS Certified Solutions Architect – Associate

**Certificate of Achievement**

This is to certify that

### Kwasi Asiedu-Mensah

has successfully demonstrated knowledge and skills in the field of cloud computing and has earned the following certification:

**AWS Certified Solutions Architect – Associate**

Issued by Amazon Web Services Training and Certification

---

This certification validates the ability to effectively demonstrate knowledge of how to architect and deploy secure and robust applications on AWS technologies, define a solution using architectural design principles, and provide implementation guidance based on best practices to the organisation.

**Level:** Associate
**Domain:** Cloud Architecture
`,
      },
    ],
  },
  "AWS Certified Cloud Practitioner.pdf": {
    kind: "pdf",
    pages: [
      {
        body: `## AWS Certified Cloud Practitioner

**Certificate of Achievement**

This is to certify that

### Kwasi Asiedu-Mensah

has successfully demonstrated foundational knowledge of AWS Cloud services and infrastructure and has earned the following certification:

**AWS Certified Cloud Practitioner**

Issued by Amazon Web Services Training and Certification

---

This certification validates overall understanding of the AWS Cloud — independent of a specific technical role. It confirms knowledge of core AWS services, key AWS architectural principles, the AWS shared responsibility model, security best practices, AWS billing, and pricing models.

**Level:** Foundational
**Domain:** Cloud Fundamentals
`,
      },
    ],
  },

  // ---------------- Downloads (books & docs) ----------------
  "Atomic Habits.pdf": {
    kind: "binary",
    body: "Atomic Habits — James Clear · PDF · 5.8 MB",
  },
  "Manly P Hall - Self Unfoldment.pdf": {
    kind: "binary",
    body: "Self Unfoldment by Disciplines of Realization — Manly P. Hall · PDF · 3.2 MB",
  },
  "Games People Play - Eric Berne.epub": {
    kind: "binary",
    body: "Games People Play — Eric Berne · EPUB · 268 KB",
  },
  "Feeling is the Secret - Neville Goddard.pdf": {
    kind: "binary",
    body: "Feeling is the Secret — Neville Goddard · PDF · 54 KB",
  },
  "Akan Witchcraft and the Concept of Exorcism.pdf": {
    kind: "binary",
    body: "Akan Witchcraft and the Concept of Exorcism · Academic PDF · 438 KB",
  },
  "Prompt Engineering Guide.pdf": {
    kind: "binary",
    body: "Prompt Engineering Guide · PDF · 219 KB",
  },
  "Anatomy Trains - Myofascial Meridians.pdf": {
    kind: "binary",
    body: "Anatomy Trains: Myofascial Meridians for Manual Therapists and Movement Professionals — Thomas W. Myers · PDF · 412 KB",
  },
  "TCP.zip": {
    kind: "binary",
    body: "TCP.zip — archive · 18 MB",
  },

  // ---------------- Desktop ----------------
  "Screenshot 2026-05-06 at 11.40.png": {
    kind: "image",
    caption: "Desktop — full view",
    svgBody: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f0c29"/>
          <stop offset="50%" stop-color="#302b63"/>
          <stop offset="100%" stop-color="#24243e"/>
        </linearGradient>
      </defs>
      <rect width="1280" height="800" fill="url(#bg)"/>
      <rect x="0" y="0" width="1280" height="28" fill="rgba(0,0,0,0.3)"/>
      <text x="16" y="18" font-size="13" fill="white" font-family="system-ui" font-weight="600">kwasi.dev</text>
      <text x="1240" y="18" font-size="13" fill="white" font-family="system-ui" text-anchor="end">9:41 AM</text>
      <rect x="80" y="80" width="900" height="580" rx="12" fill="#1a1a1a" opacity="0.95"/>
      <rect x="80" y="80" width="900" height="34" rx="12" fill="#2a2a2a"/>
      <circle cx="103" cy="97" r="6" fill="#ff5f57"/>
      <circle cx="123" cy="97" r="6" fill="#febc2e"/>
      <circle cx="143" cy="97" r="6" fill="#28c840"/>
      <text x="530" y="101" font-size="12" fill="#aaa" text-anchor="middle" font-family="system-ui">notes</text>
      <rect x="80" y="114" width="220" height="546" fill="#f5f5f5" opacity="0.04"/>
      <text x="100" y="150" font-size="12" fill="#fff" font-family="system-ui" opacity="0.5">about me</text>
      <text x="100" y="175" font-size="12" fill="#fff" font-family="system-ui" opacity="0.4">reading list</text>
      <text x="100" y="200" font-size="12" fill="#fff" font-family="system-ui" opacity="0.4">films &amp; stuff</text>
      <text x="100" y="225" font-size="12" fill="#fff" font-family="system-ui" opacity="0.4">on repeat</text>
      <rect x="300" y="114" width="680" height="546" fill="transparent"/>
      <text x="490" y="200" font-size="32" fill="#fff" font-family="system-ui" font-weight="300" opacity="0.9">about me</text>
      <text x="490" y="240" font-size="14" fill="#aaa" font-family="system-ui">devops engineer · building omni and centient</text>
      <rect x="0" y="755" width="1280" height="45" fill="rgba(255,255,255,0.12)" rx="0"/>
      <circle cx="580" cy="777" r="22" fill="rgba(255,255,255,0.15)"/>
      <circle cx="640" cy="777" r="22" fill="rgba(255,255,255,0.15)"/>
      <circle cx="700" cy="777" r="22" fill="rgba(255,255,255,0.15)"/>
    </svg>`,
  },
  "server.py": {
    kind: "code",
    language: "python",
    body: `from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="omni-api", version="0.4.2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    version: str
    env: Optional[str] = None


@app.get("/health", response_model=HealthResponse)
async def health():
    return {
        "status": "ok",
        "version": "0.4.2",
        "env": os.getenv("ENV", "development"),
    }


@app.get("/")
async def root():
    return {"message": "omni api — running"}


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"{request.method} {request.url.path}")
    response = await call_next(request)
    return response


if __name__ == "__main__":
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV") == "development",
    )
`,
  },

  // ---------------- Projects/omni ----------------
  "docker-compose.yml": {
    kind: "code",
    language: "yaml",
    body: `version: "3.9"

services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      ENV: development
      DATABASE_URL: postgresql://postgres:postgres@db:5432/omni
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: dev-secret-change-in-prod
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    volumes:
      - ./api:/app

  worker:
    build:
      context: ./api
    command: celery -A tasks worker --loglevel=info
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/omni
      REDIS_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: omni
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
`,
  },
};

export function getFileContent(name: string): FileContent | null {
  return FILE_CONTENTS[name] ?? null;
}
