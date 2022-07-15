import { Accessor } from "solid-js";
import { createTriggerCache, createWeakTriggerCache } from "@solid-primitives/utils";

const KEYS = Symbol("track-keys");

/**
 * A reactive version of a Javascript built-in `Set` class.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/set#ReactiveSet
 * @example
 * const set = new ReactiveSet([1,2,3]);
 * [...set] // reactive on any change
 * set.has(2) // reactive on change to the result
 * // apply changes
 * set.add(4)
 * set.delete(2)
 * set.clear()
 */
export class ReactiveSet<T> implements Set<T> {
  private s: Set<T>;
  private cache = createTriggerCache<T | typeof KEYS>();

  constructor(values?: readonly T[] | null) {
    this.s = new Set(values);
  }

  has(v: T): boolean {
    this.cache.track(v);
    return this.s.has(v);
  }
  add(v: T): this {
    if (this.s.has(v)) return this;
    this.s.add(v);
    this.cache.dirty(v);
    this.cache.dirty(KEYS);
    return this;
  }
  delete(v: T): boolean {
    const r = this.s.delete(v);
    if (r) {
      this.cache.dirty(v);
      this.cache.dirty(KEYS);
    }
    return r;
  }
  clear(): void {
    if (this.s.size) {
      this.s.clear();
      this.cache.dirtyAll();
    }
  }
  set(list: T[]): void {
    this.s.clear();
    list.forEach(v => this.s.add(v));
    this.cache.dirtyAll();
  }
  forEach(callbackfn: (value: T, value2: T, set: this) => void) {
    this.cache.track(KEYS);
    this.s.forEach((value, value2) => callbackfn(value, value2, this));
  }
  values(): IterableIterator<T> {
    this.cache.track(KEYS);
    return this.s.values();
  }
  keys(): IterableIterator<T> {
    return this.values();
  }
  entries(): IterableIterator<[T, T]> {
    this.cache.track(KEYS);
    return this.s.entries();
  }
  get size(): number {
    this.cache.track(KEYS);
    return this.s.size;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }
  get [Symbol.toStringTag](): string {
    return this.s[Symbol.toStringTag];
  }
}

Object.setPrototypeOf(ReactiveSet.prototype, Set.prototype);

/**
 * A reactive version of a Javascript built-in `WeakSet` class.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/set#ReactiveWeakSet
 * @example
 * const set = new ReactiveWeakSet([1,2,3]);
 * set.has(2) // reactive on change to the result
 * // apply changes
 * set.add(4)
 * set.delete(2)
 */
export class ReactiveWeakSet<T extends object> implements WeakSet<T> {
  s: WeakSet<T>;
  private cache = createWeakTriggerCache<T>();

  constructor(values?: readonly T[] | null) {
    this.s = new WeakSet(values);
  }

  has(v: T): boolean {
    this.cache.track(v);
    return this.s.has(v);
  }
  add(v: T): this {
    if (this.s.has(v)) return this;
    this.s.add(v);
    this.cache.dirty(v);
    return this;
  }
  delete(v: T): boolean {
    const r = this.s.delete(v);
    if (r) this.cache.dirty(v);
    return r;
  }

  get [Symbol.toStringTag](): string {
    return this.s[Symbol.toStringTag];
  }
}

Object.setPrototypeOf(ReactiveWeakSet.prototype, WeakSet.prototype);

/** @deprecated */
export type SignalSet<T> = Accessor<T[]> & ReactiveSet<T>;

/** @deprecated */
export function createSet<T>(initial?: T[]): SignalSet<T> {
  const set = new ReactiveSet(initial);
  return new Proxy(() => [...set], {
    get: (_, b) => set[b as keyof ReactiveSet<T>]
  }) as SignalSet<T>;
}

/** @deprecated */
export function createWeakSet<T extends object>(initial?: T[]): ReactiveWeakSet<T> {
  return new ReactiveWeakSet(initial);
}
