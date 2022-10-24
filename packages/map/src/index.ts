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
export class ReactiveMap<K, V> implements Map<K, V> {
  private map: Map<K, V>;
  private cache = createTriggerCache<K | typeof KEYS>();

  constructor(initial?: [K, V][], private equals = (a: V, b: V) => a === b) {
    this.map = new Map(initial);
  }

  // reads
  has(key: K): boolean {
    this.cache.track(key);
    return this.map.has(key);
  }
  get(key: K): V | undefined {
    this.cache.track(key);
    return this.map.get(key);
  }
  get size(): number {
    this.cache.track(KEYS);
    return this.map.size;
  }
  keys(): IterableIterator<K> {
    this.cache.track(KEYS);
    return this.map.keys();
  }
  values(): IterableIterator<V> {
    this.cache.track(KEYS);
    return this.map.values();
  }
  entries(): IterableIterator<[K, V]> {
    this.cache.track(KEYS);
    return this.map.entries();
  }

  // writes
  set(key: K, value: V): this {
    if (this.map.has(key)) {
      const oldV: V = this.map.get(key)!;
      if (this.equals(oldV, value)) {
        this.map.set(key, value);
        return this;
      }
    }
    this.map.set(key, value);
    this.cache.dirty(key);
    this.cache.dirty(KEYS);
    return this;
  }
  delete(key: K): boolean {
    const r = this.map.delete(key);
    if (r) {
      this.cache.dirty(key);
      this.cache.dirty(KEYS);
    }
    return r;
  }
  clear(): void {
    if (this.map.size) {
      this.map.clear();
      this.cache.dirtyAll();
    }
  }

  // callback
  forEach(callbackfn: (value: V, key: K, map: this) => void) {
    this.cache.track(KEYS);
    this.map.forEach((value, key) => callbackfn(value, key, this));
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }
  get [Symbol.toStringTag](): string {
    return this.map[Symbol.toStringTag];
  }
}

Object.setPrototypeOf(ReactiveMap.prototype, Map.prototype);

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
export class ReactiveWeakMap<K extends object, V> implements WeakMap<K, V> {
  private map: WeakMap<K, V>;
  private cache = createWeakTriggerCache<K>();

  constructor(initial?: [K, V][], private equals = (a: V, b: V) => a === b) {
    this.map = new WeakMap(initial);
  }

  has(key: K): boolean {
    this.cache.track(key);
    return this.map.has(key);
  }
  get(key: K): V | undefined {
    this.cache.track(key);
    return this.map.get(key);
  }
  set(key: K, value: V): this {
    if (this.map.has(key)) {
      const oldV: V = this.map.get(key)!;
      if (this.equals(oldV, value)) {
        this.map.set(key, value);
        return this;
      }
    }
    this.map.set(key, value);
    this.cache.dirty(key);
    return this;
  }
  delete(key: K): boolean {
    const r = this.map.delete(key);
    if (r) this.cache.dirty(key);
    return r;
  }

  get [Symbol.toStringTag](): string {
    return this.map[Symbol.toStringTag];
  }
}

Object.setPrototypeOf(ReactiveWeakMap.prototype, WeakMap.prototype);

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
