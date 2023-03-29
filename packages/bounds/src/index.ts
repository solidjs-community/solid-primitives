import { makeEventListener } from "@solid-primitives/event-listener";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import { createDerivedStaticStore } from "@solid-primitives/static-store";
import { access, FalsyValue } from "@solid-primitives/utils";
import { Accessor, createSignal, onCleanup, onMount, sharedConfig } from "solid-js";
import { isServer } from "solid-js/web";

export type Bounds = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

export type NullableBounds = Record<keyof Bounds, number | null>;

export type UpdateGuard = <Args extends unknown[]>(
  update: (...args: Args) => void,
) => (...args: Args) => void;

export type Options = {
  trackScroll?: boolean | UpdateGuard;
  trackMutation?: boolean | UpdateGuard;
  trackResize?: boolean | UpdateGuard;
};

const NULLED_BOUNDS = {
  top: null,
  left: null,
  bottom: null,
  right: null,
  width: null,
  height: null,
} as const;

/**
 * @returns object of element's boundingClientRect with enumerable properties
 */
export function getElementBounds(element: Element): Bounds;
export function getElementBounds(element: Element | FalsyValue): NullableBounds;
export function getElementBounds(element: Element | FalsyValue): NullableBounds {
  if (isServer || !element) {
    return { ...NULLED_BOUNDS };
  }
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Creates a reactive store-like object of current element bounds — position on the screen, and size dimensions. Bounds will be automatically updated on scroll, resize events and updates to the dom.
 *
 * @param target Element for calculating bounds. Can be a reactive signal. Set to falsy value to disable tracking.
 * @param options Choose which events should be tracked *(All are enabled by default)*
 * - `options.trackScroll` — listen to window scroll events
 * - `options.trackMutation` — listen to changes to the dom structure/styles
 * - `options.trackResize` — listen to element's resize events
 * @returns reactive object of {@link target} bounds
 * @example
 * ```ts
 * const target = document.querySelector("#my_elem")!;
 * const bounds = createElementBounds(target);
 *
 * createEffect(() => {
 *    console.log(
 *      bounds.width, // => number
 *      bounds.height, // => number
 *      bounds.top, // => number
 *      bounds.left, // => number
 *      bounds.right, // => number
 *      bounds.bottom, // => number
 *    );
 * });
 * ```
 */

export function createElementBounds(
  target: Accessor<Element | FalsyValue> | Element,
  { trackMutation = true, trackResize = true, trackScroll = true }: Options = {},
): Readonly<NullableBounds> {
  if (isServer) {
    return NULLED_BOUNDS;
  }

  const isFn = typeof target === "function",
    [track, trigger] = createSignal(void 0, { equals: false }) as [() => void, () => void];

  let calc: () => NullableBounds;
  // during hydration we need to make sure the initial state is the same as the server
  if (sharedConfig.context) {
    calc = () => NULLED_BOUNDS;
    onMount(() => {
      calc = () => getElementBounds(access(target));
      trigger();
    });
  }
  // a function target might be a jsx ref, so it may not be reactive - retrigger manually on mount
  else if (isFn) {
    calc = () => getElementBounds(target());
    onMount(trigger);
  }
  // otherwise we can just use the target directly - it will never change
  else calc = () => getElementBounds(target);

  const bounds = createDerivedStaticStore(() => (track(), calc()));

  if (trackResize) {
    createResizeObserver(
      isFn ? () => target() || [] : target,
      typeof trackResize === "function" ? trackResize(trigger) : trigger,
    );
  }

  if (trackScroll) {
    const scrollHandler = isFn
      ? (e: Event) => {
          const el = target();
          el && e.target instanceof Node && e.target.contains(el) && trigger();
        }
      : (e: Event) => e.target instanceof Node && e.target.contains(target) && trigger();

    makeEventListener(
      window,
      "scroll",
      typeof trackScroll === "function" ? trackScroll(scrollHandler) : scrollHandler,
      { capture: true },
    );
  }

  if (trackMutation) {
    const mo = new MutationObserver(
      typeof trackMutation === "function" ? trackMutation(trigger) : trigger,
    );
    mo.observe(document.body, {
      attributeFilter: ["style", "class"],
      subtree: true,
      childList: true,
    });
    onCleanup(() => mo.disconnect());
  }

  return bounds;
}
