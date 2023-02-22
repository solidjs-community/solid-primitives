import { createSignal, getListener, onCleanup, SignalOptions } from "solid-js";
import { noop } from "@solid-primitives/utils";

export type Trigger = [track: VoidFunction, dirty: VoidFunction];

const triggerOptions: SignalOptions<any> = process.env.DEV
  ? { equals: false, name: "trigger" }
  : { equals: false };
const triggerMapOptions: SignalOptions<any> = process.env.DEV
  ? { equals: false, internal: true }
  : { equals: false };

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
  if (process.env.SSR) {
    return [noop, noop];
  }
  return createSignal(undefined, triggerOptions);
}

/**
 * Set listeners in reactive computations and then trigger them when you want. Cache trackers by a `key`.
 * @returns `{ track, dirty, dirtyAll }` functions
 * `track` and `dirty` are called with a `key` so that each tracker will trigger an update only when his individual `key` would get marked as dirty.
 * @example
 * const { track, dirty } = createTriggerCache()
 * createEffect(() => {
 *    track(1)
 *    ...
 * })
 * // later
 * dirty(1)
 * // this won't cause an update:
 * dirty(2)
 */

export class TriggerMap<T> {
  #map: Map<
    T,
    {
      $: () => void;
      $$: () => void;
      n: number;
    }
  >;

  constructor(mapConstructor: WeakMapConstructor | MapConstructor = Map) {
    this.#map = new (mapConstructor as MapConstructor)();
  }

  dirty(key: T) {
    const trigger = this.#map.get(key);
    trigger && trigger.$$();
  }

  track(key: T) {
    if (!getListener()) return;
    let trigger = this.#map.get(key);
    if (!trigger) {
      const [$, $$] = createSignal(void 0, triggerMapOptions);
      this.#map.set(key, (trigger = { $, $$, n: 1 }));
    } else trigger.n++;
    trigger.$();
    onCleanup(() => trigger!.n-- === 1 && this.#map.delete(key));
  }
}
