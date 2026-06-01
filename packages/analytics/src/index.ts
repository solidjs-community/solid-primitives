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
} from "./types.js";

export { makeAnalytics, createAnalytics } from "./analytics.js";

export { AnalyticsProvider, useAnalytics } from "./context.js";

export { makeAnalyticsGuard, createAnalyticsGuard } from "./guard.js";
export type { BeforeLeaveEvent } from "./guard.js";
