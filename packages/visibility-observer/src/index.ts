import { createSignal, Accessor } from "solid-js";
import { makeEventListener } from "@solid-primitives/event-listener";
import { createSharedRoot } from "@solid-primitives/rootless";

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
  const [state, setState] = createSignal(document.visibilityState === "visible");
  const cb = () => setState(document.visibilityState === "visible");
  makeEventListener(document, "visibilitychange", cb);
  return state;
};

/**
 * Returns a signal with a boolean value identifying the page visibility state.
 *
 * This is a [shared root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot) primitive.
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
export const usePageVisibility = createSharedRoot(createPageVisibility);
