import type { AnalyticsPlugin, AnyPayload } from "./types.js";

/**
 * Creates a client-side plugin that forwards every analytics event to a server
 * function, which relays it to the actual provider (GA, Mixpanel, Segment, etc.)
 * via its server-side SDK or HTTP API.
 *
 * This keeps API keys off the client and lets you enrich events with server-side
 * context (session data, IP geo, etc.) before forwarding.
 *
 * ```ts
 * // client
 * const analytics = createAnalytics([
 *   createServerPlugin(relayEvent, { events: ["track", "identify"] }),
 * ]);
 *
 * analytics.track("purchase", { orderId: "123" }); // → server → GA
 * ```
 */
export function createServerPlugin(
  fn: (payload: AnyPayload) => Promise<unknown>,
  options: { name?: string; events?: Array<AnyPayload["type"]> } = {},
): AnalyticsPlugin {
  const { name = "server", events } = options;
  const handles = (type: AnyPayload["type"]) => !events || events.includes(type);
  return {
    name,
    page:     handles("page")     ? ({ payload }) => fn(payload) as Promise<void> : undefined,
    track:    handles("track")    ? ({ payload }) => fn(payload) as Promise<void> : undefined,
    identify: handles("identify") ? ({ payload }) => fn(payload) as Promise<void> : undefined,
  };
}
