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
export function deepTrack<T>(store: Store<T>): T {
  deepTraverse(store, new Set());
  return store;
}

/**
 * deepTraverse - traverse an object
 * @param obj an object to traverse
 * @private
 */
function deepTraverse<T>(value: Store<T>, seen: Set<unknown>): void {
  if (!seen.has(value) && isWrappable(value)) {
    seen.add(value);
    for (const key in value) {
      deepTraverse(value[key], seen);
    }
  }
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

/*

To do:
- [x] objects
- [ ] arrays
- [ ] circular references
- [ ] multiple references
- [ ] memoize?

*/

export type AllNestedValues<T> = T extends (infer U)[]
  ? AllNestedValues<U> | T
  : T extends Record<string | number, infer U>
  ? AllNestedValues<U> | T
  : T;

export type Diff<T> = {
  path: (string | number)[];
  value: AllNestedValues<T> | undefined;
  prev: AllNestedValues<T> | undefined;
};

const checkIsObject = (value: any) => value != null && typeof value === "object";

export function createStoreDiff<T extends object>(): (newStore: T) => Diff<T>[] {
  type CacheRecord = Record<string | number, CacheNode>;

  type CacheNode = {
    ref: any;
    record?: CacheRecord;
  };

  const cache: CacheRecord = {
    root: {
      ref: undefined,
    },
  };

  let diffs: Diff<T>[];

  function createNodes(value: any, isObject: boolean): CacheNode {
    if (isObject) {
      const record: CacheRecord = {};

      for (const [key, node] of Object.entries(value)) {
        record[key] = createNodes(node, checkIsObject(node));
      }

      return { ref: value, record };
    }
    return { ref: value, record: undefined };
  }

  function compare(
    value: any,
    parent: CacheRecord,
    key: string | number,
    path: (string | number)[],
  ): void {
    const node = parent[key];

    const prev = node && node.ref;
    const isObject = checkIsObject(value);
    const isSame = node && node.ref === value;

    console.log({ value, node, prev, parent, key, path, isSame, isObject });

    if (isSame) {
      if (isObject) {
        for (const key in value) {
          compare(value[key], node.record!, key, [...path, key]);
        }
        // removed keys
        for (const key in node.record!) {
          if (!(key in value)) {
            diffs.push({ path: [...path, key], value: undefined, prev: node.record[key]!.ref });
            delete node.record[key];
          }
        }
      }
    } else {
      parent[key] = createNodes(value, isObject);
      diffs.push({ path, value, prev });
    }
  }

  return (obj: T) => {
    console.log("-------------------");
    diffs = [];
    compare(obj, cache, "root", []);

    return diffs;
  };
}
