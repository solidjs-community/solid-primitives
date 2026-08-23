import { createComputed, createSignal } from "solid-js";
import { createResizeObserver } from "@solid-primitives/resize-observer";

export * from "./geometry.js";

export type NullableElement = Element | null | undefined;
export type ElementBoundsCallback = (bounds: DOMRectReadOnly, element: Element) => void;

export const getElementBounds = (element: Element): DOMRectReadOnly =>
  element.getBoundingClientRect();

export function createElementBounds(
  element: () => NullableElement,
  options?: {
    trackMutation?: boolean;
    trackScroll?: boolean;
  },
): DOMRectReadOnly {
  const [bounds, setBounds] = createSignal<DOMRectReadOnly>(
    new DOMRectReadOnly(),
  );

  const update = (el: Element) => setBounds(getElementBounds(el));

  createResizeObserver(element, (rect, el) => setBounds(rect));

  createComputed(() => {
    const el = element();
    if (el) update(el);
  });

  return bounds as unknown as DOMRectReadOnly;
}
