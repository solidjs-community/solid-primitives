import { $PROXY } from "solid-js";
import { Store } from "solid-js/store";

/**
 * Tracks all properties of a {@link store} by iterating over them recursively.
 *
 * @param store reactive store dependency
 * @returns same {@link store} that was passed in
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#trackDeep
 *
 * @example
 * ```ts
 * createEffect(on(
 *   () => trackDeep(store),
 *   () => {
 *     // this effect will run when any property of store changes
 *   }
 * ));
 * ```
 */
function trackDeep<T extends Store<object>>(store: T): T {
  traverse(store, new Set());
  return store;
}

function traverse<T>(value: Store<T>, seen: Set<unknown>): void {
  let isArray: boolean;
  let proto;
  // check the same conditions as in `isWrappable` from `/packages/solid/store/src/store.ts`
  if (
    value != null &&
    typeof value === "object" &&
    !seen.has(value) &&
    ((isArray = Array.isArray(value)) ||
      (value as any)[$PROXY] ||
      !(proto = Object.getPrototypeOf(value)) ||
      proto === Object.prototype)
  ) {
    seen.add(value);
    for (const child of isArray ? (value as any[]) : Object.values(value)) traverse(child, seen);
  }
}

/**
 * @deprecated Renamed to {@link trackDeep}
 */
const deepTrack = trackDeep;

export { trackDeep, deepTrack };
