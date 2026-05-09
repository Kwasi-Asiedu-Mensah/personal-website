# Dock icons

Each app's dock icon is loaded from `/icons/<app-id>.png` if present, falling
back to the inline SVG in `components/icons/DockIcons.tsx`. App ids are the
same ones used in `lib/app-config.ts` (`finder`, `notes`, `settings`,
`terminal`, `preview`, `music`, `trash`, etc.).

Icon canvas convention: **512×512 PNG with transparent padding** so the
visible icon shape sits in roughly the central 80%. This matches macOS
icon export conventions and keeps every dock icon visually the same size.

To swap any icon, drop a new PNG with the same filename and refresh
(browsers cache favicons / icon images aggressively — hard refresh with
Cmd+Shift+R if needed).

## Attribution

The 512×512 icon PNGs in this folder originate from
[alanagoyal.com](https://github.com/alanagoyal/alanagoyal) (MIT licensed).
They depict macOS app icons; usage here mirrors the personal-site
macOS-clone context.
