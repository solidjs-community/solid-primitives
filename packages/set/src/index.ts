import { Accessor } from "solid-js";
import { createTriggerCache, createWeakTriggerCache } from "@solid-primitives/trigger";

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
export class ReactiveSet<T> extends Set<T> {
  private cache = createTriggerCache<T | typeof KEYS>();

  constructor(values?: readonly T[] | null) {
    super();
    if (values) for (const v of values) super.add(v);
  }

  has(v: T): boolean {
    this.cache.track(v);
    return super.has(v);
  }
  add(v: T): this {
    if (super.has(v)) return this;
    super.add(v);
    this.cache.dirty(v);
    this.cache.dirty(KEYS);
    return this;
  }
  delete(v: T): boolean {
    const r = super.delete(v);
    if (r) {
      this.cache.dirty(v);
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
  set(list: T[]): void {
    super.clear();
    list.forEach(v => super.add(v));
    this.cache.dirtyAll();
  }
  forEach(callbackfn: (value: T, value2: T, set: this) => void) {
    this.cache.track(KEYS);
    super.forEach((value, value2) => callbackfn(value, value2, this));
  }
  values(): IterableIterator<T> {
    this.cache.track(KEYS);
    return super.values();
  }
  keys(): IterableIterator<T> {
    return this.values();
  }
  entries(): IterableIterator<[T, T]> {
    this.cache.track(KEYS);
    return super.entries();
  }
  get size(): number {
    this.cache.track(KEYS);
    return super.size;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }
  get [Symbol.toStringTag](): string {
    return super[Symbol.toStringTag];
  }
}

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
export class ReactiveWeakSet<T extends object> extends WeakSet<T> {
  private cache = createWeakTriggerCache<T>();

  constructor(values?: readonly T[] | null) {
    super();
    if (values) for (const v of values) super.add(v);
  }

  has(v: T): boolean {
    this.cache.track(v);
    return super.has(v);
  }
  add(v: T): this {
    if (super.has(v)) return this;
    super.add(v);
    this.cache.dirty(v);
    return this;
  }
  delete(v: T): boolean {
    const r = super.delete(v);
    if (r) this.cache.dirty(v);
    return r;
  }

  get [Symbol.toStringTag](): string {
    return super[Symbol.toStringTag];
  }
}

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
