# AGENTS.md

macOS-style desktop website. Next.js 14 (app router), React, TypeScript, Tailwind. No backend — everything is client-side, persisted to `localStorage` / `sessionStorage`.

## how to work in this repo

1. read `docs/design-system.md` before touching any UI — colors, sidebar layout, window chrome, lowercase rules.
2. always start at `lib/app-config.ts` when adding or modifying an app. it's the single source of truth.
3. use `Z` constants from `lib/z-index.ts` — never inline `z-[NNNN]` Tailwind utilities.
4. there is no test framework. the only gate is `npm run build` and a visual pass in `npm run dev`.

## key files

| path | purpose |
|------|---------|
| `lib/app-config.ts` | app registry — every app defined here (icon, label, default window, dock + Applications visibility) |
| `lib/use-windows.ts` | window state machine (open/close/focus/minimize/drag/resize). Persisted to `localStorage`. |
| `lib/z-index.ts` | named z-index layers. Use these, not magic numbers. |
| `lib/sidebar-persistence.ts` | per-window view state (`useSessionState`, `clearAppState`). Closing a window auto-clears. |
| `lib/use-click-outside.ts` | dismiss-on-outside-click + Escape hook. Use it for menus and popovers. |
| `lib/wallpaper.tsx` | wallpaper id + palette + image lookup |
| `lib/theme.tsx` | light/dark theme provider |
| `lib/system-state.tsx` | battery, wifi, bluetooth, brightness, volume, focus, airdrop, network name |
| `lib/settings-router.tsx` | which pane Settings is showing |
| `lib/screen-state.tsx` | sleep / restart / lock / shutdown overlays |
| `lib/notes-store.tsx`, `lib/notes-data.ts` | owner notes (bundled) + user notes (localStorage) |
| `lib/recents.tsx` | recent file opens, drives Finder Recents |
| `lib/file-contents.ts`, `lib/file-preview.tsx` | content registry for previewable files + which one is open |
| `components/Desktop.tsx` | top-level shell — renders all windows, menubar, dock, screen overlay |
| `components/Window.tsx` | window chrome (drag, resize, traffic lights) |
| `components/Menubar.tsx`, `MenubarStatus.tsx` | top bar — apple menu, app menu, status menus, clock |
| `components/Dock.tsx`, `DockIcon.tsx` | bottom dock with magnification |
| `components/icons/DockIcons.tsx` | every app's icon. Each prefers `/public/icons/<name>.png`, falls back to inline SVG |
| `components/apps/` | each app (Finder, Notes, Settings, Terminal, Preview) |
| `app/globals.css` | CSS variables for both themes + scrollbar styling |

## conventions

- **state persistence**
  - `localStorage` for durable preferences: theme, wallpaper, window layout, notes content, system state, recents. Survives reloads and tabs.
  - `sessionStorage` via `useSessionState(appId, key, defaultValue)` for per-window view state (sidebar selection, breadcrumbs, search query). Survives minimize. Closing a window calls `clearAppState(id)` automatically and wipes it.
  - never persist transient UI state (selected row, hover, focus) — let it reset on remount.

- **window management** — `useWindows()` is called once at the top of `Desktop.tsx`. It returns `open`, `close`, `minimize`, `bringToFront`, `update`, `toggleFullscreen`, `activeId`. Pass callbacks down rather than re-calling the hook in deeper components.

- **app registry** — every app is exactly one entry in `APPS` (`lib/app-config.ts`). Adding a new app means editing this file, adding to `DOCK_LAYOUT` / `WINDOW_RENDER_ORDER`, building the component, and adding one render branch in `Desktop.tsx`. Do not add app-aware lookups elsewhere — extend the registry helpers (`getApp`, `appByLabel`, `applicationsList`).

- **z-index** — use the named layers in `lib/z-index.ts`. Never inline `z-[1234]`. Layers: `windowFloor`, `dock`, `menubar`, `popoverBackdrop`, `popover`, `screenOverlay`.

- **menus and popovers** — for triggers inside a known container, use `useClickOutside(ref, onDismiss, { enabled, ignoreSelector })`. For modal-style menus that take over the screen, use a full-screen invisible backdrop div at `Z.popoverBackdrop` and the panel at `Z.popover`.

- **lowercase ui** — visible text is lowercase. Exceptions: placeholder proper nouns (`[your name]`), file extensions in chrome (`PDF`, `MD`), the apple logo (it's a glyph), and copyrighted brand strings inside content (e.g. song titles already typeset as stylized).

- **icons** — dock and Finder /Applications/ both pull from `components/icons/DockIcons.tsx`. Each icon renders `/public/icons/<name>.png` if present, otherwise an inline SVG fallback. To swap an icon: drop a PNG at the matching path.

- **placeholder content** — anything personal that hasn't been filled in uses the `[your X]` pattern. Do not invent details.

## adding a new app — checklist

1. write the component at `components/apps/MyApp.tsx` (`"use client"` + a default export).
2. add an icon component to `components/icons/DockIcons.tsx` using the same `IconWithFallback` pattern as the others. (Optionally drop a PNG at `/public/icons/myapp.png`.)
3. register in `lib/app-config.ts`:
   - add `"myapp"` to the `WindowId` union
   - add an entry to the `APPS` map
   - add to `WINDOW_ID_ORDER` and `WINDOW_RENDER_ORDER`
   - add to `DOCK_LAYOUT` if `showOnDock: true`
4. add a render branch in `components/Desktop.tsx`:
   ```tsx
   {id === "myapp" && <MyApp />}
   ```
5. if the app needs view state to survive minimize, use `useSessionState("myapp", key, default)` instead of `useState`.
6. visual smoke test: dock icon shows + tooltip; menubar shows the right label when active; opens from dock; appears in Finder /Applications/ with the right icon; double-clicking it from there opens it; minimize-then-reopen preserves view state; close-then-reopen resets it.

## file structure

```
app/
  layout.tsx           # global providers (theme, wallpaper, system, screen, notes, file preview, recents)
  page.tsx             # renders <Desktop />
  globals.css          # CSS variables for both themes
  icon.svg             # favicon (traffic-light dots)

components/
  Desktop.tsx          # top-level shell
  Window.tsx           # draggable, resizable window chrome
  Menubar.tsx          # top bar (apple, active app, file menu, status, clock)
  MenubarStatus.tsx    # battery / wifi / control center popovers
  Dock.tsx             # bottom dock
  DockIcon.tsx         # individual dock icon (magnifies on hover)
  ScreenOverlay.tsx    # sleep / restart / shutdown overlays
  LockScreen.tsx       # lock screen (date, time, avatar)
  icons/DockIcons.tsx  # every app icon
  apps/
    Finder.tsx
    Notes.tsx, NotesSidebar.tsx, NotesPreview.tsx, NotesEditor.tsx
    Terminal.tsx
    Settings.tsx
    Preview.tsx

lib/
  app-config.ts            # app registry
  use-windows.ts           # window state machine
  z-index.ts               # named z layers
  sidebar-persistence.ts   # session state per app
  use-click-outside.ts     # dismiss hook
  wallpaper.tsx            # wallpaper id + lookup
  theme.tsx                # light/dark theme
  system-state.tsx         # battery, wifi, etc.
  settings-router.tsx      # Settings pane state
  screen-state.tsx         # sleep/lock/etc.
  notes-store.tsx          # notes (owner + user)
  notes-data.ts            # bundled note content
  recents.tsx              # recent file opens
  file-contents.ts         # content for previewable files
  file-preview.tsx         # which file is open in Preview

public/
  wallpapers/   # drop wallpaper image, named after wallpaper id (e.g. tahoe.jpg)
  icons/        # drop dock icon pngs, named after app id (e.g. notes.png)
  music/        # (planned) drop mp3 files here
  music/art/    # (planned) cover art pngs, same basename as the mp3
```

## living docs — update when you ship

| file | update when |
|------|-------------|
| `AGENTS.md` (this file) | new conventions emerge or a key file's purpose changes |
| `docs/design-system.md` | new tokens, sidebar variants, or window-chrome rules |
| `lib/app-config.ts` | adding/removing/reshaping any app |
