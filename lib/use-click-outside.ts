"use client";

import { useEffect, type RefObject } from "react";

type ClickOutsideOptions = {
  /** When false, the listener is detached. Useful for gating by `open` state. */
  enabled?: boolean;
  /** Also dismiss on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /**
   * Optional CSS selector. If a click target lives inside an element matching
   * this selector (via `closest()`), the dismissal is suppressed. Use this
   * when a popover spawns child elements outside its ref's DOM subtree (e.g.
   * portaled menus tagged with a data attribute).
   */
  ignoreSelector?: string;
};

/**
 * Dismiss-on-outside-click + Escape hook.
 *
 * Pass one ref or several — clicks inside any of them count as "inside" and
 * don't trigger dismissal. Pass `ignoreSelector: "[data-popover]"` (or
 * similar) to keep popover content alive when its DOM lives outside the ref.
 *
 * Used by status menus, context menus, and any future dropdown that needs to
 * close when the user clicks elsewhere.
 *
 * @example
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   useClickOutside(containerRef, () => setOpen(false), { enabled: open });
 */
export function useClickOutside(
  refs:
    | RefObject<HTMLElement | null>
    | RefObject<HTMLElement | null>[],
  onOutside: () => void,
  options: ClickOutsideOptions = {}
) {
  const { enabled = true, closeOnEscape = true, ignoreSelector } = options;

  useEffect(() => {
    if (!enabled) return;

    const refList = Array.isArray(refs) ? refs : [refs];

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;

      // Inside any of the tracked refs?
      for (const ref of refList) {
        if (ref.current && ref.current.contains(target)) return;
      }

      // Click inside an element matching the ignore selector? (e.g. portaled
      // popover content marked with a data attribute.)
      if (ignoreSelector) {
        const el = target as HTMLElement;
        if (el.closest && el.closest(ignoreSelector)) return;
      }

      onOutside();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") onOutside();
    };

    document.addEventListener("mousedown", onMouseDown);
    if (closeOnEscape) document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
    // refs is a ref — its identity is stable. Reading from `refs` directly
    // each call avoids subtle bugs around stale closures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, closeOnEscape, ignoreSelector, onOutside]);
}
