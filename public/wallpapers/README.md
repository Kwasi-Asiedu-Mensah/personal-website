# macOS Wallpapers

Drop your wallpaper image files in this folder, named after the wallpaper id.

## Filenames the dock looks for

The wallpaper app probes these in order (first hit wins):

```
/wallpapers/{id}.jpg
/wallpapers/{id}.jpeg
/wallpapers/{id}.png
/wallpapers/{id}.heic
```

## IDs (must match exactly, lowercase)

- `leopard.jpg`        — Leopard 10.5
- `snow-leopard.jpg`   — Snow Leopard 10.6
- `lion.jpg`           — Lion 10.7
- `mountain-lion.jpg`  — Mountain Lion 10.8
- `mavericks.jpg`      — Mavericks 10.9
- `yosemite.jpg`       — Yosemite 10.10
- `el-capitan.jpg`     — El Capitan 10.11
- `sierra.jpg`         — Sierra 10.12
- `mojave.jpg`         — Mojave 10.14
- `sonoma.jpg`         — Sonoma 14.0
- `sequoia.jpg`        — Sequoia 15.0
- `tahoe.jpg`          — Tahoe 26.0

## Behavior

- Drop only the wallpapers you want. Anything missing falls back to a CSS gradient.
- The same image is used for both the **picker orb** in Settings → Appearance (cropped to a circle) and the full **desktop background**.
- 1920×1200 or 2560×1600 JPGs are ideal. Bigger is fine; it gets `object-fit: cover`'d.
- Refresh the browser after dropping new files in (Next.js reads `/public` at startup).
