import { Accessor, createSignal, Setter } from "solid-js";
import type { BaseOptions } from "solid-js/types/reactive/signal";
import { Get, createTriggerCache } from "@solid-primitives/utils";
import { untrack } from "solid-js";

export type SignalSet<T> = Accessor<T[]> & ReactiveSet<T>;

/**
 * A reactive version of a Javascript built-in `Set` class.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/set#ReactiveSet
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
  private signal: Accessor<Set<T>>;
  private setSignal: Setter<Set<T>>;
  private cache = createTriggerCache<T>();

  constructor(initial?: T[], options?: BaseOptions) {
    this.s = new Set(initial);
    const [get, set] = createSignal(this.s, { equals: false, name: options?.name });
    this.signal = get;
    this.setSignal = set;
  }

  has(v: T): boolean {
    this.cache.track(v);
    return this.s.has(v);
  }
  add(v: T): boolean {
    const set = untrack(this.signal);
    if (set.has(v)) return false;
    set.add(v);
    this.setSignal(set);
    this.cache.dirty(v);
    return true;
  }
  delete(v: T): boolean {
    const set = untrack(this.signal);
    const r = set.delete(v);
    if (r) {
      this.setSignal(set);
      this.cache.dirty(v);
    }
    return r;
  }
  clear(): void {
    const set = untrack(this.signal);
    if (set.size) {
      set.clear();
      this.setSignal(set);
      this.cache.dirtyAll();
    }
  }
  set(list: T[]): void {
    const set = untrack(this.signal);
    set.clear();
    list.forEach(v => set.add(v));
    this.setSignal(set);
    this.cache.dirtyAll();
  }
  forEach(cb: Get<T>) {
    this.signal().forEach(cb);
  }
  values(): IterableIterator<T> {
    return this.signal().values();
  }
  get size(): number {
    return this.signal().size;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }
}

/**
 * A reactive version of a Javascript built-in `WeakSet` class.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/set#ReactiveWeakSet
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
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/set#createSet
 * @example
 * const set = createSet([1,1,2,3]);
 * set() // => [1,2,3] (reactive on any change)
 * set.has(2) // => true (reactive on change to the result)
 * // apply changes
 * set.add(4)
 * set.delete(2)
 * set.clear()
 */
export function createSet<T>(initial: T[], options?: BaseOptions): SignalSet<T> {
  const set = new ReactiveSet(initial, options);
  return new Proxy(set, {
    apply: () => [...set]
  }) as SignalSet<T>;
}

/**
 * creates an instance of a `ReactiveWeakSet` class.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/set#createWeakSet
 * @example
 * const set = createWeakSet([1,1,2,3]);
 * set.has(2) // => true (reactive on change to the result)
 * // apply changes
 * set.add(4)
 * set.delete(2)
 */
export function createWeakSet<T extends object>(initial: T[]): ReactiveWeakSet<T> {
  return new ReactiveWeakSet(initial);
}
