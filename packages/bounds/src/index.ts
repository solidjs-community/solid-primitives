import { Accessor, createComputed, on, onCleanup, onMount } from "solid-js";
import { access, createStaticStore } from "@solid-primitives/utils";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import { makeEventListener } from "@solid-primitives/event-listener";

export interface Bounds {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

/**
 * @returns object of element's boundingClientRect with enumerable properties
 */
export function getElementBounds(element: Element | undefined | null | false):
  | {
      top: number;
      left: number;
      bottom: number;
      right: number;
      width: number;
      height: number;
    }
  | {
      top: null;
      left: null;
      bottom: null;
      right: null;
      width: null;
      height: null;
    } {
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
}): {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
} {
  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height
  };
}

export function createElementBounds(
  target: Accessor<Element | undefined | null | false> | Element,
  options: {
    trackScroll?: boolean;
    trackMutation?: boolean;
    trackResize?: boolean;
  } = {}
):
  | {
      readonly top: number;
      readonly left: number;
      readonly bottom: number;
      readonly right: number;
      readonly width: number;
      readonly height: number;
    }
  | {
      readonly top: null;
      readonly left: null;
      readonly bottom: null;
      readonly right: null;
      readonly width: null;
      readonly height: null;
    } {
  const { trackMutation = true, trackResize = true, trackScroll = true } = options;

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
