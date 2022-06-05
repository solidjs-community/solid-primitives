import { Accessor, createComputed, on, onCleanup, onMount } from "solid-js";
import { access, createStaticStore } from "@solid-primitives/utils";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import { makeEventListener } from "@solid-primitives/event-listener";

export type Bounds = {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

export type NullableBounds =
  | Bounds
  | {
      top: null;
      left: null;
      bottom: null;
      right: null;
      width: null;
      height: null;
    };

/**
 * @returns object of element's boundingClientRect with enumerable properties
 */
export function getElementBounds(element: Element): Bounds;
export function getElementBounds(element: Element | undefined | null | false): NullableBounds;
export function getElementBounds(element: Element | undefined | null | false): NullableBounds {
  if (!element)
    return {
      top: null,
      left: null,
      bottom: null,
      right: null,
      width: null,
      height: null
    };
  return clientRectToBounds(element.getBoundingClientRect());
}

function clientRectToBounds(rect: {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}): Bounds {
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height
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
 * const bounds = createElementBounds(document.querySelector("#my_elem")!);
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
  options?: {
    trackScroll?: boolean;
    trackMutation?: boolean;
    trackResize?: boolean;
  }
): Readonly<Bounds>;
export function createElementBounds(
  target: Accessor<Element | undefined | null | false> | Element,
  options?: {
    trackScroll?: boolean;
    trackMutation?: boolean;
    trackResize?: boolean;
  }
): Readonly<NullableBounds>;
export function createElementBounds(
  target: Accessor<Element | undefined | null | false> | Element,
  {
    trackMutation = true,
    trackResize = true,
    trackScroll = true
  }: {
    trackScroll?: boolean;
    trackMutation?: boolean;
    trackResize?: boolean;
  } = {}
): Readonly<NullableBounds> {
  const [bounds, setBounds] = createStaticStore(getElementBounds(access(target)));
  const updateBounds = () => setBounds(getElementBounds(access(target)));
  const updateBoundsOf = (el: Element | undefined | null | false) =>
    setBounds(getElementBounds(el));

  if (typeof target === "function") {
    onMount(() => updateBoundsOf(target()));
    createComputed(on(target, updateBoundsOf, { defer: true }));
  }

  if (trackResize)
    createResizeObserver(typeof target === "function" ? () => target() || [] : target, (_, el) =>
      updateBoundsOf(el)
    );

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
    makeEventListener(window, "scroll", scrollHandler, { capture: true });
  }

  if (trackMutation) {
    const mo = new MutationObserver(updateBounds);
    mo.observe(document.body, {
      attributeFilter: ["style", "class"],
      subtree: true,
      childList: true
    });
    onCleanup(mo.disconnect.bind(mo));
  }

  return bounds;
}
