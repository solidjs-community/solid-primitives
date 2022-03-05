import { Accessor } from "solid-js";
import { createTriggerCache, isFunction } from "@solid-primitives/utils";

export type SignalMap<K, V> = Accessor<[K, V][]> & ReactiveMap<K, V>;
export type MapSetter<V> = V extends Function
  ? (prev: V | undefined) => V
  : ((prev: V | undefined) => V) | V;

/** If value is a function – call it with a given argument – otherwise get the value as is */
function accessWith<T extends ((arg: A) => V) | V, A, V>(v: T, arg: A): V {
  return isFunction(v) ? v(arg) : v;
}

const WHOLE = Symbol("watch_whole");

/**
 * A reactive version of `Map` data structure. All the reads (like `get` or `has`) are signals, and all the writes (`delete` or `set`) will cause updates to appropriate signals.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/map#ReactiveMap
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
 * userPoints.set(user1, n => n * 10);
 */
export class ReactiveMap<K, V> {
  private map: Map<K, V>;
  private cache = createTriggerCache<K | typeof WHOLE>();

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
    this.cache.track(WHOLE);
    return this.map.size;
  }
  keys(): IterableIterator<K> {
    this.cache.track(WHOLE);
    return this.map.keys();
  }
  values(): IterableIterator<V> {
    this.cache.track(WHOLE);
    return this.map.values();
  }
  entries(): IterableIterator<[K, V]> {
    this.cache.track(WHOLE);
    return this.map.entries();
  }
  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this.entries();
  }

  // writes
  set(key: K, setter: MapSetter<V>): boolean {
    let newV: V;
    if (this.map.has(key)) {
      const oldV: V = this.map.get(key)!;
      newV = accessWith(setter, oldV);
      if (this.equals(oldV, newV)) {
        this.map.set(key, newV);
        return false;
      }
    } else newV = accessWith(setter, undefined);
    this.map.set(key, newV);
    this.cache.dirty(key);
    this.cache.dirty(WHOLE);
    return true;
  }
  delete(key: K): boolean {
    const r = this.map.delete(key);
    if (r) {
      this.cache.dirty(key);
      this.cache.dirty(WHOLE);
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
  forEach(cb: (value: V, key: K) => void) {
    this.map.forEach(cb);
  }
}

/**
 * A reactive version of `WeakMap` data structure. All the reads (like `get` or `has`) are signals, and all the writes (`delete` or `set`) will cause updates to appropriate signals.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/map#ReactiveWeakMap
 * @example
 * const userPoints = new ReactiveWeakMap<User, number>();
 * createEffect(() => {
 *    userPoints.get(user1) // => T: number | undefined (reactive)
 *    userPoints.has(user1) // => T: boolean (reactive)
 * });
 * // apply changes
 * userPoints.set(user1, 100);
 * userPoints.delete(user2);
 * userPoints.set(user1, n => n * 10);
 */
export class ReactiveWeakMap<K extends object, V> {
  private map: WeakMap<K, V>;
  private cache = createTriggerCache<K>();

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
  set(key: K, setter: MapSetter<V>): boolean {
    let newV: V;
    if (this.map.has(key)) {
      const oldV: V = this.map.get(key)!;
      newV = accessWith(setter, oldV);
      if (this.equals(oldV, newV)) {
        this.map.set(key, newV);
        return false;
      }
    } else newV = accessWith(setter, undefined);
    this.map.set(key, newV);
    this.cache.dirty(key);
    return true;
  }
  delete(key: K): boolean {
    const r = this.map.delete(key);
    if (r) this.cache.dirty(key);
    return r;
  }
}

/**
 * Creates an instance of `ReactiveMap` class.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/map#createMap
 */
export function createMap<K, V>(
  initial?: [K, V][],
  equals?: (a: V, b: V) => boolean
): SignalMap<K, V> {
  const map = new ReactiveMap(initial, equals);
  return new Proxy(() => [...map], {
    get: (_, b) => map[b as keyof typeof map]
  }) as SignalMap<K, V>;
}

/**
 * Creates an instance of `ReactiveWeakMap` class.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/map#createWeakMap
 */
export function createWeakMap<K extends object, V>(
  initial?: [K, V][],
  equals?: (a: V, b: V) => boolean
): ReactiveWeakMap<K, V> {
  return new ReactiveWeakMap(initial, equals);
}
