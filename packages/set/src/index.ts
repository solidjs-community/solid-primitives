import { Accessor } from "solid-js";
import { Get, createTriggerCache } from "@solid-primitives/utils";

export type SignalSet<T> = Accessor<T[]> & ReactiveSet<T>;

const WHOLE = Symbol("watch_whole");

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
export class ReactiveSet<T> {
  private s: Set<T>;
  private cache = createTriggerCache<T | typeof WHOLE>();

  constructor(initial?: T[]) {
    this.s = new Set(initial);
  }

  has(v: T): boolean {
    this.cache.track(v);
    return this.s.has(v);
  }
  add(v: T): boolean {
    if (this.s.has(v)) return false;
    this.s.add(v);
    this.cache.dirty(v);
    this.cache.dirty(WHOLE);
    return true;
  }
  delete(v: T): boolean {
    const r = this.s.delete(v);
    if (r) {
      this.cache.dirty(v);
      this.cache.dirty(WHOLE);
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
  forEach(cb: Get<T>) {
    this.s.forEach(cb);
  }
  values(): IterableIterator<T> {
    this.cache.track(WHOLE);
    return this.s.values();
  }
  get size(): number {
    this.cache.track(WHOLE);
    return this.s.size;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
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
export class ReactiveWeakSet<T extends object> {
  private s: WeakSet<T>;
  private cache = createTriggerCache<T>();

  constructor(initial?: T[]) {
    this.s = new WeakSet(initial);
  }

  has(v: T): boolean {
    this.cache.track(v);
    return this.s.has(v);
  }
  add(v: T): boolean {
    if (this.s.has(v)) return false;
    this.s.add(v);
    this.cache.dirty(v);
    return true;
  }
  delete(v: T): boolean {
    const r = this.s.delete(v);
    if (r) this.cache.dirty(v);
    return r;
  }
}

/**
 * creates an instance of a `ReactiveSet` class.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/set#createSet
 * @example
 * const set = createSet([1,1,2,3]);
 * set() // => [1,2,3] (reactive on any change)
 * set.has(2) // => true (reactive on change to the result)
 * // apply changes
 * set.add(4)
 * set.delete(2)
 * set.clear()
 */
export function createSet<T>(initial?: T[]): SignalSet<T> {
  const set = new ReactiveSet(initial);
  return new Proxy(() => [...set], {
    get: (_, b) => set[b as keyof ReactiveSet<T>]
  }) as SignalSet<T>;
}

/**
 * creates an instance of a `ReactiveWeakSet` class.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/set#createWeakSet
 * @example
 * const set = createWeakSet([1,1,2,3]);
 * set.has(2) // => true (reactive on change to the result)
 * // apply changes
 * set.add(4)
 * set.delete(2)
 */
export function createWeakSet<T extends object>(initial?: T[]): ReactiveWeakSet<T> {
  return new ReactiveWeakSet(initial);
}
