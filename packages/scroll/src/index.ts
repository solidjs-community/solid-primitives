import { createComputed, onMount, sharedConfig } from "solid-js";
import { createStaticStore, MaybeAccessor } from "@solid-primitives/utils";
import { createEventListener } from "@solid-primitives/event-listener";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";

export function getScrollParent(node: Element | null): Element {
  if (process.env.SSR) {
    return {} as Element;
  }
  while (node && !isScrollable(node)) {
    node = node.parentElement;
  }

  return node || document.scrollingElement || document.documentElement;
}

export function isScrollable(node: Element): boolean {
  if (process.env.SSR) {
    return false;
  }
  const style = window.getComputedStyle(node);
  return /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);
}

const SERVER_SCROLL_POSITION = { x: 0, y: 0 } as const;
const NULL_SCROLL_POSITION = { x: null, y: null } as const;

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
  if (process.env.SSR) {
    return { ...SERVER_SCROLL_POSITION };
  }
  if (!target) return { ...NULL_SCROLL_POSITION };
  if (target instanceof Window)
    return {
      x: target.scrollX,
      y: target.scrollY,
    };
  return {
    x: target.scrollLeft,
    y: target.scrollTop,
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
  target: MaybeAccessor<Element | Window | undefined> = window,
): {
  readonly x: number | null;
  readonly y: number | null;
} {
  if (process.env.SSR) {
    return SERVER_SCROLL_POSITION;
  }

  const isFn = typeof target === "function";

  const getTargetPos = isFn ? () => getScrollPosition(target()) : () => getScrollPosition(target);
  const updatePos = () => setPos(getTargetPos());

  const [pos, setPos] = createStaticStore(
    isFn || sharedConfig.context ? NULL_SCROLL_POSITION : getTargetPos(),
  );

  if (sharedConfig.context) {
    onMount(isFn ? () => createComputed(updatePos) : updatePos);
  } else if (isFn) {
    createComputed(updatePos);
    onMount(updatePos);
  } else {
    updatePos();
  }

  createEventListener(target, "scroll", updatePos);

  return pos;
}

/**
 * Returns a reactive object with current window scroll position.
 *
 * This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive.
 *
 * @example
 * const scroll = useWindowScrollPosition();
 * createEffect(() => {
 *   console.log(scroll.x, scroll.y)
 * })
 */
export const useWindowScrollPosition = /*#__PURE__*/ createHydratableSingletonRoot(() =>
  createScrollPosition(window),
);
