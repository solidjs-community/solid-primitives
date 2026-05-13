/**!
 * Part of this code is adapted from solid-prevent-scroll by Jasmin Noetzli (GiyoMoon),
 * part of the corvu project. Adapted for Solid 2.0 and solid-primitives conventions.
 * MIT License, Copyright (c) Jasmin Noetzli
 *
 * https://github.com/corvudev/corvu/tree/main/packages/solid-prevent-scroll
 *
 * Part of this code is inspired by react-remove-scroll.
 * MIT License, Copyright (c) Anton Korzunov
 * https://github.com/theKashey/react-remove-scroll
 */

import { createEffect, createSignal } from "solid-js";
import { isServer } from "@solidjs/web";
import { contains, INTERNAL_OPTIONS, access, type MaybeAccessor } from "@solid-primitives/utils";

type Axis = "x" | "y";

export type CreatePreventScrollProps = {
  /** Element that is allowed to scroll. Wheel/touch events inside it are passed through. *Default = `null`* */
  element?: MaybeAccessor<HTMLElement | null>;
  /** Whether scroll prevention is active. *Default = `true`* */
  enabled?: MaybeAccessor<boolean>;
  /** Hide the `<body>` scrollbar while active. *Default = `true`* */
  hideScrollbar?: MaybeAccessor<boolean>;
  /** Add padding/margin to `<body>` to compensate for the hidden scrollbar. *Default = `true`* */
  preventScrollbarShift?: MaybeAccessor<boolean>;
  /** Whether to use `padding` or `margin` for the scrollbar shift compensation. *Default = `"padding"`* */
  preventScrollbarShiftMode?: MaybeAccessor<"padding" | "margin">;
  /** Restore `<body>` scroll position via `window.scrollTo` when disabled to avoid layout shift. *Default = `true`* */
  restoreScrollPosition?: MaybeAccessor<boolean>;
  /** Allow two-finger pinch-zoom gestures. *Default = `false`* */
  allowPinchZoom?: MaybeAccessor<boolean>;
};

// ─── Module-level stack ───────────────────────────────────────────────────────
// Tracks active instances; only the topmost one installs wheel/touch handlers.

const [preventScrollStack, setPreventScrollStack] = createSignal<string[]>([], INTERNAL_OPTIONS);

const isActive = (id: string): boolean => {
  const stack = preventScrollStack();
  return stack.length > 0 && stack[stack.length - 1] === id;
};

// ─── Body style tracker ───────────────────────────────────────────────────────
// Multiple nested instances share a key; the original styles are only restored
// once the last instance cleans up.

type ActiveStyle = {
  activeCount: number;
  originalStyles: Partial<CSSStyleDeclaration>;
  properties: string[];
};

const activeBodyStyles = new Map<string, ActiveStyle>();

function applyBodyStyle(
  key: string,
  element: HTMLElement,
  style: Partial<CSSStyleDeclaration>,
  properties: { key: string; value: string }[],
): () => void {
  const originalStyles: Partial<CSSStyleDeclaration> = {};
  for (const k in style) {
    originalStyles[k] = element.style[k as keyof CSSStyleDeclaration] as string;
  }

  const existing = activeBodyStyles.get(key);
  if (existing) {
    existing.activeCount++;
  } else {
    activeBodyStyles.set(key, {
      activeCount: 1,
      originalStyles,
      properties: properties.map(p => p.key),
    });
  }

  Object.assign(element.style, style);
  for (const prop of properties) {
    element.style.setProperty(prop.key, prop.value);
  }

  return () => {
    const active = activeBodyStyles.get(key);
    if (!active) return;
    if (active.activeCount !== 1) {
      active.activeCount--;
      return;
    }
    activeBodyStyles.delete(key);

    for (const [k, v] of Object.entries(active.originalStyles)) {
      (element.style as any)[k] = v;
    }
    for (const prop of active.properties) {
      element.style.removeProperty(prop);
    }
    if (element.style.length === 0) {
      element.removeAttribute("style");
    }
  };
}

// ─── Scroll helpers ───────────────────────────────────────────────────────────

function getScrollDimensions(element: HTMLElement, axis: Axis): [number, number, number] {
  return axis === "x"
    ? [element.clientWidth, element.scrollLeft, element.scrollWidth]
    : [element.clientHeight, element.scrollTop, element.scrollHeight];
}

function isScrollContainer(element: HTMLElement, axis: Axis): boolean {
  const styles = getComputedStyle(element);
  const overflow = axis === "x" ? styles.overflowX : styles.overflowY;
  return (
    overflow === "auto" ||
    overflow === "scroll" ||
    (element.tagName === "HTML" && overflow === "visible")
  );
}

function getScrollAtLocation(
  location: HTMLElement,
  axis: Axis,
  stopAt?: HTMLElement,
): [number, number] {
  const directionFactor =
    axis === "x" && window.getComputedStyle(location).direction === "rtl" ? -1 : 1;

  let currentElement: HTMLElement | null = location;
  let availableScroll = 0;
  let availableScrollTop = 0;
  let wrapperReached = false;

  do {
    const [clientSize, scrollOffset, scrollSize] = getScrollDimensions(currentElement, axis);
    const scrolled = scrollSize - clientSize - directionFactor * scrollOffset;

    if ((scrollOffset !== 0 || scrolled !== 0) && isScrollContainer(currentElement, axis)) {
      availableScroll += scrolled;
      availableScrollTop += scrollOffset;
    }

    if (currentElement === (stopAt ?? document.documentElement)) {
      wrapperReached = true;
    } else {
      // @ts-expect-error: _$host is a SolidJS-internal property set on portal roots
      currentElement = currentElement._$host ?? currentElement.parentElement;
    }
  } while (currentElement && !wrapperReached);

  return [availableScroll, availableScrollTop];
}

function wouldScroll(
  target: HTMLElement,
  axis: Axis,
  delta: number,
  wrapper: HTMLElement | null,
): boolean {
  const targetInWrapper = wrapper !== null && contains(wrapper, target);
  const [availableScroll, availableScrollTop] = getScrollAtLocation(
    target,
    axis,
    targetInWrapper ? wrapper : undefined,
  );
  // Firefox can report availableScroll as 1 even when no scroll is possible.
  if (delta > 0 && Math.abs(availableScroll) <= 1) return false;
  if (delta < 0 && Math.abs(availableScrollTop) < 1) return false;
  return true;
}

// ─── Primitive ────────────────────────────────────────────────────────────────

let _nextId = 0;

/**
 * Prevents scrolling outside of the given element.
 *
 * Adapted from [solid-prevent-scroll](https://github.com/corvudev/corvu/tree/main/packages/solid-prevent-scroll)
 * by Jasmin Noetzli (GiyoMoon), part of the corvu project.
 */
export const createPreventScroll = (props: CreatePreventScrollProps = {}): void => {
  if (isServer) return;

  const id = String(_nextId++);

  let currentTouchStart: [number, number] = [0, 0];
  let currentTouchStartAxis: Axis | null = null;
  let currentTouchStartDelta: number | null = null;

  // 1. Manage the active-instance stack.
  createEffect(
    () => ({ enabled: access(props.enabled) ?? true }),
    ({ enabled }) => {
      if (!enabled) return;
      setPreventScrollStack(stack => [...stack, id]);
      return () => setPreventScrollStack(stack => stack.filter(s => s !== id));
    },
  );

  // 2. Apply body overflow styles.
  createEffect(
    () => ({
      enabled: access(props.enabled) ?? true,
      hideScrollbar: access(props.hideScrollbar) ?? true,
      preventScrollbarShift: access(props.preventScrollbarShift) ?? true,
      preventScrollbarShiftMode: access(props.preventScrollbarShiftMode) ?? "padding",
      restoreScrollPosition: access(props.restoreScrollPosition) ?? true,
    }),
    ({ enabled, hideScrollbar, preventScrollbarShift, preventScrollbarShiftMode, restoreScrollPosition }) => {
      if (!enabled || !hideScrollbar) return;

      const { body } = document;
      const scrollbarWidth = window.innerWidth - body.offsetWidth;
      const offsetTop = window.scrollY;
      const offsetLeft = window.scrollX;

      const style: Partial<CSSStyleDeclaration> = { overflow: "hidden" };
      const properties: { key: string; value: string }[] = [];

      if (preventScrollbarShift && scrollbarWidth > 0) {
        if (preventScrollbarShiftMode === "padding") {
          style.paddingRight = `calc(${window.getComputedStyle(body).paddingRight} + ${scrollbarWidth}px)`;
        } else {
          style.marginRight = `calc(${window.getComputedStyle(body).marginRight} + ${scrollbarWidth}px)`;
        }
        properties.push({ key: "--scrollbar-width", value: `${scrollbarWidth}px` });
      }

      const restoreStyle = applyBodyStyle("prevent-scroll", body, style, properties);

      return () => {
        restoreStyle();
        if (restoreScrollPosition && scrollbarWidth > 0) {
          window.scrollTo(offsetLeft, offsetTop);
        }
      };
    },
  );

  // 3. Install wheel/touch event listeners (only when this is the topmost instance).
  createEffect(
    () => ({
      active: isActive(id),
      enabled: access(props.enabled) ?? true,
      wrapper: access(props.element) ?? null,
      allowPinchZoom: access(props.allowPinchZoom) ?? false,
    }),
    ({ active, enabled, wrapper, allowPinchZoom }) => {
      if (!active || !enabled) return;

      const maybePreventWheel = (event: WheelEvent) => {
        const target = event.target as HTMLElement;
        const delta: [number, number] = [event.deltaX, event.deltaY];
        const axis: Axis = Math.abs(delta[0]) > Math.abs(delta[1]) ? "x" : "y";
        const axisDelta = axis === "x" ? delta[0] : delta[1];

        const shouldCancel =
          wrapper && contains(wrapper, target)
            ? !wouldScroll(target, axis, axisDelta, wrapper)
            : true;

        if (shouldCancel && event.cancelable) event.preventDefault();
      };

      const logTouchStart = (event: TouchEvent) => {
        const touch = event.changedTouches[0];
        currentTouchStart = touch ? [touch.clientX, touch.clientY] : [0, 0];
        currentTouchStartAxis = null;
        currentTouchStartDelta = null;
      };

      const maybePreventTouch = (event: TouchEvent) => {
        const target = event.target as HTMLElement;
        let shouldCancel: boolean;

        if (event.touches.length === 2) {
          shouldCancel = !allowPinchZoom;
        } else {
          if (currentTouchStartAxis === null || currentTouchStartDelta === null) {
            const touch = event.changedTouches[0];
            const curr: [number, number] = touch ? [touch.clientX, touch.clientY] : [0, 0];
            const delta: [number, number] = [
              currentTouchStart[0] - curr[0],
              currentTouchStart[1] - curr[1],
            ];
            const axis: Axis = Math.abs(delta[0]) > Math.abs(delta[1]) ? "x" : "y";
            currentTouchStartAxis = axis;
            currentTouchStartDelta = axis === "x" ? delta[0] : delta[1];
          }

          if ((target as HTMLInputElement).type === "range") {
            shouldCancel = false;
          } else {
            const wouldResultInScroll = wouldScroll(
              target,
              currentTouchStartAxis,
              currentTouchStartDelta,
              wrapper,
            );
            shouldCancel =
              wrapper && contains(wrapper, target) ? !wouldResultInScroll : true;
          }
        }

        if (shouldCancel && event.cancelable) event.preventDefault();
      };

      document.addEventListener("wheel", maybePreventWheel, { passive: false });
      document.addEventListener("touchstart", logTouchStart, { passive: false });
      document.addEventListener("touchmove", maybePreventTouch, { passive: false });

      return () => {
        document.removeEventListener("wheel", maybePreventWheel);
        document.removeEventListener("touchstart", logTouchStart);
        document.removeEventListener("touchmove", maybePreventTouch);
      };
    },
  );
};
