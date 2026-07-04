import type { AnyPayload, AnalyticsPlugin } from "../types.js";
import { createServerPlugin } from "../relay.js";

/**
 * Creates an analytics plugin that relays client events to a TanStack Start server
 * function, which dispatches them to your provider (GA, Mixpanel, etc.) server-side.
 *
 * Pass the already-created server function — `createTanStackRelayPlugin` handles
 * the `{ data }` call signature so you don't have to:
 *
 * ```ts
 * // analytics.server.ts
 * import { createServerFn } from "@tanstack/solid-start";
 * import googleAnalytics from "@analytics/google-analytics";
 *
 * export const relayEvent = createServerFn({ method: "POST" })
 *   .inputValidator((d: unknown) => d as AnyPayload)
 *   .handler(async ({ data: payload }) => {
 *     const ga = googleAnalytics({ measurementId: process.env.GA_ID });
 *     await ga.track?.({ payload, config: {}, abort: () => {} });
 *   });
 *
 * // app.tsx
 * import { createTanStackRelayPlugin } from "@solid-primitives/analytics/relay/tanstack";
 * import { relayEvent } from "./analytics.server";
 *
 * const analytics = createAnalytics([
 *   createTanStackRelayPlugin(relayEvent, { events: ["track", "identify"] }),
 * ]);
 * ```
 */
export function createTanStackRelayPlugin(
  fn: (input: { data: AnyPayload }) => Promise<void>,
  options?: { name?: string; events?: Array<AnyPayload["type"]> },
): AnalyticsPlugin {
  return createServerPlugin(payload => fn({ data: payload }), { name: "tanstack", ...options });
}
