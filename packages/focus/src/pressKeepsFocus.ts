import { onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { makeEventListener } from "@solid-primitives/event-listener";
import { isTextEntry } from "./textEntry.ts";

export interface PressKeepsFocusOptions {
  /** Set to `false` to temporarily disable the behavior. Read when a press happens. @default true */
  enabled?: MaybeAccessor<boolean>;
  /**
   * Additional opt-out. Return `true` for pressed targets that should keep the default
   * behavior (and therefore take the focus). Text inputs, textareas, selects and
   * `contenteditable` hosts are always opted out.
   */
  ignore?: (target: Element) => boolean;
  /**
   * Only prevent the focus change while some element holds the focus (i.e. `document.activeElement`
   * is not `<body>`). When nothing is focused the press behaves natively. @default true
   */
  onlyWhenFocused?: boolean;
}

const isBodyLike = (el: Element | null): boolean =>
  !el || el === el.ownerDocument.body || el === el.ownerDocument.documentElement;

/**
 * Makes pressing non-text controls inside `element` not steal focus from the currently focused
 * element (for example toolbar buttons keeping a rich text editor focused). `pointerdown` and
 * `mousedown` default actions are prevented; `click` is unaffected and still fires.
 *
 * Text inputs, textareas, selects, `contenteditable` hosts and anything matched by
 * `options.ignore` keep the native behavior.
 *
 * @param element Container (or single control) whose presses should keep focus.
 * @returns A function removing the listeners (also called on owner cleanup).
 *
 * @example
 * ```ts
 * const clear = makePressKeepsFocus(toolbarEl);
 * ```
 */
export function makePressKeepsFocus(
  element: HTMLElement,
  options: PressKeepsFocusOptions = {},
): VoidFunction {
  if (isServer) return () => {};

  const handler = (event: Event): void => {
    if (event.defaultPrevented) return;
    if (access(options.enabled) === false) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (isTextEntry(target)) return;
    if (options.ignore?.(target)) return;
    if ((options.onlyWhenFocused ?? true) && isBodyLike(element.ownerDocument.activeElement)) {
      return;
    }
    event.preventDefault();
  };

  const clearPointer = makeEventListener(element, "pointerdown", handler);
  const clearMouse = makeEventListener(element, "mousedown", handler);
  return () => {
    clearPointer();
    clearMouse();
  };
}

/**
 * Ref callback factory version of {@link makePressKeepsFocus}. Create it in the component body
 * (so the listeners are cleaned up with the owner) and pass it to `ref`. Works with several
 * elements: each one gets its own listeners.
 *
 * @example
 * ```tsx
 * <div role="toolbar" ref={createPressKeepsFocus()}>
 *   <button onClick={bold}>B</button>
 * </div>
 * ```
 */
export function createPressKeepsFocus(
  options: PressKeepsFocusOptions = {},
): (element: HTMLElement) => void {
  if (isServer) return () => {};

  const clears = new Set<VoidFunction>();
  onCleanup(() => {
    clears.forEach(clear => clear());
    clears.clear();
  });

  return (element: HTMLElement): void => {
    clears.add(makePressKeepsFocus(element, options));
  };
}
