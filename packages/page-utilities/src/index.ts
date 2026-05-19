import { type Accessor, createEffect, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import { createHydratableSingletonRoot } from "@solid-primitives/rootless";
import { createHydratableSignal, INTERNAL_OPTIONS, trueFn, type MaybeAccessor } from "@solid-primitives/utils";
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
  if (isServer) {
    return trueFn;
  }
  const checkVisibility = () => document.visibilityState === "visible";
  const [isVisible, setVisible] = createHydratableSignal(true, checkVisibility, INTERNAL_OPTIONS);
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

/**
 * Intercepts the browser's `beforeunload` event to show a confirmation dialog
 * when the user attempts to close the tab, navigate away, or refresh.
 * Returns a cleanup function to remove the listener.
 *
 * @example
 * ```ts
 * const cleanup = makePageLeave();
 * // later:
 * cleanup();
 * ```
 */
export function makePageLeave(): VoidFunction {
  const handler = (e: BeforeUnloadEvent) => {
    e.preventDefault();
  };
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
}

/**
 * Intercepts the browser's `beforeunload` event to show a confirmation dialog
 * when the user attempts to close the tab, navigate away, or refresh.
 *
 * Pass a reactive signal as {@link enabled} to toggle prevention on and off.
 * Automatically removes the listener when the reactive scope is disposed.
 *
 * @param enabled - whether to block navigation. Defaults to `true`. Accepts a boolean or a reactive accessor.
 *
 * @example
 * ```ts
 * // Always block navigation
 * createPageLeaveBlocker();
 *
 * // Only block when there are unsaved changes
 * const [isDirty, setIsDirty] = createSignal(false);
 * createPageLeaveBlocker(isDirty);
 * ```
 */
export function createPageLeaveBlocker(enabled: MaybeAccessor<boolean> = true): void {
  if (isServer) return;

  if (typeof enabled !== "function") {
    if (!enabled) return;
    onCleanup(makePageLeave());
    return;
  }

  createEffect(enabled, isEnabled => {
    if (!isEnabled) return;
    return makePageLeave();
  });
}
