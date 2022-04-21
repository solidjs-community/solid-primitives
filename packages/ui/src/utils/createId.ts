import { createUniqueId } from "solid-js";

/**
 * Create a universal id with an optional `prefix` that is stable across server/browser.
 */
export function createId(prefix = "solid-ui-primitives"): string {
  return `${prefix}-${createUniqueId()}`;
}
