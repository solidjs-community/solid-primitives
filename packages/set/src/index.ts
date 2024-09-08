import { Accessor, batch } from "solid-js";
import { TriggerCache } from "@solid-primitives/trigger";

const $KEYS = Symbol("track-keys");

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
  #triggers = new TriggerCache<T | typeof $KEYS>();

  constructor(values?: Iterable<T> | null) {
    super();
    if (values) for (const v of values) super.add(v);
  }

  // reads
  get size(): number {
    this.#triggers.track($KEYS);
    return super.size;
  }

  has(v: T): boolean {
    this.#triggers.track(v);
    return super.has(v);
  }

  keys(): IterableIterator<T> {
    return this.values();
  }

  *values(): IterableIterator<T> {
    this.#triggers.track($KEYS);

    for (const value of super.values()) {
      yield value;
    }
  }

  *entries(): IterableIterator<[T, T]> {
    this.#triggers.track($KEYS);

    for (const entry of super.entries()) {
      yield entry;
    }
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  forEach(callbackfn: (value1: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
    this.#triggers.track($KEYS);
    super.forEach(callbackfn, thisArg);
  }

  // writes
  add(v: T): this {
    if (!super.has(v)) {
      super.add(v);
      batch(() => {
        this.#triggers.dirty(v);
        this.#triggers.dirty($KEYS);
      });
    }
    return this;
  }
  delete(v: T): boolean {
    const r = super.delete(v);
    if (r) {
      batch(() => {
        this.#triggers.dirty(v);
        this.#triggers.dirty($KEYS);
      });
    }
    return r;
  }
  clear(): void {
    if (super.size) {
      super.clear();

      batch(() => {
        this.#triggers.dirtyAll();
      });
    }
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
  #triggers = new TriggerCache<T>(WeakMap);

  constructor(values?: Iterable<T> | null) {
    super();
    if (values) for (const v of values) super.add(v);
  }

  has(v: T): boolean {
    this.#triggers.track(v);
    return super.has(v);
  }
  add(v: T): this {
    if (!super.has(v)) {
      super.add(v);
      this.#triggers.dirty(v);
    }
    return this;
  }
  delete(v: T): boolean {
    const deleted = super.delete(v);
    deleted && this.#triggers.dirty(v);
    return deleted;
  }
}

/** @deprecated */
export type SignalSet<T> = Accessor<T[]> & ReactiveSet<T>;

/** @deprecated */
export function createSet<T>(initial?: T[]): SignalSet<T> {
  const set = new ReactiveSet(initial);
  return new Proxy(() => [...set], {
    get: (_, b) => set[b as keyof ReactiveSet<T>],
  }) as SignalSet<T>;
}

/** @deprecated */
export function createWeakSet<T extends object>(initial?: T[]): ReactiveWeakSet<T> {
  return new ReactiveWeakSet(initial);
}
