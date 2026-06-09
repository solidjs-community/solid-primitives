import { type Accessor } from "solid-js";
import { TriggerCache } from "@solid-primitives/trigger";

// Sentinel key for collection-level subscriptions (size, iteration order).
const $OBJECT = Symbol("track-object");

/**
 * A reactive `Map`. Read methods subscribe to reactive updates when called inside a
 * tracking scope; write methods notify only the precise subscribers affected by the change.
 *
 * Fine-grained: `has(key)` only re-runs when key presence changes; `get(key)` only
 * re-runs when that key's value changes. Iteration methods react to any structural change.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/map#ReactiveMap
 * @example
 * const userPoints = new ReactiveMap<User, number>();
 * // reads are tracked in reactive contexts (JSX, createMemo, createEffect compute)
 * const points = createMemo(() => userPoints.get(user1)); // => Accessor<number | undefined>
 * const hasUser = createMemo(() => userPoints.has(user1)); // => Accessor<boolean>
 * const count = createMemo(() => userPoints.size);         // => Accessor<number>
 * // apply changes
 * userPoints.set(user1, 100);
 * userPoints.delete(user2);
 * userPoints.set(user1, { foo: "bar" });
 */
export class ReactiveMap<K, V> extends Map<K, V> {
  // Separate caches so has() and get() subscribe independently.
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
    for (const key of super.keys()) yield key;
  }

  *values(): MapIterator<V> {
    this.#valueTriggers.track($OBJECT);
    for (const value of super.values()) yield value;
  }

  *entries(): MapIterator<[K, V]> {
    this.#keyTriggers.track($OBJECT);
    this.#valueTriggers.track($OBJECT);
    for (const entry of super.entries()) yield entry;
  }

  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this.#keyTriggers.track($OBJECT);
    this.#valueTriggers.track($OBJECT);
    super.forEach(callbackfn, thisArg);
  }

  /** Tracks key presence only — re-runs when this key is added or removed, not when its value changes. */
  has(key: K): boolean {
    this.#keyTriggers.track(key);
    return super.has(key);
  }

  /** Tracks the value for this key — re-runs when the value changes, not when unrelated keys change. */
  get(key: K): V | undefined {
    this.#valueTriggers.track(key);
    return super.get(key);
  }

  /**
   * Sets a value. Notifies key-presence subscribers only if the key is new; notifies value
   * subscribers only if the value changed by reference. Setting the same value is a no-op.
   */
  set(key: K, value: V): this {
    const hadNoKey = !super.has(key);
    const hasChanged = super.get(key) !== value;
    const result = super.set(key, value);

    if (hadNoKey || hasChanged) {
      if (hadNoKey) {
        this.#keyTriggers.dirty($OBJECT);
        this.#keyTriggers.dirty(key);
      }
      if (hasChanged) {
        this.#valueTriggers.dirty($OBJECT);
        this.#valueTriggers.dirty(key);
      }
    }

    return result;
  }

  delete(key: K): boolean {
    const isDefined = super.get(key) !== undefined;
    const result = super.delete(key);

    if (result) {
      this.#keyTriggers.dirty($OBJECT);
      this.#valueTriggers.dirty($OBJECT);
      this.#keyTriggers.dirty(key);
      // Only dirty the value trigger when the stored value was not undefined,
      // keeping get() and has() consistent in what changes they report.
      if (isDefined) this.#valueTriggers.dirty(key);
    }

    return result;
  }

  clear(): void {
    if (super.size === 0) return;
    this.#keyTriggers.dirty($OBJECT);
    this.#valueTriggers.dirty($OBJECT);
    // Notify per-key subscribers only for keys that actually existed.
    for (const key of super.keys()) {
      this.#keyTriggers.dirty(key);
      this.#valueTriggers.dirty(key);
    }
    super.clear();
  }
}

/**
 * A reactive `WeakMap`. Like `ReactiveMap` but keyed by object reference. `has(key)` and
 * `get(key)` subscribe to per-key reactive updates inside a tracking scope.
 *
 * Does not support `size`, `clear()`, or any iteration method — these are absent on the
 * native `WeakMap` and would prevent garbage collection of keys.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/map#ReactiveWeakMap
 * @example
 * const userPoints = new ReactiveWeakMap<User, number>();
 * // reads are tracked in reactive contexts (JSX, createMemo, createEffect compute)
 * const points = createMemo(() => userPoints.get(user1)); // => Accessor<number | undefined>
 * const hasUser = createMemo(() => userPoints.has(user1)); // => Accessor<boolean>
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

  /** Tracks key presence only — re-runs when this key is added or removed, not when its value changes. */
  has(key: K): boolean {
    this.#keyTriggers.track(key);
    return super.has(key);
  }

  /** Tracks the value for this key — re-runs when the value changes, not when unrelated keys change. */
  get(key: K): V | undefined {
    this.#valueTriggers.track(key);
    return super.get(key);
  }

  /** Sets a value. Notifies key-presence subscribers only if the key is new; value subscribers only if the value changed by reference. */
  set(key: K, value: V): this {
    const hadNoKey = !super.has(key);
    const hasChanged = super.get(key) !== value;
    const result = super.set(key, value);

    if (hadNoKey || hasChanged) {
      if (hadNoKey) this.#keyTriggers.dirty(key);
      if (hasChanged) this.#valueTriggers.dirty(key);
    }

    return result;
  }

  delete(key: K): boolean {
    const isDefined = super.get(key) !== undefined;
    const result = super.delete(key);

    if (result) {
      this.#keyTriggers.dirty(key);
      if (isDefined) this.#valueTriggers.dirty(key);
    }

    return result;
  }
}

/** @deprecated Use `new ReactiveMap(initial)` instead. */
export type SignalMap<K, V> = Accessor<[K, V][]> & ReactiveMap<K, V>;

/** @deprecated Use `new ReactiveMap(initial)` instead. */
export function createMap<K, V>(initial?: [K, V][]): SignalMap<K, V> {
  const map = new ReactiveMap(initial);
  return new Proxy(() => [...map], {
    get: (_, b) => map[b as keyof typeof map],
  }) as SignalMap<K, V>;
}

/** @deprecated Use `new ReactiveWeakMap(initial)` instead. */
export function createWeakMap<K extends object, V>(initial?: [K, V][]): ReactiveWeakMap<K, V> {
  return new ReactiveWeakMap(initial);
}
