import { createComponent, createContext, useContext } from "solid-js";
import type { Element } from "solid-js";
import { createAnalytics } from "./analytics.js";
import type { ReactiveAnalyticsControls, AnalyticsPlugin, AnalyticsOptions } from "./types.js";

const AnalyticsCtx = createContext<ReactiveAnalyticsControls>();

/**
 * Provides an analytics instance to all descendant components.
 * Creates its own `createAnalytics` instance and disposes it when unmounted.
 *
 * ```tsx
 * import googleAnalytics from "@analytics/google-analytics";
 *
 * <AnalyticsProvider plugins={[googleAnalytics({ measurementId: "G-xxx" })]}>
 *   <App />
 * </AnalyticsProvider>
 * ```
 */
export function AnalyticsProvider(props: {
  plugins: AnalyticsPlugin[];
  options?: AnalyticsOptions;
  children: Element;
}): Element {
  const analytics = createAnalytics(props.plugins, props.options);
  return createComponent(AnalyticsCtx, {
    value: analytics,
    get children() {
      return props.children;
    },
  });
}

/**
 * Returns the nearest `AnalyticsProvider`'s controls.
 * Throws `ContextNotFoundError` if called outside a provider.
 *
 * ```ts
 * function TrackButton() {
 *   const analytics = useAnalytics();
 *   return <button onClick={() => analytics.track("click")}>Buy</button>;
 * }
 * ```
 */
export const useAnalytics = (): ReactiveAnalyticsControls => useContext(AnalyticsCtx);
