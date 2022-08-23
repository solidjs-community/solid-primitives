import { Accessor, createEffect, onCleanup } from "solid-js";
import { access, FalsyValue, MaybeAccessor } from "@solid-primitives/utils";

export type CursorProperty =
  | "-moz-grab"
  | "-webkit-grab"
  | "alias"
  | "all-scroll"
  | "auto"
  | "cell"
  | "col-resize"
  | "context-menu"
  | "copy"
  | "crosshair"
  | "default"
  | "e-resize"
  | "ew-resize"
  | "grab"
  | "grabbing"
  | "help"
  | "move"
  | "n-resize"
  | "ne-resize"
  | "nesw-resize"
  | "no-drop"
  | "none"
  | "not-allowed"
  | "ns-resize"
  | "nw-resize"
  | "nwse-resize"
  | "pointer"
  | "progress"
  | "row-resize"
  | "s-resize"
  | "se-resize"
  | "sw-resize"
  | "text"
  | "vertical-text"
  | "w-resize"
  | "wait"
  | "zoom-in"
  | "zoom-out"
  | (string & {});

/**
 * Set selected {@link cursor} to {@link target} styles reactively.
 *
 * @param target HTMLElement or a reactive signal returning one. Returning falsy value will unset the cursor.
 * @param cursor Cursor css property. E.g. "pointer", "grab", "zoom-in", "wait", etc.
 *
 * @example
 * ```ts
 * import { createElementCursor } from "@solid-primitives/cursor";
 *
 * const target = document.querySelector("#element");
 * const [cursor, setCursor] = createSignal("pointer");
 * const [enabled, setEnabled] = createSignal(true);
 *
 * createElementCursor(() => enabled() && target, cursor);
 *
 * setCursor("help");
 * ```
 */
export function createElementCursor(
  target: Accessor<HTMLElement | FalsyValue> | HTMLElement,
  cursor: MaybeAccessor<CursorProperty>
): void {
  createEffect(() => {
    const el = access(target);
    const cursorValue = access(cursor);
    if (!el) return;
    const overwritten = el.style.cursor;
    el.style.cursor = cursorValue;
    onCleanup(() => (el.style.cursor = overwritten));
  });
}

/**
 * Set selected {@link cursor} to body element styles reactively.
 *
 * @param cursor Signal returing a cursor css property. E.g. "pointer", "grab", "zoom-in", "wait", etc. Returning falsy value will unset the cursor.
 *
 * @example
 * ```ts
 * import { createBodyCursor } from "@solid-primitives/cursor";
 *
 * const [cursor, setCursor] = createSignal("pointer");
 * const [enabled, setEnabled] = createSignal(true);
 *
 * createBodyCursor(() => enabled() && cursor());
 *
 * setCursor("help");
 * ```
 */
export function createBodyCursor(cursor: Accessor<CursorProperty | FalsyValue>): void {
  createEffect(() => {
    const cursorValue = cursor();
    if (!cursorValue) return;
    const overwritten = document.body.style.cursor;
    document.body.style.cursor = cursorValue;
    onCleanup(() => (document.body.style.cursor = overwritten));
  });
}
