import { Accessor, createSignal, Setter } from "solid-js";
import type { BaseOptions } from "solid-js/types/reactive/signal";
import { Get, createTriggerCache } from "@solid-primitives/utils";

export type SignalSet<T> = Accessor<T[]> & ReactiveSet<T>;

/**
 * A reactive version of a Javascript built-in `Set` class. The data is tracked shallowly, to track changes to the data stored in the `ReactiveSet` you need to nest reactive structures.
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
  private get: Accessor<Set<T>>;
  private _set: Setter<Set<T>>;
  private cache = createTriggerCache<T>();

  constructor(initial?: T[], options?: BaseOptions) {
    this.s = new Set(initial);
    const [get, set] = createSignal(this.s, { equals: false, name: options?.name });
    this.get = get;
    this._set = set;
  }

  has(v: T): boolean {
    this.cache.track(v);
    return this.s.has(v);
  }
  add(v: T): boolean {
    const set = this.get();
    if (set.has(v)) return false;
    set.add(v);
    this._set(set);
    this.cache.dirty(v);
    return true;
  }
  delete(v: T): boolean {
    const set = this.get();
    const r = set.delete(v);
    if (r) {
      this._set(set);
      this.cache.dirty(v);
    }
    return r;
  }
  clear(): void {
    const set = this.get();
    if (set.size) {
      set.clear();
      this._set(set);
      this.cache.dirtyAll();
    }
  }
  set(list: T[]): void {
    const set = this.get();
    set.clear();
    list.forEach(v => set.add(v));
    this._set(set);
    this.cache.dirtyAll();
  }
  forEach(cb: Get<T>) {
    this.get().forEach(cb);
  }
  values(): IterableIterator<T> {
    return this.get().values();
  }
  get size(): number {
    return this.get().size;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
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
