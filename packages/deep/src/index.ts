import { createLazyMemo } from "@solid-primitives/memo";
import { $PROXY, $TRACK, Accessor, createMemo, createRoot, untrack } from "solid-js";
import { Store, unwrap } from "solid-js/store";

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
export function deepTrack<T extends Store<object>>(store: T): T {
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

export const { trackStore3 } = (() => {
  type StoreNode = object & Record<typeof $TRACK, unknown>;

  const isStoreNode = (value: unknown): value is StoreNode =>
    value != null && typeof value === "object" && $TRACK in value;

  const TrackStoreCache = new WeakMap<StoreNode, VoidFunction>();
  let ToTrack: Set<VoidFunction>;

  function walkTrackValue(value: unknown): VoidFunction | undefined {
    if (!isStoreNode(value)) return;

    let track = TrackStoreCache.get(value);

    if (!track) {
      let prevV = 0;
      const self = createRoot(() => createLazyMemo(p => (value[$TRACK], p + 1), prevV));

      const children = untrack(() => (Array.isArray(value) ? value : Object.values(value)));
      let childrenMemos: VoidFunction[] = [];

      track = () => {
        const v = self();
        if (v !== prevV) {
          prevV = v;
          childrenMemos = [];

          for (const child of children) {
            const childMemo = walkTrackValue(child);
            if (childMemo) childrenMemos.push(childMemo);
          }
        }

        for (const child of childrenMemos) {
          ToTrack.add(child);
        }
      };

      TrackStoreCache.set(value, track);
    }

    return track;
  }

  // TODO: unwrapping?
  // const unwrapped = unwrap(store);

  // console.log("1", unwrapped.a, unwrapped.a[$PROXY], unwrapped.a[$PROXY] === store.a);
  // console.log("2", unwrapped.a, unwrapped.a[$PROXY], unwrapped.a[$PROXY] === store.a);

  function trackStore3<T extends object>(store: Store<T>): T {
    ToTrack = new Set();
    walkTrackValue(store)?.();
    for (const tracked of ToTrack) tracked();
    return store;
  }

  return { trackStore3 };
})();

export const { trackStore2 } = (() => {
  const TrackKeysCache = new WeakMap<object, Accessor<number>>();

  function trackProxyKeys(proxy: StoreNode): number {
    let memo = TrackKeysCache.get(proxy);

    if (!memo)
      TrackKeysCache.set(
        proxy,
        (memo = createRoot(() => createLazyMemo(p => (proxy[$TRACK], p + 1), 0))),
      );

    return memo();
  }

  type StoreNode = object & Record<typeof $TRACK, unknown>;

  type TrackStoreNode = {
    version: number;
    children: StoreNode[];
  };

  const TrackStoreCache = new WeakMap<object, TrackStoreNode>();

  let TrackStoreList!: Set<StoreNode>;

  const isStoreNode = (value: unknown): value is StoreNode =>
    value != null && typeof value === "object" && $TRACK in value;

  function walkStoreNodeChildren(value: StoreNode): StoreNode[] {
    const children: StoreNode[] = [];

    for (const child of Array.isArray(value) ? (value as unknown[]) : Object.values(value)) {
      if (isStoreNode(child)) {
        children.push(child);
        walkTrackValue(child);
      }
    }

    return children;
  }

  function walkTrackValue(value: StoreNode): void {
    if (TrackStoreList.has(value)) return;

    TrackStoreList.add(value);

    const v = trackProxyKeys(value);

    let node = TrackStoreCache.get(value);

    if (node) {
      if (node.version === v) {
        TrackStoreList.add(value);

        for (const child of node.children) {
          walkTrackValue(child);
        }
      } else {
        node.version = v;
        node.children = walkStoreNodeChildren(value);
      }
    } else {
      TrackStoreCache.set(value, (node = { version: v, children: walkStoreNodeChildren(value) }));
    }
  }

  function trackStore2<T extends Store<object>>(store: T): T {
    if (!isStoreNode(store)) return store;

    TrackStoreList = new Set();

    untrack(() => walkTrackValue(store));

    for (const storeNode of TrackStoreList) trackProxyKeys(storeNode);

    return store;
  }

  return { trackStore2 };
})();

export const { trackStore1 } = (() => {
  const TrackKeysCache = new WeakMap<object, Accessor<number>>();

  function trackProxyKeys(proxy: object): number {
    if (!($TRACK in proxy)) return -1;

    let memo = TrackKeysCache.get(proxy);

    if (!memo)
      TrackKeysCache.set(
        proxy,
        (memo = createRoot(() => createLazyMemo(p => (proxy[$TRACK], p + 1), 0))),
      );

    return memo();
  }

  let TrackStoreList!: Set<Object>;

  function walkTrackValue(value: unknown): void {
    if (
      value == null ||
      typeof value !== "object" ||
      !($TRACK in value) ||
      TrackStoreList.has(value)
    )
      return;

    TrackStoreList.add(value);

    for (const child of Array.isArray(value) ? value : Object.values(value)) walkTrackValue(child);
  }

  function trackStore1<T extends Store<object>>(store: T): T {
    TrackStoreList = new Set();

    untrack(() => walkTrackValue(store));

    for (const storeNode of TrackStoreList) trackProxyKeys(storeNode);

    return store;
  }

  return { trackStore1 };
})();

/*

To do:
- [x] objects
- [ ] arrays
- [ ] circular references
- [ ] multiple references
- [ ] memoize?
- [ ] toggle check deleted/added object properties
- [ ] reuse object/array cache
- [ ] can objects be handled as arrays?

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
    dirty?: Accessor<{ v: boolean }>;
  };

  const cache: CacheRecord = {
    root: {
      ref: undefined,
    },
  };

  let diffs: Diff<T>[];

  function createNodes(value: any, isObject: boolean): CacheRecord | undefined {
    if (isObject) {
      const record: CacheRecord = { ...value };

      for (const [key, node] of Object.entries(value)) {
        record[key] = {
          ref: node,
          record: createNodes(node, checkIsObject(node)),
        };
      }

      return record;
    }
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
    const isArray = Array.isArray(value);
    let isSame = node && node.ref === value;

    let isDirty: { v: boolean } | undefined;
    if (isSame && isArray && (isDirty = node!.dirty!()).v) {
      isSame = isDirty.v = false;
    }

    // console.log({ value, node, prev, parent, key, path, isSame, isObject });

    if (isSame) {
      if (isArray) {
        for (let i = 0; i < value.length; i++) {
          compare(value[i], node.record!, i, [...path, i]);
        }
      } else if (isObject) {
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
      diffs.push({ path, value, prev });
      if (isArray) {
        const dirty = createRoot(() => createLazyMemo(p => ((p.v = true), p), { v: false }));
        parent[key] = {
          ref: value,
          dirty,
          record: createNodes(value, isObject),
        };
      } else {
        parent[key] = {
          ref: value,
          record: createNodes(value, isObject),
        };
      }
    }
  }

  return (obj: T) => {
    console.log("-------------------");
    diffs = [];
    compare(obj, cache, "root", []);

    return diffs;
  };
}
