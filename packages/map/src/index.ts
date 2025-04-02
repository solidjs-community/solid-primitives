import { Accessor, batch } from "solid-js";
import { TriggerCache } from "@solid-primitives/trigger";

const $OBJECT = Symbol("track-object");

/**
 * A reactive version of `Map` data structure. All the reads (like `get` or `has`) are signals, and all the writes (`delete` or `set`) will cause updates to appropriate signals.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/map#ReactiveMap
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
 * userPoints.set(user1, { foo: "bar" });
 */
export class ReactiveMap<K, V> extends Map<K, V> {
  #keyTriggers = new TriggerCache<K | typeof $OBJECT>();
  #valueTriggers = new TriggerCache<K | typeof $OBJECT>();

  [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }

  constructor(entries?: Iterable<readonly [K, V]> | null) {
    super();
    if (entries) for (const entry of entries) super.set(...entry);
  }

  get size(): number {
    this.#keyTriggers.track($OBJECT);
    return super.size;
  }

  *keys(): MapIterator<K> {
    this.#keyTriggers.track($OBJECT);

    for (const key of super.keys()) {
      yield key;
    }
  }

  *values(): MapIterator<V> {
    this.#valueTriggers.track($OBJECT);

    for (const value of super.values()) {
      yield value;
    }
  }

  *entries(): MapIterator<[K, V]> {
    this.#keyTriggers.track($OBJECT);
    this.#valueTriggers.track($OBJECT);

    for (const entry of super.entries()) {
      yield entry;
    }
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this.#keyTriggers.track($OBJECT);
    this.#valueTriggers.track($OBJECT);
    super.forEach(callbackfn, thisArg);
  }

  has(key: K): boolean {
    this.#keyTriggers.track(key);
    return super.has(key);
  }

  get(key: K): V | undefined {
    this.#valueTriggers.track(key);
    return super.get(key);
  }

  set(key: K, value: V): this {
    const hadNoKey = !super.has(key);
    const hasChanged = super.get(key) !== value;
    const result = super.set(key, value);

    if (hasChanged || hadNoKey) {
      batch(() => {
        if (hadNoKey) {
          this.#keyTriggers.dirty($OBJECT);
          this.#keyTriggers.dirty(key);
        }
        if (hasChanged) {
          this.#valueTriggers.dirty($OBJECT);
          this.#valueTriggers.dirty(key);
        }
      });
    }

    return result;
  }

  delete(key: K): boolean {
    const isDefined = super.get(key) !== undefined;
    const result = super.delete(key);

    if (result) {
      batch(() => {
        this.#keyTriggers.dirty($OBJECT);
        this.#valueTriggers.dirty($OBJECT);
        this.#keyTriggers.dirty(key);

        if (isDefined) {
          this.#valueTriggers.dirty(key);
        }
      });
    }

    return result;
  }

  clear(): void {
    if (super.size === 0) return;
    batch(() => {
      this.#keyTriggers.dirty($OBJECT);
      this.#valueTriggers.dirty($OBJECT);
      for (const key of super.keys()) {
        this.#keyTriggers.dirty(key);
        this.#valueTriggers.dirty(key);
      }

      super.clear();
    });
  }
}

/**
 * A reactive version of `WeakMap` data structure. All the reads (like `get` or `has`) are signals, and all the writes (`delete` or `set`) will cause updates to appropriate signals.
 * @param initial initial entries of the reactive map
 * @param equals signal equals function, determining if a change should cause an update
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/map#ReactiveWeakMap
 * @example
 * const userPoints = new ReactiveWeakMap<User, number>();
 * createEffect(() => {
 *    userPoints.get(user1) // => T: number | undefined (reactive)
 *    userPoints.has(user1) // => T: boolean (reactive)
 * });
 * // apply changes
 * userPoints.set(user1, 100);
 * userPoints.delete(user2);
 * userPoints.set(user1, { foo: "bar" });
 */
export class ReactiveWeakMap<K extends object, V> extends WeakMap<K, V> {
  #keyTriggers = new TriggerCache<K>(WeakMap);
  #valueTriggers = new TriggerCache<K>(WeakMap);

  constructor(entries?: Iterable<readonly [K, V]> | null) {
    super();
    if (entries) for (const entry of entries) super.set(...entry);
  }

  has(key: K): boolean {
    this.#keyTriggers.track(key);
    return super.has(key);
  }
  get(key: K): V | undefined {
    this.#valueTriggers.track(key);
    return super.get(key);
  }
  set(key: K, value: V): this {
    const hadNoKey = !super.has(key);
    const hasChanged = super.get(key) !== value;
    const result = super.set(key, value);

    if (hasChanged || hadNoKey) {
      batch(() => {
        if (hadNoKey) this.#keyTriggers.dirty(key);
        if (hasChanged) this.#valueTriggers.dirty(key);
      });
    }

    return result;
  }
  delete(key: K): boolean {
    const isDefined = super.get(key) !== undefined;
    const result = super.delete(key);

    if (result) {
      batch(() => {
        this.#keyTriggers.dirty(key);
        if (isDefined) this.#valueTriggers.dirty(key);
      });
    }

    return result;
  }
}

/** @deprecated */
export type SignalMap<K, V> = Accessor<[K, V][]> & ReactiveMap<K, V>;

/** @deprecated */
export function createMap<K, V>(initial?: [K, V][]): SignalMap<K, V> {
  const map = new ReactiveMap(initial);
  return new Proxy(() => [...map], {
    get: (_, b) => map[b as keyof typeof map],
  }) as SignalMap<K, V>;
}

/** @deprecated */
export function createWeakMap<K extends object, V>(initial?: [K, V][]): ReactiveWeakMap<K, V> {
  return new ReactiveWeakMap(initial);
}
