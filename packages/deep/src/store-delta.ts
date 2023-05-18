/*

To do:
- [x] objects
- [x] arrays
- [ ] circular references
- [ ] multiple references
- [x] memoize?

*/

import { createLazyMemo } from "@solid-primitives/memo";
import { $PROXY, $TRACK, Accessor, createRoot, untrack } from "solid-js";
import { unwrap } from "solid-js/store";

type StoreNode = Record<typeof $TRACK | string | number, unknown>;

type StoreNodeChildren = Record<string | number, StoreNode> | StoreNode[];

const StoreNodeChildrenCache = new WeakMap<StoreNode, Accessor<StoreNodeChildren>>();

function getStoreNodechildren(node: StoreNode): StoreNodeChildren {
  let signal = StoreNodeChildrenCache.get(node);

  if (!signal) {
    const unwrapped = unwrap(node),
      isArray = Array.isArray(unwrapped);

    signal = createRoot(() =>
      createLazyMemo(() => {
        node[$TRACK];
        const children: StoreNodeChildren = isArray ? [] : {};
        for (const [key, child] of Object.entries(unwrapped)) {
          let childNode: any;
          if (
            child != null &&
            typeof child === "object" &&
            ((childNode = (child as any)[$PROXY]) ||
              ((childNode = untrack(() => node[key])) && $TRACK in childNode))
          ) {
            children[key as any] = childNode;
          }
        }
        return children;
      }),
    );

    StoreNodeChildrenCache.set(node, signal);
  }

  return signal();
}

export type AllNestedObjects<T> = T extends (infer U)[] | Record<string | number, infer U>
  ? AllNestedObjects<U> | T
  : never;

export type NestedUpdate<T> = {
  path: (string | number)[];
  value: AllNestedObjects<T>;
};

export type StoreDelta<T> = NestedUpdate<T>[];

type StoreDeltaCache = {
  [K in string | number]: {
    children: StoreNodeChildren;
    record: StoreDeltaCache;
  };
};

function newCacheNode(children: StoreNodeChildren): StoreDeltaCache[number] {
  const record: StoreDeltaCache = { ...children } as any;

  for (const [key, node] of Object.entries(children)) {
    record[key] = newCacheNode(getStoreNodechildren(node));
  }

  return { children, record };
}

let CurrentDelta!: StoreDelta<any>;

function compareStoreWithCache(
  value: StoreNode,
  parent: StoreDeltaCache,
  key: string | number,
  path: (string | number)[],
): void {
  const cacheNode = parent[key],
    children = getStoreNodechildren(value);

  if (cacheNode && children === cacheNode.children) {
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        compareStoreWithCache(children[i]!, cacheNode.record, i, [...path, i]);
      }
    } else {
      for (const [key, child] of Object.entries(children)) {
        compareStoreWithCache(child, cacheNode.record, key, [...path, key]);
      }
    }
  } else {
    parent[key] = newCacheNode(children);
    CurrentDelta.push({ path, value });
  }
}

export function createStoreDelta<
  T extends object = Record<string | number, unknown> | unknown[],
>(): (store: T) => StoreDelta<T> {
  const cache: StoreDeltaCache = {};

  return (store: T) => {
    CurrentDelta = [];
    $TRACK in store && compareStoreWithCache(store, cache, "root", []);
    return CurrentDelta;
  };
}
