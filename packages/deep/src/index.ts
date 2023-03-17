import { $PROXY } from "solid-js";
import { Store } from "solid-js/store";

/**
 * deepTrack - create a deep getter on the given object
 * ```typescript
 * export function deepTrack<T>(
 *   store: Store<T>
 * ): T;
 * ```
 * @param store reactive store dependency
 * @returns same dependency, just traversed deeply to trigger effects on deeply nested properties. For example:
 *
 * ```typescript
 * createEffect(
 *     on(
 *         deepTrack(store),
 *         () => {
 *            // this effect will run when any property of store changes
 *         }
 *     )
 *
 * );
 * ```
 */
export function deepTrack<T>(store: Store<T>): T {
  return deepTraverse(store, new Set());
}

/**
 * deepTraverse - traverse an object
 * @param obj an object to traverse
 * @returns an object with all values traversed
 * @private
 * */
function deepTraverse<T>(value: Store<T>, seen: Set<unknown>): T {
  if (!seen.has(value) && isWrappable(value)) {
    seen.add(value);
    for (const key in value) {
      deepTraverse(value[key], seen);
    }
  }
  return value;
}

/**
 * isWrappable - copied from `/packages/solid/store/src/store.ts`
 * as it is only exported for ´DEV´ mode, so we need to copy it here
 */
function isWrappable(obj: any) {
  let proto;
  return (
    obj != null &&
    typeof obj === "object" &&
    (obj[$PROXY] ||
      !(proto = Object.getPrototypeOf(obj)) ||
      proto === Object.prototype ||
      Array.isArray(obj))
  );
}
