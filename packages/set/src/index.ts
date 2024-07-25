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

  constructor(values?: readonly T[] | null) {
    super();
    if (values) for (const value of values) super.add(value);
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  get size(): number {
    this.#triggers.track($KEYS);
    return super.size;
  }

  keys(): IterableIterator<T> {
    return this.values();
  }

  *values(): IterableIterator<T> {
    for (const value of super.values()) {
      this.#triggers.track(value);
      yield value;
    }
    this.#triggers.track($KEYS);
  }

  *entries(): IterableIterator<[T, T]> {
    for (const entry of super.entries()) {
      this.#triggers.track(entry[0]);
      yield entry;
    }
    this.#triggers.track($KEYS);
  }

  forEach(fn: (value1: T, value2: T, set: Set<T>) => void): void {
    this.#triggers.track($KEYS);

    for (const value of super.values()) {
      this.#triggers.track(value);
      fn(value, value, this);
    }
  }

  has(value: T): boolean {
    this.#triggers.track(value);
    return super.has(value);
  }

  add(value: T): this {
    if (!super.has(value)) {
      super.add(value);
      batch(() => {
        this.#triggers.dirty(value);
        this.#triggers.dirty($KEYS);
      });
    }

    return this;
  }

  delete(value: T): boolean {
    const result = super.delete(value);

    if (result) {
      batch(() => {
        this.#triggers.dirty(value);
        this.#triggers.dirty($KEYS);
      });
    }

    return result;
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

  constructor(values?: readonly T[] | null) {
    super();
    if (values) for (const value of values) super.add(value);
  }

  has(value: T): boolean {
    this.#triggers.track(value);
    return super.has(value);
  }

  add(value: T): this {
    if (!super.has(value)) {
      super.add(value);
      this.#triggers.dirty(value);
    }
    return this;
  }

  delete(value: T): boolean {
    const result = super.delete(value);

    result && this.#triggers.dirty(value);

    return result;
  }
}

/** @deprecated */
export type SignalSet<T> = Accessor<T[]> & ReactiveSet<T>;

/** @deprecated */
export function createSet<T>(values?: readonly T[] | null): SignalSet<T> {
  const set = new ReactiveSet(values);
  return new Proxy(() => [...set], {
    get: (_, b) => set[b as keyof ReactiveSet<T>],
  }) as SignalSet<T>;
}

/** @deprecated */
export function createWeakSet<T extends object = object>(
  values?: readonly T[] | null,
): ReactiveWeakSet<T> {
  return new ReactiveWeakSet(values);
}
