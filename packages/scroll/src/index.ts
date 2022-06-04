import { access, createStaticStore, MaybeAccessor } from "@solid-primitives/utils";
import { createEventListener } from "@solid-primitives/event-listener";
import { createComputed, on, onMount } from "solid-js";

/**
 * Get an `{ x: number, y: number }` object of element/window scroll position.
 */
export function getScrollPosition(target: Element | Window): {
  x: number;
  y: number;
};
export function getScrollPosition(target: Element | Window | undefined): {
  x: number | null;
  y: number | null;
};
export function getScrollPosition(target: Element | Window | undefined): {
  x: number | null;
  y: number | null;
} {
  if (!target) return { x: null, y: null };
  if (target instanceof Window)
    return {
      x: target.scrollX,
      y: target.scrollY
    };
  return {
    x: target.scrollLeft,
    y: target.scrollTop
  };
}

/**
 * Reactive primitive providing a store-like object with current scroll position of specified target.
 * @param target element/window to listen to scroll events. can be a reactive singal.
 * @returns a store-like reactive object `{ x: number, y: number }` of current scroll position of {@link target}
 * @example
 * // target will be window by default
 * const windowScroll = createScrollPosition();
 *
 * createEffect(() => {
 *   // returned object is a reactive store-like structure
 *   windowScroll.x; // => number
 *   windowScroll.y; // => number
 * });
 */
export function createScrollPosition(target?: MaybeAccessor<Window>): {
  readonly x: number;
  readonly y: number;
};
export function createScrollPosition(target: MaybeAccessor<Element | Window>): {
  readonly x: number;
  readonly y: number;
};
export function createScrollPosition(target: MaybeAccessor<Element | Window | undefined>): {
  readonly x: number | null;
  readonly y: number | null;
};
export function createScrollPosition(
  target: MaybeAccessor<Element | Window | undefined> = window
): {
  readonly x: number | null;
  readonly y: number | null;
} {
  const [pos, setPos] = createStaticStore(getScrollPosition(access(target)));
  const updatePos = () => setPos(getScrollPosition(access(target)));
  if (typeof target === "function") {
    createComputed(on(target, ref => setPos(getScrollPosition(ref)), { defer: true }));
    onMount(updatePos);
  }
  createEventListener(target, "scroll", updatePos);
  return pos;
}
