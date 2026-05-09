# Design System

dark-themed macOS desktop. minimal, lowercase, system-font. read this before touching any UI.

## colors

CSS variables in `app/globals.css`. Two themes: light (default in markup) and dark via `[data-theme="dark"]` on `<html>`. Use them via `style={{ background: "var(--token)" }}` or Tailwind's `bg-[var(--token)]`. Avoid hex values inside components.

| token | dark | light | use |
|-------|------|-------|-----|
| `--window-bg` | `#1a1a1a` | `#fafafa` | window background |
| `--window-text` | `#fafafa` | `#1a1a1a` | primary text |
| `--window-text-soft` | `rgba(255,255,255,0.85)` | `#404040` | secondary text |
| `--window-text-muted` | `rgba(255,255,255,0.55)` | `rgba(0,0,0,0.5)` | metadata, captions |
| `--window-text-faint` | `rgba(255,255,255,0.35)` | `rgba(0,0,0,0.35)` | placeholders, disabled |
| `--window-border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.08)` | window outline |
| `--window-divider` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.06)` | row dividers, sidebar separator |
| `--row-hover` | `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.04)` | row hover |
| `--row-active` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.07)` | selected row |
| `--titlebar-bg` | `#2a2a2a` | `rgba(245,245,245,0.92)` | window title bar |
| `--searchbar-bg` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.04)` | search inputs, sidebar bg |
| `--searchbar-border` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` | search border |
| `--section-label` | `rgba(255,255,255,0.45)` | `rgba(0,0,0,0.5)` | uppercase section labels |
| `--link` | `#ffcc33` | `#e08a14` | inline links |
| `--link-hover` | `#ffe066` | `#b66808` | inline link hover |
| `--note-selected-bg` | `rgba(255,199,50,0.55)` | `rgba(255,199,50,0.55)` | selected note in Notes sidebar |
| `--dock-bg` | `rgba(20,20,20,0.55)` | `rgba(255,255,255,0.28)` | dock pill |
| `--dock-border` | `rgba(255,255,255,0.12)` | `rgba(255,255,255,0.4)` | dock outline |
| `--dock-divider` | `rgba(255,255,255,0.1)` | `rgba(255,255,255,0.25)` | dock vertical separator |
| `--shadow-window` | `0 30px 80px rgba(0,0,0,0.6)` | `0 30px 80px rgba(0,0,0,0.45)` | window drop shadow |

Brand accents (used sparingly, hard-coded):
- `#3478f6` — Finder selection blue
- `#ff5f57` / `#febc2e` / `#28c940` — traffic lights (red close / yellow minimize / green fullscreen)
- `#34c759` — toggle "on" green, hotspot icon
- `#0a84ff` — links/active state inside Settings, Bluetooth/WiFi pills
- `#a855f7` — Focus mode purple

## typography

System font only — no Google Fonts:

```
-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, "Segoe UI", Roboto, sans-serif
```

Monospace for terminals, code, and tabular text:

```
"SF Mono", "JetBrains Mono", "Menlo", ui-monospace, monospace
```

Body letter-spacing: `-0.005em`. Heading letter-spacing: `-0.01em` to `-0.02em`.

Common sizes:
- `11px` — chrome metadata, section labels (uppercase)
- `12px` — sublabels, captions
- `13px` — body, sidebar items, menubar text
- `14–15px` — note editor, paragraphs
- `20–28px` — page titles in Settings
- `150px` — lock screen clock

## window chrome

Every app sits inside `components/Window.tsx`:

- `34px` title bar
- traffic lights at top-left: 12×12px circles, 8px gap, leftmost at `12px` from left edge
- minimum size `420×320` (also enforced during resize)
- `12px` border radius (collapses to `0` when fullscreen)
- 1px border `var(--window-border)` + drop shadow `var(--shadow-window)`
- `title` prop optional; only Preview uses it (renders the file name)

The active window has subtly stronger chrome — opacity differences are handled via `isActive`.

## sidebar pattern

Used by Finder, Notes, Settings.

- width: `200px` (Notes uses `304px` to fit the date column)
- background: `var(--searchbar-bg)`
- right border: `1px solid var(--window-divider)`
- vertical padding: `py-2`, items in a `space-y-0.5` flex column
- item: `px-2 py-1.5 rounded-md`, `13px` font, gap of 8 between icon and label
- selected item: `rgba(120,120,128,0.20)` background, label color `#0a84ff` in Finder, brand-specific elsewhere
- section header: `10–11px` uppercase, `var(--section-label)` color, `tracking-wide`
- icons inside the row: 16×16, `shrink-0`, line-style with `currentColor`

## empty states

Centered vertically. Two-line pattern:

- 13px primary message in `var(--window-text)`
- 12px supporting line at 70% opacity in `var(--window-text-muted)`

Examples in the wild: Finder ("Folder is empty"), Preview ("No file open"), Recents (empty initial state).

## lowercase

All visible UI text is lowercase. Exceptions:

- placeholder proper nouns inside content (`[your name]`, `[your company]`)
- file extensions shown in chrome (`PDF`, `MD`, `JSON`)
- the apple logo glyph
- copyrighted/brand strings inside content (song titles, artist names that are stylized in upstream)

Code, terminal output, file paths stay as-typed.

## sphere / orb pattern

Circular elements with a radial gradient and inset shadow. Used by:

- wallpaper picker orbs in Settings → Appearance
- macOS row in Settings → About (current wallpaper as a sphere)
- lock screen avatar (gradient `K`)
- sidebar `Personal Hotspot` and `Wi-Fi` circles in WiFi popover
- traffic lights (simpler — no gradient)

Recipe:

```css
border-radius: 9999px;
box-shadow:
  inset -2px -2px 5px rgba(0,0,0,0.35),
  0 1px 2px rgba(0,0,0,0.2);
background: radial-gradient(circle at 32% 28%, ..., #color-stops);
```

The wallpaper picker's spheres consume `wallpaper.sphere` (a CSS background string from `lib/wallpaper.tsx`).

## icons

Two visual styles:

- **dock icons** — square `64×64` viewBox, rounded corners (radius 13), gradient fill, white glyph. Defined in `components/icons/DockIcons.tsx` via the `IconWithFallback` wrapper: prefers `/public/icons/<id>.png`, falls back to inline SVG.
- **inline glyphs** — line-style, 14–16px, `currentColor` stroke. Used in menubar status, sidebar rows, traffic-light replacement, etc. Defined inline next to where they're used. Do not promote to a shared file unless reused 3+ times.

To replace a dock icon, drop a transparent PNG at `/public/icons/<id>.png` named after the WindowId (e.g. `finder.png`). No code changes needed.

## traffic lights

Top-left corner of every window:

- red `#ff5f57` — close
- yellow `#febc2e` — minimize
- green `#28c940` — fullscreen

12×12px circles, 8px gap. Hover: `brightness-110`. Active: `brightness-90`.

## state persistence

| storage | key | content |
|---------|-----|---------|
| `localStorage` | `macos-desktop-windows-v6` | window position, size, open/min/fullscreen, z-order |
| `localStorage` | `macos-desktop-wallpaper` | active wallpaper id |
| `localStorage` | `macos-desktop-theme` | `light` or `dark` |
| `localStorage` | `macos-desktop-system-state` | battery %, wifi/bluetooth on, brightness, volume, focus, airdrop, network name |
| `localStorage` | `macos-desktop-user-notes-v1` | user-created notes |
| `localStorage` | `macos-desktop-owner-pin-overrides-v1` | per-note pin overrides |
| `localStorage` | `macos-desktop-recents-v1` | recently-opened files (last 20) |
| `sessionStorage` | `app:<appId>:<key>` | per-window view state. Auto-cleared when window closes. |

## animation conventions

- window drag/resize: no transition, real-time
- window close/open: no transition (instant) — chrome would feel laggy
- dock magnification: framer-motion via `useMotionValue` on mouse x
- popover open/close: no transition; backdrop appears instantly
- brightness slider: `transition: filter 0.15s linear` on `<html>`
- background changes: `transition-[background] duration-500` on the desktop root

## tailwind variants

Two custom variants registered in `tailwind.config.ts`:

- `can-hover:` — wraps in `@media (any-hover: hover) and (any-pointer: fine)`. Apply to any `:hover` style that should only fire on real pointer devices. Prevents sticky hover states on mobile/trackpad tap.
- `desktop:` — scopes to `[data-shell='desktop'] &`. The root `<Desktop />` div carries `data-shell="desktop"`, so this variant activates for everything inside it.

Canonical pattern: `desktop:can-hover:group-hover:opacity-100` — reveal an element only when a real pointer hovers inside the desktop shell (used for traffic light icons, dock tooltips, etc.).

## accent colors

Each app has an `accentColor: string` field in `lib/app-config.ts`. Read it via `getApp(id).accentColor`. Use sparingly — for active indicators, selection highlights, or app-branded elements. Do not use as the window background color.

| app | color |
|-----|-------|
| finder | `#007AFF` |
| notes | `#FFCC00` |
| terminal | `#00D455` |
| settings | `#8E8E93` |
| preview | `#007AFF` |
| music | `#FA2D48` |

When adding a new app, include its `accentColor` in the registry entry.

## see also

- `AGENTS.md` — collaboration conventions and the new-app checklist
- `lib/app-config.ts` — registered apps
- `lib/z-index.ts` — layer constants
