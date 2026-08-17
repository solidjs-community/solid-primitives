export type {
  PageProperties,
  TrackProperties,
  IdentifyTraits,
  EventMeta,
  PagePayload,
  TrackPayload,
  IdentifyPayload,
  AnyPayload,
  PluginArgs,
  AnalyticsPlugin,
  AnalyticsOptions,
  AnalyticsControls,
  ReactiveAnalyticsControls,
} from "./types.ts";

export { makeAnalytics, createAnalytics } from "./analytics.ts";

export { createServerPlugin } from "./relay.ts";

export { AnalyticsProvider, useAnalytics } from "./context.ts";

export { makeAnalyticsGuard, createAnalyticsGuard } from "./guard.ts";
export type { BeforeLeaveEvent } from "./guard.ts";
