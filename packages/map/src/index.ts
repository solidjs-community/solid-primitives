import { Accessor } from "solid-js";
import { createTriggerCache, createWeakTriggerCache } from "@solid-primitives/trigger";

const KEYS = Symbol("track-keys");

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
  private cache = createTriggerCache<K | typeof KEYS>();

  constructor(initial?: [K, V][], private equals = (a: V, b: V) => a === b) {
    super();
    if (initial) for (const v of initial) super.set(v[0], v[1]);
  }

  // reads
  has(key: K): boolean {
    this.cache.track(key);
    return super.has(key);
  }
  get(key: K): V | undefined {
    this.cache.track(key);
    return super.get(key);
  }
  get size(): number {
    this.cache.track(KEYS);
    return super.size;
  }
  keys(): IterableIterator<K> {
    this.cache.track(KEYS);
    return super.keys();
  }
  values(): IterableIterator<V> {
    this.cache.track(KEYS);
    return super.values();
  }
  entries(): IterableIterator<[K, V]> {
    this.cache.track(KEYS);
    return super.entries();
  }

  // writes
  set(key: K, value: V): this {
    if (super.has(key)) {
      const oldV: V = super.get(key)!;
      if (this.equals(oldV, value)) {
        super.set(key, value);
        return this;
      }
    }
    super.set(key, value);
    this.cache.dirty(key);
    this.cache.dirty(KEYS);
    return this;
  }
  delete(key: K): boolean {
    const r = super.delete(key);
    if (r) {
      this.cache.dirty(key);
      this.cache.dirty(KEYS);
    }
    return r;
  }
  clear(): void {
    if (super.size) {
      super.clear();
      this.cache.dirtyAll();
    }
  }

  // callback
  forEach(callbackfn: (value: V, key: K, map: this) => void) {
    this.cache.track(KEYS);
    super.forEach((value, key) => callbackfn(value, key, this));
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
  get [Symbol.toStringTag](): string {
    return super[Symbol.toStringTag];
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
  private cache = createWeakTriggerCache<K>();

  constructor(initial?: [K, V][], private equals = (a: V, b: V) => a === b) {
    super();
    if (initial) for (const v of initial) super.set(v[0], v[1]);
  }

  has(key: K): boolean {
    this.cache.track(key);
    return super.has(key);
  }
  get(key: K): V | undefined {
    this.cache.track(key);
    return super.get(key);
  }
  set(key: K, value: V): this {
    if (super.has(key)) {
      const oldV: V = super.get(key)!;
      if (this.equals(oldV, value)) {
        super.set(key, value);
        return this;
      }
    }
    super.set(key, value);
    this.cache.dirty(key);
    return this;
  }
  delete(key: K): boolean {
    const r = super.delete(key);
    if (r) this.cache.dirty(key);
    return r;
  }

  get [Symbol.toStringTag](): string {
    return super[Symbol.toStringTag];
  }
}

/** @deprecated */
export type SignalMap<K, V> = Accessor<[K, V][]> & ReactiveMap<K, V>;

/** @deprecated */
export function createMap<K, V>(
  initial?: [K, V][],
  equals?: (a: V, b: V) => boolean
): SignalMap<K, V> {
  const map = new ReactiveMap(initial, equals);
  return new Proxy(() => [...map], {
    get: (_, b) => map[b as keyof typeof map]
  }) as SignalMap<K, V>;
}

/** @deprecated */
export function createWeakMap<K extends object, V>(
  initial?: [K, V][],
  equals?: (a: V, b: V) => boolean
): ReactiveWeakMap<K, V> {
  return new ReactiveWeakMap(initial, equals);
}
