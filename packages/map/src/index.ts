import { Accessor, batch } from "solid-js";
import { TriggerCache } from "@solid-primitives/trigger";

const $KEYS = Symbol("track-keys");

/**
 * A reactive version of `Map` data structure. All the reads (like `get` or `has`) are signals, and all the writes (`delete` or `set`) will cause updates to appropriate signals.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/map#ReactiveMap
 * @example
 * const userPoints = new ReactiveMap<User, number>();
 * createEffect(() => {
 *    userPoints.get(user1) // => T: number | undefined (reactive)
 *    userPoints.has(user1) // => T: boolean (reactive)
 *    userPoints.size // => T: number (reactive)
 * });
 * // apply changes
 * userPoints.set(user1, 100);
 * userPoints.delete(user2);
 * userPoints.set(user1, { foo: "bar" });
 */
export class ReactiveMap<K, V> extends Map<K, V> {
  #keyTriggers = new TriggerCache<K | typeof $KEYS>();
  #valueTriggers = new TriggerCache<K>();

  constructor(entries?: readonly (readonly [K, V])[] | null) {
    super();
    if (entries) for (const entry of entries) super.set(...entry);
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  get size(): number {
    this.#keyTriggers.track($KEYS);
    return super.size;
  }

  *keys(): IterableIterator<K> {
    for (const key of super.keys()) {
      this.#keyTriggers.track(key);
      yield key;
    }

    this.#keyTriggers.track($KEYS);
  }

  *values(): IterableIterator<V> {
    for (const [key, value] of super.entries()) {
      this.#valueTriggers.track(key);
      yield value;
    }

    this.#keyTriggers.track($KEYS);
  }

  *entries(): IterableIterator<[K, V]> {
    for (const entry of super.entries()) {
      this.#keyTriggers.track(entry[0]);
      this.#valueTriggers.track(entry[0]);
      yield entry;
    }

    this.#keyTriggers.track($KEYS);
  }

  forEach(fn: (value: V, key: K, map: Map<K, V>) => void): void {
    this.#keyTriggers.track($KEYS);

    for (const [key, value] of super.entries()) {
      this.#keyTriggers.track(key);
      this.#valueTriggers.track(key);
      fn(value, key, this);
    }
  }

  has(key: K): boolean {
    this.#keyTriggers.track(key);
    return super.has(key);
  }

  get(key: K): V | undefined {
    this.#valueTriggers.track(key);
    return super.get(key);
  }

  set(key: K, value: V): this {
    const hasKey = super.has(key);
    const currentValue = super.get(key);
    const result = super.set(key, value);

    batch(() => {
      if (!hasKey) {
        this.#keyTriggers.dirty(key);
        this.#keyTriggers.dirty($KEYS);
      }

      if (value !== currentValue) this.#valueTriggers.dirty(key);
    });

    return result;
  }

  delete(key: K): boolean {
    const currentValue = super.get(key);
    const result = super.delete(key);

    if (result) {
      batch(() => {
        this.#keyTriggers.dirty(key);
        this.#keyTriggers.dirty($KEYS);
        if (currentValue !== undefined) this.#valueTriggers.dirty(key);
      });
    }

    return result;
  }

  clear(): void {
    if (super.size) {
      super.clear();
      batch(() => {
        this.#keyTriggers.dirtyAll();
        this.#valueTriggers.dirtyAll();
      });
    }
  }
}

/**
 * A reactive version of `WeakMap` data structure. All the reads (like `get` or `has`) are signals, and all the writes (`delete` or `set`) will cause updates to appropriate signals.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/map#ReactiveWeakMap
 * @example
 * const userPoints = new ReactiveWeakMap<User, number>();
 * createEffect(() => {
 *    userPoints.get(user1) // => T: number | undefined (reactive)
 *    userPoints.has(user1) // => T: boolean (reactive)
 * });
 * // apply changes
 * userPoints.set(user1, 100);
 * userPoints.delete(user2);
 * userPoints.set(user1, { foo: "bar" });
 */
export class ReactiveWeakMap<K extends object, V> extends WeakMap<K, V> {
  #keyTriggers = new TriggerCache<K>(WeakMap);
  #valueTriggers = new TriggerCache<K>(WeakMap);

  constructor(entries?: readonly [K, V][] | null) {
    super();
    if (entries) for (const entry of entries) super.set(...entry);
  }

  has(key: K): boolean {
    this.#keyTriggers.track(key);
    return super.has(key);
  }

  get(key: K): V | undefined {
    this.#valueTriggers.track(key);
    return super.get(key);
  }

  set(key: K, value: V): this {
    const hasKey = super.has(key);
    const currentValue = super.get(key);
    const result = super.set(key, value);

    batch(() => {
      if (!hasKey) this.#keyTriggers.dirty(key);
      if (value !== currentValue) this.#valueTriggers.dirty(key);
    });

    return result;
  }

  delete(key: K): boolean {
    const currentValue = super.get(key);
    const result = super.delete(key);

    if (result) {
      batch(() => {
        this.#keyTriggers.dirty(key);
        if (currentValue !== undefined) this.#valueTriggers.dirty(key);
      });
    }

    return result;
  }
}

/** @deprecated */
export type SignalMap<K, V> = Accessor<[K, V][]> & ReactiveMap<K, V>;

/** @deprecated */
export function createMap<K, V>(entries?: readonly (readonly [K, V])[] | null): SignalMap<K, V> {
  const map = new ReactiveMap(entries);
  return new Proxy(() => [...map], {
    get: (_, b) => map[b as keyof typeof map],
  }) as SignalMap<K, V>;
}

/** @deprecated */
export function createWeakMap<K extends object = object, V = any>(
  entries?: readonly [K, V][] | null,
): ReactiveWeakMap<K, V> {
  return new ReactiveWeakMap(entries);
}
