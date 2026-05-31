import type { Accessor } from "solid-js";

export type PageProperties = {
  path?: string;
  url?: string;
  title?: string;
  referrer?: string;
  [key: string]: unknown;
};

export type TrackProperties = Record<string, unknown>;

export type IdentifyTraits = Record<string, unknown>;

export type EventMeta = {
  /** Unique request identifier for this event. */
  rid: string;
  /** Unix timestamp (ms) when the event was created. */
  ts: number;
};

export type PagePayload = {
  type: "page";
  properties: PageProperties;
  meta: EventMeta;
};

export type TrackPayload = {
  type: "track";
  event: string;
  properties: TrackProperties;
  meta: EventMeta;
};

export type IdentifyPayload = {
  type: "identify";
  userId: string;
  traits: IdentifyTraits;
  meta: EventMeta;
};

export type AnyPayload = PagePayload | TrackPayload | IdentifyPayload;

export type PluginArgs<P extends AnyPayload> = {
  payload: P;
  /** Plugin-level config merged from plugin.config. */
  config: Record<string, unknown>;
  /** Stops subsequent plugins from receiving this event. */
  abort: () => void;
};

/**
 * Analytics plugin interface compatible with the `analytics` npm package.
 * Any plugin built for that library can be used directly.
 */
export interface AnalyticsPlugin {
  name: string;
  /** Static plugin-level configuration passed to each handler. */
  config?: Record<string, unknown>;
  /** Runs once when the plugin is registered. May be async (e.g. script injection). */
  initialize?: (args: { config: Record<string, unknown> }) => void | Promise<void>;
  /** Polled to determine whether an async dependency (e.g. a script tag) has loaded. */
  loaded?: () => boolean;
  page?: (args: PluginArgs<PagePayload>) => void | Promise<void>;
  track?: (args: PluginArgs<TrackPayload>) => void | Promise<void>;
  identify?: (args: PluginArgs<IdentifyPayload>) => void | Promise<void>;
}

export type AnalyticsOptions = {
  /** Maximum number of events to hold in the queue before discarding. Default: 100. */
  queueLimit?: number;
  /** Milliseconds between plugin-readiness checks. Default: 500. */
  retryInterval?: number;
  /**
   * When set, events are batched and dispatched on this interval (ms) rather than
   * immediately. Without this option the current event fires as soon as plugins are ready.
   */
  drainInterval?: number;
  /**
   * Maximum events dispatched per drain cycle. Only applies when `drainInterval` is set.
   * Remaining events stay queued until the next cycle.
   */
  drainSize?: number;
};

export type AnalyticsControls = {
  /** Track a page view. Defaults to current window location when called in a browser. */
  page(properties?: PageProperties): void;
  /** Track a named event with optional properties. */
  track(event: string, properties?: TrackProperties): void;
  /** Associate subsequent events with a user identity. */
  identify(userId: string, traits?: IdentifyTraits): void;
  /** Dynamically register an additional plugin. */
  use(plugin: AnalyticsPlugin): void;
  /** Stop the internal poll timer and clear any queued events. */
  reset(): void;
  /**
   * Resolves when all currently in-flight plugin dispatches have settled.
   * Useful for holding back navigation until analytics events have been sent.
   * Note: events still in the queue (waiting for plugins to load) are not awaited.
   */
  drain(): Promise<void>;
};

export type ReactiveAnalyticsControls = AnalyticsControls & {
  /** Number of events waiting in the queue (plugins not yet ready). */
  pendingCount: Accessor<number>;
};
