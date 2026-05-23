import { createLazyMemo } from "@solid-primitives/memo";
import { $PROXY, $TRACK, type Accessor, DEV, runWithOwner, untrack, snapshot } from "solid-js";
import { isServer } from "@solidjs/web";

// Indexable by string or number keys — matches what Solid stores can wrap.
type Static<T = unknown> = { [K in number | string]: T } | T[];

// Typed iterator that preserves numeric keys for arrays vs. string keys for objects.
// Object.entries() returns [string, T][] even for arrays, losing the numeric key type,
// so arrays are iterated manually.
function* entries<T extends Static>(
  obj: T,
): IterableIterator<T extends any[] ? [number, T[number]] : [keyof T, T[keyof T]]> {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      // @ts-ignore
      yield [i, obj[i]!];
    }
  } else {
    // @ts-ignore
    yield* Object.entries(obj)[Symbol.iterator]();
  }
}

// A store node is any object that Solid has wrapped with a reactive proxy ($TRACK marks it).
type StoreNode = Record<typeof $TRACK, unknown> & Static;
// The set of direct store-node children of a given node (non-store leaf values are excluded).
type StoreNodeChildren = Static<StoreNode>;

// One lazy memo per store node, keyed by node identity. The memo re-runs whenever the node's
// structure changes ([$TRACK] subscription) and returns the current set of child store nodes.
// Detached from any owner so it lives as long as the node is reachable, then self-disposes.
const StoreNodeChildrenCache = new WeakMap<StoreNode, Accessor<StoreNodeChildren>>();

// Returns the reactive snapshot of a node's direct store-node children.
// Uses a lazy memo so the computation is only created once per node, and only runs when read.
function getStoreNodechildren(node: StoreNode): StoreNodeChildren {
  let signal = StoreNodeChildrenCache.get(node);

  if (!signal) {
    const isArray = Array.isArray(node);

    // runWithOwner(null) detaches the memo from any current reactive owner so it won't be
    // disposed when a caller's effect re-runs. It self-disposes when it has no subscribers.
    signal = runWithOwner(null, () =>
      createLazyMemo(() => {
        // Subscribe to structural changes (key additions/removals) on this node.
        node[$TRACK];
        // snapshot() inside untrack() gives us the plain key list without subscribing to
        // individual property signals — we only want to know which keys exist, not their values.
        const unwrapped = untrack(() => snapshot(node));
        const children: StoreNodeChildren = isArray ? [] : {};
        for (const [key, child] of entries(unwrapped)) {
          let childNode: any;
          if (
            child != null &&
            typeof child === "object" &&
            // Prefer the proxy stored on the plain value ($PROXY), falling back to reading the
            // key through the live store proxy (which re-wraps nested objects on access).
            ((childNode = (child as any)[$PROXY]) ||
              ((childNode = untrack(() => node[key as any])) && $TRACK in childNode))
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

export type AllNestedObjects<T> = T extends Static<infer U> ? AllNestedObjects<U> | T : never;

export type NestedUpdate<T> = {
  path: (string | number)[];
  value: AllNestedObjects<T>;
};

// Per-node cache entry: the children snapshot from the last getDelta() call, plus a
// recursively-shaped record mirroring the same structure so we can walk the tree.
type StoreUpdateCache = {
  [K in string | number]: {
    children: StoreNodeChildren;
    record: StoreUpdateCache;
  };
};

// Module-level globals, reset at the start of every getDelta() call.
// Safe because JS is single-threaded — no two calls can interleave.
let CurrentUpdates!: NestedUpdate<any>[];
let SeenNodes!: WeakSet<StoreNode>;

// Builds a fresh cache entry for a node that was added or changed.
// Recursively pre-populates children so future calls can diff them.
function newCacheNode(children: StoreNodeChildren): StoreUpdateCache[number] {
  const record: StoreUpdateCache = { ...children } as any;

  for (const [key, node] of entries(children)) {
    if (SeenNodes.has(node)) continue; // guard against circular references
    SeenNodes.add(node);
    record[key] = newCacheNode(getStoreNodechildren(node));
  }

  return { children, record };
}

// Walks the store tree, diffing each node against its cached snapshot.
// A node is "changed" when its children reference differs from the cached one —
// getStoreNodechildren() returns a stable reference when nothing has changed,
// so a strict equality check is sufficient and cheap.
// When a change is found, the whole subtree is re-cached and reported as a single
// update at the shallowest changed node (so leaf changes inside an object are reported
// as one update on the parent object, not one per leaf).
function compareStoreWithCache(
  node: StoreNode,
  parent: StoreUpdateCache,
  key: string | number,
  path: (string | number)[],
): void {
  if (SeenNodes.has(node)) return; // guard against circular references
  SeenNodes.add(node);

  const cacheNode = parent[key],
    children = getStoreNodechildren(node);

  if (cacheNode && children === cacheNode.children) {
    // Node itself is unchanged; recurse to check its children.
    for (const [key, child] of entries(children)) {
      compareStoreWithCache(child, cacheNode.record, key, [...path, key]);
    }
  } else {
    // Node is new or its structure changed — record it and rebuild its subtree cache.
    parent[key] = newCacheNode(children);
    CurrentUpdates.push({ path, value: node });
  }
}

/**
 * Creates a function for tracking and capturing updates to a {@link store}.
 *
 * Each execution of the returned function will return an array of updates to the store since the last execution.
 *
 * @param store - The store to track.
 * @returns A function that returns an array of updates to the store since the last execution.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#captureStoreUpdates
 *
 * @example
 * ```ts
 * const [state, setState] = createStore({ todos: [] });
 *
 * const getDelta = captureStoreUpdates(state);
 *
 * getDelta(); // [{ path: [], value: { todos: [] } }]
 *
 * setState(s => { s.todos = ["foo"]; });
 *
 * getDelta(); // [{ path: ["todos"], value: ["foo"] }]
 * ```
 */
export function captureStoreUpdates<T extends Static>(store: T): () => NestedUpdate<T>[] {
  // On the server $TRACK is not present on store proxies, so we can't diff.
  // Return the whole store on the first call and nothing thereafter.
  if (isServer) {
    let init = true;
    return () => (init ? ((init = false), [{ path: [], value: store as any }]) : []);
  }

  if (!(typeof store === "object" && store !== null && $TRACK in store)) {
    if (DEV) {
      // eslint-disable-next-line no-console
      console.warn("captureStoreUpdates expects a store, got", store);
    }
    let init = true;
    return () => (init ? ((init = false), [{ path: [], value: store as any }]) : []);
  }

  // The root cache entry — "root" is a synthetic key so compareStoreWithCache can write
  // cache[key] uniformly without special-casing the top level.
  const cache: StoreUpdateCache = {};

  return () => {
    CurrentUpdates = [];
    SeenNodes = new WeakSet();

    compareStoreWithCache(store, cache, "root", []);

    return CurrentUpdates;
  };
}
