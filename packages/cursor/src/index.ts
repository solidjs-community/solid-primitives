import { type Accessor, createEffect, createSignal } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, noop, type FalsyValue, type MaybeAccessor } from "@solid-primitives/utils";

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
 * Set selected {@link cursor} to body element styles immediately.
 *
 * Returns a cleanup function that restores the previous cursor.
 *
 * @param cursor Cursor css property. E.g. "pointer", "grab", "zoom-in", "wait", etc.
 *
 * @example
 * ```ts
 * const restore = makeBodyCursor("wait");
 * // ... async operation ...
 * restore();
 * ```
 */
export function makeBodyCursor(cursor: CursorProperty): VoidFunction {
  if (isServer) return noop;
  return makeElementCursor(document.body, cursor);
}

/**
 * Set selected {@link cursor} to {@link target} element styles immediately.
 *
 * Returns a cleanup function that restores the previous cursor.
 *
 * @param target HTMLElement to set the cursor on.
 * @param cursor Cursor css property. E.g. "pointer", "grab", "zoom-in", "wait", etc.
 *
 * @example
 * ```ts
 * const restore = makeElementCursor(el, "wait");
 * // ... async operation ...
 * restore();
 * ```
 */
export function makeElementCursor(target: HTMLElement, cursor: CursorProperty): VoidFunction {
  if (isServer) return noop;
  const overwritten = target.style.cursor;
  target.style.setProperty("cursor", cursor, "important");
  return () => (target.style.cursor = overwritten);
}

/**
 * Set selected {@link cursor} to {@link target} styles reactively.
 *
 * @param target HTMLElement or a reactive signal returning one. Returning falsy value will unset the cursor.
 * @param cursor Cursor css property. E.g. "pointer", "grab", "zoom-in", "wait", etc.
 *
 * @example
 * ```ts
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
  cursor: MaybeAccessor<CursorProperty>,
): void {
  if (isServer) return;

  type State = { el: HTMLElement | FalsyValue; cursorValue: CursorProperty };

  const compute = (): State => ({
    el: access(target),
    cursorValue: access(cursor),
  });

  const apply = ({ el, cursorValue }: State) => {
    if (!el) return;
    const overwritten = el.style.cursor;
    el.style.setProperty("cursor", cursorValue, "important");
    return () => (el.style.cursor = overwritten);
  };

  createEffect(compute, apply);
}

/**
 * Set selected {@link cursor} to body element styles reactively.
 *
 * @param cursor Signal returing a cursor css property. E.g. "pointer", "grab", "zoom-in", "wait", etc. Returning falsy value will unset the cursor.
 *
 * @example
 * ```ts
 * const [cursor, setCursor] = createSignal("pointer");
 * const [enabled, setEnabled] = createSignal(true);
 *
 * createBodyCursor(() => enabled() && cursor());
 *
 * setCursor("help");
 * ```
 */
export function createBodyCursor(cursor: Accessor<CursorProperty | FalsyValue>): void {
  if (isServer) return;

  createEffect(cursor, cursorValue => {
    if (!cursorValue) return;
    const overwritten = document.body.style.cursor;
    document.body.style.setProperty("cursor", cursorValue, "important");
    return () => (document.body.style.cursor = overwritten);
  });
}

/**
 * Reactively sets "grab" cursor on {@link target} and switches to "grabbing" on the body during drag.
 *
 * Setting "grabbing" on the body ensures the cursor renders correctly everywhere during drag,
 * not just over the target element.
 *
 * @param target HTMLElement or a reactive signal returning one. Returning falsy value will disable the cursor.
 * @param options Optional overrides for the grab and grabbing cursor values.
 *
 * @example
 * ```ts
 * const [ref, setRef] = createSignal<HTMLElement>();
 *
 * createDragCursor(ref);
 *
 * <div ref={setRef}>Drag me</div>
 * ```
 */
export function createDragCursor(
  target: Accessor<HTMLElement | FalsyValue> | HTMLElement,
  options?: { grab?: CursorProperty; grabbing?: CursorProperty },
): void {
  if (isServer) return;

  const grab = options?.grab ?? "grab";
  const grabbing = options?.grabbing ?? "grabbing";
  const [dragging, setDragging] = createSignal(false);

  // During drag, "grabbing" is set on body so it shows globally.
  // "grab" is cleared from the element so the body cursor can inherit through —
  // element inline styles (even without !important) would otherwise win over body.
  createBodyCursor(() => dragging() && grabbing);
  createElementCursor(() => {
    const el = access(target);
    return dragging() ? false : el;
  }, grab);

  createEffect(
    () => access(target),
    el => {
      if (!el) return;
      const onDown = () => setDragging(true);
      const onUp = () => setDragging(false);
      el.addEventListener("pointerdown", onDown);
      document.addEventListener("pointerup", onUp);
      document.addEventListener("pointercancel", onUp);
      return () => {
        el.removeEventListener("pointerdown", onDown);
        document.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointercancel", onUp);
      };
    },
  );
}

/**
 * Returns a ref callback that sets a cursor on the element it is attached to.
 *
 * Accepts a static cursor value or a reactive signal. The cursor is removed when the
 * component unmounts.
 *
 * @example
 * ```tsx
 * // static
 * <div ref={cursorRef("pointer")}>...</div>
 *
 * // reactive
 * const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
 * <div ref={cursorRef(cursor)}>...</div>
 * ```
 */
export function cursorRef(cursor: MaybeAccessor<CursorProperty>): (el: HTMLElement) => void {
  return el => createElementCursor(el, cursor);
}
