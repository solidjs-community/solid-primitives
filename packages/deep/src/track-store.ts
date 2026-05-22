import { $TRACK, type Store } from "solid-js";

/**
 * Tracks all nested changes to passed {@link store}.
 *
 * @param store a reactive store proxy
 * @returns same {@link store} that was passed in
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#trackStore
 *
 * @example
 * ```ts
 * createEffect(
 *   () => trackStore(store),
 *   () => {
 *     // this effect will run when any property of store changes
 *   }
 * );
 * ```
 */
function trackStore<T extends object>(store: Store<T>): T {
  traverseStore(store as any, new Set());
  return store;
}

function traverseStore(node: any, seen: Set<unknown>): void {
  if (!($TRACK in node) || seen.has(node)) return;
  seen.add(node);
  // subscribe to structural changes (additions/removals)
  (node as any)[$TRACK];
  // access all values through the proxy to subscribe to getters and collect children
  for (const child of Object.values(node as any)) {
    if (child != null && typeof child === "object") {
      traverseStore(child, seen);
    }
  }
}

export { trackStore };
