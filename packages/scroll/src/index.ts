import { createEventListener } from "@solid-primitives/event-listener";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createDerivedStaticStore } from "@solid-primitives/static-store";
import { type Accessor, createSignal, onSettled, sharedConfig } from "solid-js";
import { isServer } from "@solidjs/web";

export function getScrollParent(node: Element | null): Element {
  if (isServer) {
    return {} as Element;
  }
  while (node && !isScrollable(node)) {
    node = node.parentElement;
  }

  return node || document.scrollingElement || document.documentElement;
}

export function isScrollable(node: Element): boolean {
  if (isServer) {
    return false;
  }
  const style = window.getComputedStyle(node);
  return /(auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY);
}

export type Position = {
  x: number;
  y: number;
};

const FALLBACK_SCROLL_POSITION = { x: 0, y: 0 } as const satisfies Position;

/**
 * Get an `{ x: number, y: number }` object of element/window scroll position.
 */
export function getScrollPosition(target: Element | Window | undefined): Position {
  if (isServer || !target) {
    return { ...FALLBACK_SCROLL_POSITION };
  }
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
export function createScrollPosition(
  target?: Accessor<Element | Window | undefined> | Element | Window,
): Readonly<Position> {
  if (isServer) {
    return FALLBACK_SCROLL_POSITION;
  }

  target = target || window;

  const isFn = typeof target === "function";
  const isHydrating = sharedConfig.hydrating;

  const getPos = (): Position =>
    getScrollPosition(
      isFn ? (target as Accessor<Element | Window | undefined>)() : (target as Element | Window),
    );

  // Plain integer counter — avoids Solid 2.0 createSignal(fn) derived-signal semantics.
  // ownedWrite allows writes from DOM event handlers inside reactive scopes.
  let tick = 1;
  const [version, setVersion] = createSignal(0, { ownedWrite: true });
  const trigger = () => void setVersion(tick++);

  const pos = createDerivedStaticStore<Position>(() => {
    const v = version();
    return isHydrating && v === 0 ? { ...FALLBACK_SCROLL_POSITION } : getPos();
  });

  // Refs aren't populated until mount; also refreshes position post-hydration.
  if (isHydrating || isFn) onSettled(trigger);

  createEventListener(target, "scroll", trigger, { passive: true });

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
  createScrollPosition(isServer ? () => undefined : window),
);
