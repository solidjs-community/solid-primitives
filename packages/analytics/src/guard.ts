import { isServer } from "@solidjs/web";
import { makeEventListener, createEventListener } from "@solid-primitives/event-listener";
import type { AnalyticsControls } from "./types.js";

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
 * Non-reactive navigation guard. Call cleanup() when done (e.g. on route teardown).
 *
 * - Registers a `beforeunload` listener so hard navigations attempt a best-effort drain.
 * - Returns `onBeforeLeave` for use with SolidJS Router's `useBeforeLeave`:
 *
 * ```ts
 * import { useBeforeLeave } from "@solidjs/router";
 * const [analytics, cleanup] = makeAnalytics([...]);
 * const { onBeforeLeave, cleanup: guardCleanup } = makeAnalyticsGuard(analytics);
 * useBeforeLeave(onBeforeLeave);
 * ```
 */
export function makeAnalyticsGuard(analytics: Drainable): {
  onBeforeLeave: (event: BeforeLeaveEvent) => void;
  cleanup: () => void;
} {
  if (isServer) return { onBeforeLeave: () => {}, cleanup: () => {} };
  const onBeforeLeave = buildOnBeforeLeave(analytics);
  const cleanup = makeEventListener(window, "beforeunload", () => void analytics.drain());
  return { onBeforeLeave, cleanup };
}

/**
 * Reactive navigation guard. Auto-removes the `beforeunload` listener when the owner disposes.
 *
 * ```tsx
 * function App() {
 *   const analytics = useAnalytics();
 *   const { onBeforeLeave } = createAnalyticsGuard(analytics);
 *   useBeforeLeave(onBeforeLeave);
 * }
 * ```
 */
export function createAnalyticsGuard(analytics: Drainable): {
  onBeforeLeave: (event: BeforeLeaveEvent) => void;
} {
  if (isServer) return { onBeforeLeave: () => {} };
  const onBeforeLeave = buildOnBeforeLeave(analytics);
  createEventListener(window, "beforeunload", () => void analytics.drain());
  return { onBeforeLeave };
}
