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
    if (values) for (const value of values) super.add(value);
  }

  [Symbol.iterator](): SetIterator<T> {
    return this.values();
  }

  get size(): number {
    this.#triggers.track($KEYS);
    return super.size;
  }

  has(value: T): boolean {
    this.#triggers.track(value);
    return super.has(value);
  }

  keys(): SetIterator<T> {
    return this.values();
  }

  *values(): SetIterator<T> {
    this.#triggers.track($KEYS);

    for (const value of super.values()) {
      yield value;
    }
  }

  *entries(): SetIterator<[T, T]> {
    this.#triggers.track($KEYS);

    for (const entry of super.entries()) {
      yield entry;
    }
  }

  forEach(callbackfn: (value1: T, value2: T, set: Set<T>) => void, thisArg?: any): void {
    this.#triggers.track($KEYS);
    super.forEach(callbackfn, thisArg);
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
    if (!super.size) return;
    batch(() => {
      this.#triggers.dirty($KEYS);
      for (const member of super.values()) {
        this.#triggers.dirty(member);
      }
      super.clear();
    });
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
