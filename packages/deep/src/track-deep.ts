import { $PROXY } from "solid-js";
import { Store } from "solid-js/store";

/**
 * deepTrack - create a deep getter on the given object
 * ```ts
 * export function deepTrack<T>(
 *   store: Store<T>
 * ): T;
 * ```
 * @param store reactive store dependency
 * @returns same dependency, just traversed deeply to trigger effects on deeply nested properties.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#deeptrack
 *
 * @example
 * ```ts
 * createEffect(
 *   on(
 *     deepTrack(store),
 *     () => {
 *       // this effect will run when any property of store changes
 *     }
 *   )
 * );
 * ```
 */
export function trackDeep<T extends Store<object>>(store: T): T {
  deepTraverse(store, new Set());
  return store;
}

function deepTraverse<T>(value: Store<T>, seen: Set<unknown>): void {
  let isArray: boolean;
  let proto;
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
    for (const child of isArray ? (value as any[]) : Object.values(value))
      deepTraverse(child, seen);
  }
}
