import { Accessor } from "solid-js";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createHydratableSignal, trueFn } from "@solid-primitives/utils";
import { makeEventListener } from "@solid-primitives/event-listener";

/**
 * Creates a signal with a boolean value identifying the page visibility state.
 *
 * @example
 * ```ts
 * const visible = createPageVisibility();
 *
 * createEffect(() => {
 *    visible() // => boolean
 * })
 * ```
 */
export const createPageVisibility = (): Accessor<boolean> => {
  if (process.env.SSR) {
    return trueFn;
  }
  const checkVisibility = () => document.visibilityState === "visible";
  const [isVisible, setVisible] = createHydratableSignal(true, checkVisibility);
  makeEventListener(document, "visibilitychange", () => setVisible(checkVisibility));
  return isVisible;
};

/**
 * Returns a signal with a boolean value identifying the page visibility state.
 *
 * This is a [singleton root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) except if during hydration.
 *
 * @example
 * ```ts
 * const visible = usePageVisibility();
 *
 * createEffect(() => {
 *    visible() // => boolean
 * })
 * ```
 */
export const usePageVisibility: () => Accessor<boolean> =
  /*#__PURE__*/ createHydratableSingletonRoot(createPageVisibility);
