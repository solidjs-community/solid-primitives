import { Accessor, createComputed, on, onCleanup, onMount } from "solid-js";
import { access, createStaticStore } from "@solid-primitives/utils";
import { createResizeObserver, ResizeHandler } from "@solid-primitives/resize-observer";
import { makeEventListener } from "@solid-primitives/event-listener";

export type Bounds = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

export type NullableBounds = Bounds | typeof NULLED_BOUNDS;

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
export function getElementBounds(element: Element | undefined | null | false): NullableBounds;
export function getElementBounds(element: Element | undefined | null | false): NullableBounds {
  if (process.env.SSR || !element) {
    return Object.assign({}, NULLED_BOUNDS);
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
  target: Accessor<Element> | Element,
  options?: Options,
): Readonly<Bounds>;
export function createElementBounds(
  target: Accessor<Element | undefined | null | false> | Element,
  options?: Options,
): Readonly<NullableBounds>;
export function createElementBounds(
  target: Accessor<Element | undefined | null | false> | Element,
  { trackMutation = true, trackResize = true, trackScroll = true }: Options = {},
): Readonly<NullableBounds> {
  if (process.env.SSR) {
    return Object.assign({}, NULLED_BOUNDS);
  }

  const [bounds, setBounds] = createStaticStore(getElementBounds(access(target)));
  const updateBounds = () => setBounds(getElementBounds(access(target)));
  const updateBoundsOf = (el: Element | undefined | null | false) =>
    setBounds(getElementBounds(el));

  if (typeof target === "function") {
    onMount(() => updateBoundsOf(target()));
    createComputed(on(target, updateBoundsOf, { defer: true }));
  }

  if (trackResize) {
    const resizeHandler: ResizeHandler = (_, el) => updateBoundsOf(el);
    createResizeObserver(
      typeof target === "function" ? () => target() || [] : target,
      typeof trackResize === "function" ? trackResize(resizeHandler) : resizeHandler,
    );
  }

  if (trackScroll) {
    const scrollHandler =
      typeof target === "function"
        ? (e: Event) => {
            const el = target();
            if (el && e.target instanceof Node && e.target.contains(el)) updateBoundsOf(el);
          }
        : (e: Event) => {
            if (e.target instanceof Node && e.target.contains(target)) updateBoundsOf(target);
          };
    makeEventListener(
      window,
      "scroll",
      typeof trackScroll === "function" ? trackScroll(scrollHandler) : scrollHandler,
      { capture: true },
    );
  }

  if (trackMutation) {
    const mo = new MutationObserver(
      typeof trackMutation === "function" ? trackMutation(updateBounds) : updateBounds,
    );
    mo.observe(document.body, {
      attributeFilter: ["style", "class"],
      subtree: true,
      childList: true,
    });
    onCleanup(mo.disconnect.bind(mo));
  }

  return bounds;
}
