import { createSignal, getListener } from "solid-js";
import { isDev } from "@solid-primitives/utils";

class _Object<T extends {}> {
  obj: Partial<T> = {};
  set<K extends keyof T>(k: K, v: T[K]): void {
    this.obj[k] = v;
  }
  get<K extends keyof T>(k: K): T[K] | undefined {
    return this.obj[k];
  }
}

export type Trigger = [track: VoidFunction, dirty: VoidFunction];

export type TriggerCache<T> = {
  track: (v: T) => void;
  dirty: (v: T) => void;
  dirtyAll: VoidFunction;
};

export type WeakTriggerCache<T extends object> = {
  track: (v: T) => void;
  dirty: (v: T) => void;
};

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
export const createTrigger: () => Trigger = isDev
  ? () => createSignal(undefined, { equals: false, name: "trigger" })
  : () => createSignal(undefined, { equals: false });

function dirtyTriggerCache<T>(
  this: WeakMap<any, Trigger> | _Object<Record<any, Trigger>>,
  key: T
): void {
  const trigger = this.get(key);
  if (trigger) trigger[1]();
}

function trackTriggerCache<T>(
  this: WeakMap<any, Trigger> | _Object<Record<any, Trigger>>,
  key: T
): Trigger {
  let trigger = this.get(key);
  if (!trigger) {
    trigger = createTrigger();
    this.set(key, trigger);
  }
  trigger[0]();
  return trigger;
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
export function createTriggerCache<T>(): TriggerCache<T> {
  const mapCache = new _Object<Record<T extends PropertyKey ? T : never, Trigger>>();
  const cache = new WeakMap<T extends object ? T : never, Trigger>();
  const triggers = new Set<VoidFunction>();
  return {
    dirty(v) {
      dirtyTriggerCache.call(v instanceof Object ? cache : mapCache, v);
    },
    dirtyAll: triggers.forEach.bind(triggers, f => f()),
    track(v) {
      if (!getListener()) return;
      const trigger = trackTriggerCache.call(v instanceof Object ? cache : mapCache, v);
      triggers.add(trigger[1]);
    }
  };
}

/**
 * Set listeners in reactive computations and then trigger them when you want. Cache trackers by a `key`.
 * @returns `{ track, dirty }` functions
 * `track` and `dirty` are called with a `key` so that each tracker will trigger an update only when his individual `key` would get marked as dirty.
 * @example
 * const { track, dirty } = createWeakTriggerCache()
 * createEffect(() => {
 *    track(1)
 *    ...
 * })
 * // later
 * dirty(1)
 * // this won't cause an update:
 * dirty(2)
 */
export function createWeakTriggerCache<T extends object>(): WeakTriggerCache<T> {
  const cache = new WeakMap<T, Trigger>();
  return {
    dirty: dirtyTriggerCache.bind(cache),
    track(v) {
      if (!getListener()) return;
      trackTriggerCache.call(cache, v);
    }
  };
}
