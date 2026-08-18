import { isServer } from "@solidjs/web";
import { makePageLeave, createPageLeaveBlocker } from "@solid-primitives/page-utilities";
import type { AnalyticsControls } from "./types.ts";

/** Minimal shape required by the guard — accepts both make and create controls. */
type Drainable = Pick<AnalyticsControls, "drain">;

/**
 * Minimal shape of SolidJS Router's BeforeLeaveEvent.
 * Typed here so the guard compiles without `@solidjs/router` as a hard dependency.
 */
export type BeforeLeaveEvent = {
  defaultPrevented: boolean;
  preventDefault(): void;
  /** Call with `true` to bypass this guard on the retry. */
  retry(force?: boolean): void;
};

function buildOnBeforeLeave(analytics: Drainable): (event: BeforeLeaveEvent) => void {
  let guarding = false;
  return function onBeforeLeave(event: BeforeLeaveEvent): void {
    if (guarding || event.defaultPrevented) return;
    event.preventDefault();
    guarding = true;
    void analytics.drain().finally(() => {
      guarding = false;
      event.retry(true);
    });
  };
}

/**
 * Non-reactive navigation guard. Returns the router callback and a cleanup function.
 *
 * - Shows a browser confirmation dialog on hard navigation (tab close, URL bar, etc.).
 * - Returns `onBeforeLeave` for use with SolidJS Router's `useBeforeLeave` to hold
 *   back soft navigation until all in-flight analytics events have been sent.
 *
 * ```ts
 * import { useBeforeLeave } from "@solidjs/router";
 * const [analytics, cleanupAnalytics] = makeAnalytics([...]);
 * const [onBeforeLeave, cleanupGuard] = makeAnalyticsGuard(analytics);
 * useBeforeLeave(onBeforeLeave);
 * ```
 */
export function makeAnalyticsGuard(
  analytics: Drainable,
): [(event: BeforeLeaveEvent) => void, () => void] {
  if (isServer) return [() => {}, () => {}];
  return [buildOnBeforeLeave(analytics), makePageLeave()];
}

/**
 * Reactive navigation guard. Auto-removes the `beforeunload` listener when the owner
 * disposes. Returns the `onBeforeLeave` callback directly for use with `useBeforeLeave`.
 *
 * ```tsx
 * function App() {
 *   useBeforeLeave(createAnalyticsGuard(useAnalytics()));
 * }
 * ```
 */
export function createAnalyticsGuard(analytics: Drainable): (event: BeforeLeaveEvent) => void {
  if (isServer) return () => {};
  createPageLeaveBlocker();
  return buildOnBeforeLeave(analytics);
}
