import { createUniqueId } from "solid-js";

/**
 * Create a universal id with an optional `prefix` that is stable across server/browser.
 */
export function createId(prefix = "sp-ui"): string {
  return `${prefix}-${createUniqueId()}`;
}
