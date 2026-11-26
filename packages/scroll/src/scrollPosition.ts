import { type Accessor, createEffect, createRenderEffect, createSignal, onSettled } from "solid-js";
import { sharedConfig } from "solid-js/internal";
import { isServer } from "@solidjs/web";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createDerivedStaticStore } from "@solid-primitives/static-store";

export function getScrollParent(node: Element | undefined): Element {
  if (isServer) {
    return {} as Element;
  }
  while (node && !isScrollable(node)) {
    node = node.parentElement ?? undefined;
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
    return FALLBACK_SCROLL_POSITION;
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

export type ScrollPositionOptions = {
  /**
   * Opt-in throttling of scroll updates.
   * - `false` (default): every `scroll` event is delivered immediately.
   * - `"raf"`: events are coalesced to at most one update per animation frame. The frame reads
   *   the position at the time it fires, so the final settled position is always delivered.
   */
  throttle?: "raf" | false;
};

/**
 * Non-reactive scroll listener. Calls {@link callback} with the current position on `scroll` events
 * of {@link target}, optionally coalesced to one call per animation frame.
 * @returns a cleanup function removing the listener and cancelling any pending frame.
 * @example
 * const stop = makeScrollPositionListener(el, ({ x, y }) => console.log(x, y), { throttle: "raf" });
 */
export function makeScrollPositionListener(
  target: Element | Window,
  callback: (position: Position) => void,
  options: ScrollPositionOptions = {},
): VoidFunction {
  if (isServer) return () => {};
  let frame: number | undefined;
  const run = () => {
    frame = undefined;
    callback(getScrollPosition(target));
  };
  const handler =
    options.throttle === "raf"
      ? () => {
          frame ??= requestAnimationFrame(run);
        }
      : run;
  target.addEventListener("scroll", handler, { passive: true });
  return () => {
    target.removeEventListener("scroll", handler);
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
}

/**
 * Reactive primitive providing a store-like object with current scroll position of specified target.
 * @param target element/window to listen to scroll events. can be a reactive singal.
 * @param options `{ throttle: "raf" }` coalesces updates to one per animation frame.
 * @returns a store-like reactive object `{ x: number, y: number }` of current scroll position of {@link target}
 * @example
 * // target will be window by default
 * const windowScroll = createScrollPosition();
 *
 * // returned object is a reactive store-like structure
 * createEffect(
 *   () => [windowScroll.x, windowScroll.y], // => number[]
 *   ([x, y]) => console.log(x, y),
 * );
 */
export function createScrollPosition(
  target?: Accessor<Element | Window | undefined> | Element | Window,
  options: ScrollPositionOptions = {},
): Readonly<Position> {
  // Reactive primitives must be created on both server and client to keep Solid 2.0
  // hydration child IDs consistent — all component scopes are transparent and share
  // the root counter. DOM operations are guarded inside the apply phases.
  if (!isServer) {
    target = target || window;
  }

  const isFn = typeof target === "function";
  const isHydrating = sharedConfig.hydrating;

  const getPos = (): Position =>
    isServer
      ? { ...FALLBACK_SCROLL_POSITION }
      : getScrollPosition(
          isFn
            ? (target as Accessor<Element | Window | undefined>)()
            : (target as Element | Window),
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

  const listen = (el: Element | Window) => makeScrollPositionListener(el, trigger, options);

  // Refs aren't populated until mount; also refreshes position post-hydration.
  if (!isServer && (isHydrating || isFn)) onSettled(trigger);

  // Use createEffect/createRenderEffect directly instead of createEventListener so
  // an effect node is always created (consuming a child ID) on both server and client.
  // createEventListener returns early on server, which would cause a child ID mismatch.
  if (isFn) {
    const fnTarget = target as Accessor<Element | Window | undefined>;
    createEffect(
      () => fnTarget(),
      el => {
        if (isServer || !el) return;
        return listen(el);
      },
    );
  } else {
    const elTarget = target as Element | Window | undefined;
    createRenderEffect(
      () => elTarget,
      el => {
        if (isServer || !el) return;
        return listen(el);
      },
    );
  }

  return pos;
}

/**
 * Returns a reactive object with current window scroll position.
 *
 * This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive.
 *
 * @example
 * const scroll = useWindowScrollPosition();
 * createEffect(
 *   () => [scroll.x, scroll.y],
 *   ([x, y]) => console.log(x, y),
 * );
 */
export const useWindowScrollPosition: ReturnType<typeof createHydratableSingletonRoot> =
  /*#__PURE__*/ createHydratableSingletonRoot(() =>
    createScrollPosition(isServer ? () => undefined : window),
  );

/**
 * Like {@link useWindowScrollPosition}, but updates are coalesced to one per animation frame.
 * Singleton root: shared between dependents.
 */
export const useWindowScrollPositionRaf: ReturnType<typeof createHydratableSingletonRoot> =
  /*#__PURE__*/ createHydratableSingletonRoot(() =>
    createScrollPosition(isServer ? () => undefined : window, { throttle: "raf" }),
  );
