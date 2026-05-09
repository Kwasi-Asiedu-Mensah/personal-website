/**
 * Centralized z-index layers for the desktop environment.
 *
 * Why this file: z-index magic numbers were previously sprinkled across
 * components (`z-[1000]`, `z-[1999]`, `z-[2001]`, `z-[3000]`). New work was
 * picking values by guessing what was already in the file it was editing,
 * which is exactly how layers start to silently overlap.
 *
 * Layering rules:
 *   1. Application windows live BELOW the dock and menu bar. Their z values
 *      are dynamic (assigned by `useWindows`) and grow as windows are
 *      focused. They sit in the [1, ~999] range under normal use.
 *   2. The dock and menu bar always cover stacked windows.
 *   3. Popovers (Apple menu, status menus, context menus) cover the dock
 *      and menu bar so the menu can extend beyond its trigger.
 *   4. Full-screen overlays (lock screen, sleep/restart/shutdown) sit on
 *      top of everything else.
 *
 * Use these constants instead of inline `z-[NNNN]` Tailwind utilities.
 * Inline values via `style={{ zIndex: Z.dock }}` is the canonical pattern;
 * Tailwind's `z-[var(--z-dock)]` would also be fine but adds a layer of
 * indirection.
 */
export const Z = {
  /** Floor for application windows. Their actual z values are dynamic. */
  windowFloor: 1,
  /** Dock at the bottom of the screen. */
  dock: 1000,
  /** Menu bar at the top of the screen. */
  menubar: 1000,
  /** Backdrop layer for popovers/menus — captures clicks outside. */
  popoverBackdrop: 1999,
  /** Popovers and dropdown menus themselves. */
  popover: 2001,
  /** Full-screen overlays: lock screen, sleep, restart, shutdown. */
  screenOverlay: 3000,
} as const;

export type ZLayer = keyof typeof Z;
