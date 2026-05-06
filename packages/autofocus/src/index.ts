import { createEffect, onSettled, type Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import { type FalsyValue } from "@solid-primitives/utils";

/**
 * Ref callback factory to autofocus an element on render.
 * Uses the native `autofocus` attribute to determine whether to focus.
 *
 * @param enabled - Whether to enable autofocus. Defaults to `true`.
 * @returns Ref callback to attach to the element.
 *
 * @example
 * ```tsx
 * <button ref={autofocus()} autofocus>Autofocused</button>
 *
 * // Disable autofocus
 * <button ref={autofocus(false)} autofocus>Not autofocused</button>
 * ```
 */
export const autofocus = (enabled?: boolean) => {
  if (enabled === false) return (_el: HTMLElement) => {};

  let el: HTMLElement | undefined;

  onSettled(() => {
    if (!el?.hasAttribute("autofocus")) return;
    const id = setTimeout(() => el?.focus());
    return () => clearTimeout(id);
  });

  return (element: HTMLElement) => {
    el = element;
  };
};

/**
 * Creates a new reactive primitive for autofocusing the element on render.
 *
 * @param ref - Element to focus.
 *
 * @example
 * ```ts
 * let ref!: HTMLButtonElement;
 *
 * createAutofocus(() => ref);
 *
 * <button ref={ref}>Autofocused</button>;
 *
 * // Using ref signal
 * const [ref, setRef] = createSignal<HTMLButtonElement>();
 * createAutofocus(ref);
 *
 * <button ref={setRef}>Autofocused</button>;
 * ```
 */
export const createAutofocus = (ref: Accessor<HTMLElement | FalsyValue>) => {
  createEffect(
    () => ref(),
    el => {
      if (!el) return;
      const id = setTimeout(() => el.focus());
      return () => clearTimeout(id);
    },
  );
};

// only here so the `JSX` import won't be shaken off the tree:
export type E = JSX.Element;
