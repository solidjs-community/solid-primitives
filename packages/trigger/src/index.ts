import { createSignal, getListener, onCleanup, SignalOptions, DEV } from "solid-js";
import { isServer } from "solid-js/web";
import { noop } from "@solid-primitives/utils";

export type Trigger = [track: VoidFunction, dirty: VoidFunction];

const triggerOptions: SignalOptions<any> =
  !isServer && DEV ? { equals: false, name: "trigger" } : { equals: false };
const triggerCacheOptions: SignalOptions<any> =
  !isServer && DEV ? { equals: false, internal: true } : triggerOptions;

/**
 * Set listeners in reactive computations and then trigger them when you want.
 * @returns `[track function, dirty function]`
 * @example
 * const [track, dirty] = createTrigger()
 * createEffect(() => {
 *    track()
 *    ...
 * })
 * // later
 * dirty()
 */
export function createTrigger(): Trigger {
  if (isServer) {
    return [noop, noop];
  }
  return createSignal(undefined, triggerOptions);
}

export class TriggerCache<T> {
  #map: Map<
    T,
    {
      // track
      $(): void;
      // dirty
      $$(): void;
      // n of listeners
      n: number;
    }
  >;

  constructor(mapConstructor: WeakMapConstructor | MapConstructor = Map) {
    this.#map = new (mapConstructor as MapConstructor)();
  }

  dirty(key: T) {
    if (isServer) return;
    this.#map.get(key)?.$$();
  }

  dirtyAll() {
    if (isServer) return;
    for (const trigger of this.#map.values()) trigger.$$();
  }

  track(key: T) {
    if (!getListener()) return;
    let trigger = this.#map.get(key);
    if (!trigger) {
      const [$, $$] = createSignal(undefined, triggerCacheOptions);
      this.#map.set(key, (trigger = { $, $$, n: 1 }));
    } else trigger.n++;
    onCleanup(() => {
      // remove the trigger when no one is listening to it
      if (trigger!.n-- === 1)
        // microtask is to avoid removing the trigger used by a single listener
        queueMicrotask(() => trigger!.n === 0 && this.#map.delete(key));
    });
    trigger.$();
  }
}

/**
 * Creates a cache of triggers that can be used to mark dirty only specific keys.
 *
 * Cache is a `Map` or `WeakMap` depending on the `mapConstructor` argument. (default: `Map`)
 *
 * If `mapConstructor` is `WeakMap` then the cache will be weak and the keys will be garbage collected when they are no longer referenced.
 *
 * Trigger signals added to the cache only when tracked under a computation,
 * and get deleted from the cache when they are no longer tracked.
 *
 * @returns a tuple of `[track, dirty]` functions
 *
 * `track` and `dirty` are called with a `key` so that each tracker will trigger an update only when his individual `key` would get marked as dirty.
 * @example
 * const [track, dirty] = createTriggerCache()
 * createEffect(() => {
 *    track(1)
 *    ...
 * })
 * // later
 * dirty(1)
 * // this won't cause an update:
 * dirty(2)
 */
export function createTriggerCache<T>(
  mapConstructor: WeakMapConstructor | MapConstructor = Map,
): [track: (key: T) => void, dirty: (key: T) => void, dirtyAll: () => void] {
  const map = new TriggerCache(mapConstructor);
  return [map.track.bind(map), map.dirty.bind(map), map.dirtyAll.bind(map)];
}
