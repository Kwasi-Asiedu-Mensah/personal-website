# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build — the only correctness gate
npm run lint     # ESLint
```

No test framework. Validate changes with `npm run build` + a visual pass in `npm run dev`.

## What this is

A personal website that renders a full macOS desktop in the browser. No pages, no routing — the entire viewport is a living desktop with draggable/resizable windows, a dock, menubar, wallpapers, and fully functional apps. Built with Next.js 14 (App Router), TypeScript, Tailwind, and Framer Motion. No backend — everything is client-side, persisted to `localStorage` / `sessionStorage`.

**See `AGENTS.md` for detailed conventions, the adding-a-new-app checklist, and the key-files table.**

## High-level architecture

### Providers → Desktop → Windows → Apps

`app/layout.tsx` wraps the entire app in 9 context providers (theme, wallpaper, system state, screen overlays, notes store, file preview, recents, audio player, app navigation). `app/page.tsx` renders a single `<Desktop />` which owns all window state and renders every app component.

### App registry (`lib/app-config.ts`)

Single source of truth for every app: id, label, icon, default window size/position, dock visibility, Applications folder visibility. `WINDOW_RENDER_ORDER` controls DOM stacking order. Extend this file — don't add app-aware logic elsewhere.

### Window management (`lib/use-windows.ts` + `components/Window.tsx`)

`useWindows()` is called once in `Desktop.tsx`; callbacks are passed down. Each window has position, size, z-index, open/minimized/fullscreen state — all persisted to `localStorage`. `Window.tsx` handles dragging (manual `mousedown/mousemove/mouseup`, not a library), 8-directional resizing, traffic light buttons, and `bringToFront`. Minimum window size: 420×320.

### Z-index layers (`lib/z-index.ts`)

Named constants: `windowFloor`, `dock`, `menubar`, `popoverBackdrop`, `popover`, `screenOverlay`. Never use inline `z-[NNNN]` Tailwind utilities.

### State persistence

- `localStorage` — durable preferences: theme, wallpaper, window layout, notes, system state, recents
- `sessionStorage` via `useSessionState(appId, key, default)` — per-window view state (sidebar selection, breadcrumbs). Auto-cleared when a window closes via `clearAppState(id)`.

### Cross-app navigation (`lib/app-navigation.tsx`)

Components fire navigation requests (e.g., clicking a song in Notes opens Music at that playlist). `Desktop.tsx` listens and calls the appropriate window open/focus + in-app routing.

## Implemented apps

| App | File | Status |
|-----|------|--------|
| Finder | `components/apps/Finder.tsx` | Full (file browser, sidebar, icon/list views, recents) |
| Notes | `components/apps/Notes.tsx` + siblings | Full (3-col, editor, localStorage sync) |
| Settings | `components/apps/Settings.tsx` | Full (15+ panes) |
| Terminal | `components/apps/Terminal.tsx` | Full (simulated filesystem) |
| Preview | `components/apps/Preview.tsx` | Full (images, PDFs, text, JSON) |
| Music | `components/apps/Music.tsx` | Full (playlists, albums, artists, playback) |
| Messages | `components/apps/Messages.tsx` | **Stub — returns null** |
| Photos | `components/apps/Photos.tsx` | **Stub — returns null** |

## Design conventions

- All visible text is lowercase. Exceptions: file extensions in chrome (`PDF`, `MD`), brand strings inside content, proper nouns in placeholders.
- Unfilled personal content uses `[your X]` placeholders — do not invent details.
- Icons: `components/icons/DockIcons.tsx` uses `IconWithFallback` — prefers `/public/icons/<name>.png`, falls back to inline SVG. Drop a PNG to swap an icon.
- Read `docs/design-system.md` before touching UI — it documents color tokens, sidebar layout, and window chrome rules.
