import { $PROXY } from "solid-js";
import { Store } from "solid-js/store";

/**
 * deepTrack - create a deep getter on the given object
 * ```typescript
 * export function deepTrack<T>(
 *   dep: Store<T>
 * ): T;
 * ```
 * @param dep reactive dependency
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
export function deepTrack<T>(store: Store<T>): Store<T> {
  return deepTraverse(store);
}

/**
 * deepTraverse - traverse an object
 * @param obj an object to traverse
 * @returns an object with all values traversed
 * @private
 * */
function deepTraverse<T>(value: Store<T>): T {
  if (!isWrappable(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      deepTraverse(value[i]);
    }
  } else if (isWrappable(value)) {
    for (const key in value) {
      deepTraverse(value[key]);
    }
  }

  return value;
}

/**
 * isWrappable - copied from
 * /packages/solid/store/src/store.ts
 *
 * exported only for ´DEV´ mode so we need to copy it here
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
