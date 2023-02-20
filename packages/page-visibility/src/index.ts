import { Accessor, sharedConfig } from "solid-js";
import { createSharedRoot } from "@solid-primitives/rootless";
import { createHydrateSignal } from "@solid-primitives/utils";
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
    return () => true;
  }
  const isVisible = () => document.visibilityState === "visible";
  const [state, setState] = createHydrateSignal(true, isVisible);
  const update = () => setState(isVisible());
  makeEventListener(document, "visibilitychange", update);
  return state;
};

const sharedPageVisibility: () => Accessor<boolean> =
  /*#__PURE__*/ createSharedRoot(createPageVisibility);

/**
 * Returns a signal with a boolean value identifying the page visibility state.
 *
 * This is a [shared root primitive](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot) except if during hydration.
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
export const usePageVisibility: () => Accessor<boolean> = process.env.SSR
  ? () => () => false
  : () => (sharedConfig.context ? createPageVisibility() : sharedPageVisibility());
