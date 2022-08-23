import { Accessor, createEffect } from "solid-js";
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
 * Set selected {@link cursor} to {@link target} styles.
 *
 * @param target
 * @param cursor
 */
export function createElementCursor(
  target: Accessor<HTMLElement | FalsyValue> | HTMLElement,
  cursor: MaybeAccessor<CursorProperty>
): void {
  createEffect<{ el: HTMLElement | FalsyValue; cursor: CursorProperty }>(
    prev => {
      const el = access(target);
      const cursorValue = access(cursor);
      if (prev.el === el && prev.cursor === cursorValue) return prev;
      if (prev.el) prev.el.style.cursor = prev.cursor;
      if (el) {
        const newPrevCursor = el.style.cursor;
        el.style.cursor = cursorValue;
        return { el, cursor: newPrevCursor };
      }
      return { el, cursor: "" };
    },
    { el: undefined, cursor: "" }
  );
}

export function createBodyCursor(cursor: Accessor<CursorProperty | FalsyValue>): void {
  let overwritten: string;
  createEffect((prev: CursorProperty | FalsyValue) => {
    const cursorValue = cursor();
    if (prev === cursorValue) return prev;
    if (cursorValue) {
      overwritten = document.body.style.cursor;
      document.body.style.cursor = cursorValue;
    } else {
      document.body.style.cursor = overwritten;
    }
    return cursorValue;
  });
}
