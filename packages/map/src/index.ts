import { Accessor } from "solid-js";
import { createTriggerCache } from "@solid-primitives/utils";

export type SignalMap<K, V> = Accessor<[K, V][]> & ReactiveMap<K, V>;

const WHOLE = Symbol("watch_whole");

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
  set(key: K, value: V): boolean {
    if (this.map.has(key) && this.equals(this.map.get(key)!, value)) return false;
    this.map.set(key, value);
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
  set(key: K, value: V): boolean {
    if (this.map.has(key) && this.equals(this.map.get(key)!, value)) return false;
    this.map.set(key, value);
    this.cache.dirty(key);
    return true;
  }
  delete(key: K): boolean {
    const r = this.map.delete(key);
    if (r) this.cache.dirty(key);
    return r;
  }
}

export function createMap<K, V>(
  initial?: [K, V][],
  equals?: (a: V, b: V) => boolean
): SignalMap<K, V> {
  const map = new ReactiveMap(initial, equals);
  return new Proxy(() => [...map], {
    get: (_, b) => map[b as keyof typeof map]
  }) as SignalMap<K, V>;
}

export function createWeakMap<K extends object, V>(
  initial?: [K, V][],
  equals?: (a: V, b: V) => boolean
): ReactiveWeakMap<K, V> {
  return new ReactiveWeakMap(initial, equals);
}
