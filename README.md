# kwasi.dev

a macOS desktop running in the browser. no backend, no database — everything is client-side.

## what it is

a personal website built as a full macOS desktop simulator. draggable and resizable windows, a dock, a menubar, wallpapers, and a set of functional apps — all in the browser. window layout persists across refreshes. light and dark mode follows system preference.

## apps

| app | description |
|-----|-------------|
| notes | personal notes — owner notes (read-only) + user notes stored in localStorage |
| finder | file browser with sidebar, icon and list views, recents |
| terminal | simulated shell with a real filesystem tree and ~20 commands |
| settings | 15+ panes — display, wallpaper, wifi, sound, accessibility |
| preview | opens PDFs, markdown, code, and images |
| music | full player with playlists, albums, artists, real audio playback |
| weather | live data from open-meteo, animated scenes, city search |

## stack

- [next.js 14](https://nextjs.org) — app router, fully static
- [typescript](https://www.typescriptlang.org)
- [tailwind css](https://tailwindcss.com)
- [framer motion](https://www.framer.com/motion)

## running locally

```bash
npm install
npm run dev
```

open [localhost:3000](http://localhost:3000).

## build

```bash
npm run build
```

no test framework — the build is the correctness gate.

## customizing

all personal content lives in `lib/notes-data.ts`. edit the notes there to make it yours. the app registry in `lib/app-config.ts` controls what appears in the dock and finder.

## inspired by

[alanagoyal.com](https://github.com/alanagoyal/alanagoyal) — icons and some architectural patterns.

## license

mit
