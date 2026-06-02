import type { AnyPayload, AnalyticsPlugin } from "../types.js";
import { createServerPlugin } from "../relay.js";

/**
 * Creates an analytics plugin that relays client events to a SolidStart server
 * action, which dispatches them to your provider (GA, Mixpanel, etc.) server-side.
 *
 * Because SolidStart requires `"use server"` as a source literal, define the action
 * yourself and pass it here:
 *
 * ```ts
 * // analytics.server.ts
 * import { action, reload } from "@solidjs/router";
 * import googleAnalytics from "@analytics/google-analytics";
 *
 * export const relayEvent = action(async (payload: AnyPayload) => {
 *   "use server";
 *   const ga = googleAnalytics({ measurementId: import.meta.env.GA_ID });
 *   await ga.track?.({ payload, config: {}, abort: () => {} });
 *   return reload({ revalidate: [] });
 * });
 *
 * // app.tsx
 * import { createSolidStartRelayPlugin } from "@solid-primitives/analytics/relay/solidstart";
 * import { relayEvent } from "./analytics.server";
 *
 * const analytics = createAnalytics([
 *   createSolidStartRelayPlugin(relayEvent, { events: ["track", "identify"] }),
 * ]);
 * ```
 */
export function createSolidStartRelayPlugin(
  action: (payload: AnyPayload) => Promise<unknown>,
  options?: { name?: string; events?: Array<AnyPayload["type"]> },
): AnalyticsPlugin {
  return createServerPlugin(action, { name: "solidstart", ...options });
}
