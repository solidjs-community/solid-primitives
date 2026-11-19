/**
 * Shared backend for createReactiveMap and createReactiveSet.
 *
 * Each entry is a shallow store slot, so presence/value subscriptions and
 * committed/pending/optimistic visibility are owned by the existing store
 * engine. Native keys are encoded independently of enumeration order. No
 * scheduler hooks, node fields, or existing read/write paths are changed.
 *
 * Persistent insertion order and boxed raw leaves are transported by Solid's
 * shallow-store hydration protocol, including streamed patches.
 */
import type { Refreshable, StoreSetter } from "@solidjs/signals";
import { createStore, createOptimisticStore, untrack } from "solid-js";
import { normalizeCollectionInput, runCompute } from "./compute.ts";
import {
  collectionView,
  collectionWriter,
  deleteSlot,
  observeKeys,
  setEntries,
  storeOptions,
} from "./collection.ts";
import { isWeakKey, KeyAliases } from "./keys.ts";
export {
  createReactiveWeakMap,
  createReactiveWeakSet,
  type CreateReactiveWeakMapOptions,
  type CreateReactiveWeakSetOptions,
  type CreateReactiveWeakMapComputeFunction,
  type CreateReactiveWeakSetComputeFunction,
} from "./weak.ts";

export interface ReactiveCollectionOptions {
  /** Label passed to Solid's store diagnostics. */
  name?: string;
  /** Make writes tentative during Solid actions, using createOptimisticStore. */
  optimistic?: boolean;
}

export interface ReactiveCollectionComputeOptions<C> extends ReactiveCollectionOptions {
  /** Initial readable contents while the first compute is pending; copied, never mutated. */
  loadingValue?: C;
  /** Hold the SSR stream until the first computed value is available. */
  deferStream?: boolean;
  /** Solid's hydration policy; defaults to "server". */
  ssrSource?: "server" | "hybrid" | "client";
}

export type CreateReactiveMapOptions<K, V> = ReactiveCollectionComputeOptions<ReadonlyMap<K, V>>;
export type CreateReactiveSetOptions<T> = ReactiveCollectionComputeOptions<ReadonlySet<T>>;
export type CreateReactiveMapComputeFunction<K, V> = ReactiveCollectionCompute<
  Map<K, V>,
  ReadonlyMap<K, V>
>;
export type CreateReactiveSetComputeFunction<T> = ReactiveCollectionCompute<Set<T>, ReadonlySet<T>>;

export type ReactiveCollectionCompute<Draft, Result = Draft> = (
  draft: Draft,
) => void | Result | PromiseLike<void | Result> | AsyncIterable<void | Result>;

type State = Record<PropertyKey, any> & { order: Order; size: number };
type Entry<K, V> = readonly [K, V];
type Order = readonly { readonly id: number; readonly slot: string }[];

// Inherit helpers where supported, without adding a dependency on global Iterator.
const iteratorPrototype = /* @__PURE__ */ (() =>
  Object.getPrototypeOf(Object.getPrototypeOf(new Map().keys())))();

// A shallow store permanently raw-marks inserted wrappable objects. Collections
// must not change a user's object's behavior in OTHER stores. Only our frozen
// shell reaches that boundary; get() returns the original reference. Primitive
// values stay unboxed except -0, which must invalidate a +0 store node.
// Undefined stays unboxed so absent/present-undefined reads share equality.
// Existing shells are reused for unchanged values.
function box(value: unknown): unknown {
  return (value !== null && typeof value === "object") || Object.is(value, -0)
    ? Object.freeze({ value })
    : value;
}
function unbox<V>(value: any): V {
  return value !== null && typeof value === "object" ? value.value : value;
}

// Registered symbols have a portable identity, but Solid's serializer only
// handles well-known symbols. Encode registered keys as their registry name.
// Map values still follow the serializer's ordinary supported-value contract.
function boxKey(key: unknown): unknown {
  return typeof key === "symbol" ? (Symbol.keyFor(key) ?? key) : box(key);
}
/** No strong registry of absent keys: primitives/global symbols encode
 * directly; objects, functions and local symbols use a WeakMap. Never use a
 * caller's symbol as a slot: it could be one of Solid's store protocol keys. */
class KeyEncoder extends KeyAliases<State> {
  private _nextOrdinal = 0;

  _reserve(order: Order, count: number): number {
    const first = Math.max(this._nextOrdinal, (order.at(-1)?.id ?? -1) + 1);
    if (first + count > Number.MAX_SAFE_INTEGER)
      throw new RangeError("Collection insertion limit exceeded");
    this._nextOrdinal = first + count;
    return first;
  }

  _readKey<K>(state: State, slot: string): K {
    return slot.startsWith("symbol:")
      ? (Symbol.for(slot.slice(7)) as K)
      : unbox(state["k:" + slot]);
  }

  _adopt(state: State): void {
    const order = state.order;
    if (this._seen.has(order)) return;
    for (const { slot } of order) {
      const key = this._readKey(state, slot);
      if (isWeakKey(key)) this._register(key, slot);
    }
    this._seen.add(order);
  }

  override _slot(key: unknown, state: State): string {
    if (isWeakKey(key)) return super._slot(key, state);
    if (key === null) return "l:";
    if (typeof key === "symbol") return "symbol:" + Symbol.keyFor(key);
    return typeof key + ":" + String(key);
  }

  _order(order: Order): Order {
    // Locally built orders have already registered every key.
    this._seen.add(order);
    return order;
  }
}

function writeValue(state: State, slot: string, value: unknown, present: boolean): boolean {
  if (present && Object.is(unbox(state[slot]), value)) return false;
  state[slot] = box(value);
  return true;
}

class CollectionData<K, V> {
  _revision = 0;
  constructor(
    readonly _state: State,
    readonly _write: StoreSetter<State>,
    readonly _slots: KeyEncoder,
  ) {}

  _slot(key: K, state = this._state): string {
    return this._slots._slot(key, state);
  }

  _set(key: K, value: V): void {
    // Native Map/Set canonicalize negative zero, including iteration output.
    if (key === 0) key = 0 as K;
    this._write(state => {
      const slot = this._slot(key, state);
      const present = slot in state;
      if (!present) {
        const id = this._slots._reserve(state.order, 1);
        state["k:" + slot] = boxKey(key);
        state.order = this._slots._order([...state.order, { id, slot }]);
        state.size++;
      }
      if (writeValue(state, slot, value, present)) this._revision++;
    });
  }

  _delete(key: K): boolean {
    let deleted = false;
    this._write(state => {
      const slot = this._slot(key, state);
      if (!(slot in state)) return;
      deleted = true;
      this._revision++;
      state.order = this._slots._order(state.order.filter(entry => entry.slot !== slot));
      deleteSlot(state, slot);
      state.size--;
    });
    return deleted;
  }

  _clear(): void {
    this._write(state => {
      if (!state.size) return;
      this._revision++;
      for (const { slot } of state.order) deleteSlot(state, slot);
      state.order = this._slots._order([]);
      state.size = 0;
    });
  }

  _replace(entries: Iterable<Entry<K, V>>): void {
    // Materialize before writing: replacements may read this very collection.
    const incoming = new Map(entries);
    this._write(state => {
      this._revision++;
      // Resolve identities before removing metadata from the old index. The
      // encoder must never cache a half-written historical order as adopted.
      const slots = Array.from(incoming.keys(), key => this._slot(key, state));
      const retained = new Set(slots);
      for (const { slot } of state.order) {
        if (!retained.has(slot)) deleteSlot(state, slot);
      }
      let index = 0;
      for (const [key, value] of incoming) {
        const slot = slots[index++]!;
        const present = slot in state;
        if (!present) state["k:" + slot] = boxKey(key);
        writeValue(state, slot, value, present);
      }
      if (
        slots.length !== state.order.length ||
        slots.some((slot, index) => slot !== state.order[index]!.slot)
      ) {
        // A changed replacement order is a fresh iteration generation, like
        // clear/reinsert, while unchanged value and presence slots stay intact.
        const first = this._slots._reserve(state.order, slots.length);
        state.order = this._slots._order(slots.map((slot, index) => ({ id: first + index, slot })));
      }
      state.size = slots.length;
    });
  }

  _key(slot: string): K {
    // Order already tracks identity. Keys need no metadata subscription/cache.
    return untrack(() => this._slots._readKey<K>(this._state, slot));
  }

  /** Track on consumption; old orders/cursors contain slot names, never keys. */
  _iterate<R>(select: (slot: string) => R): MapIterator<R> {
    let previous: Order | undefined,
      index = 0,
      cursor = -1;
    // Native cursors have no return(): early loop exits leave them usable.
    return Object.setPrototypeOf(
      {
        next: () => {
          if (index >= 0) {
            const order = this._state.order;
            if (order !== previous) {
              let low = 0,
                high = order.length;
              while (low < high) {
                const middle = (low + high) >>> 1;
                if (order[middle]!.id <= cursor) low = middle + 1;
                else high = middle;
              }
              index = low;
              previous = order;
            }
            const entry = order[index++];
            if (entry) {
              cursor = entry.id;
              return { done: false, value: select(entry.slot) };
            }
            index = -1;
            previous = undefined;
          }
          return { done: true, value: undefined };
        },
      },
      iteratorPrototype,
    );
  }

  _keys(): MapIterator<K> {
    return this._iterate(slot => this._key(slot));
  }
}

function assertCallback(callback: unknown): void {
  if (typeof callback !== "function") throw new TypeError("callback must be a function");
}

class CollectionMap<K, V> extends Map<K, V> {
  declare readonly _data: CollectionData<K, V>;
  override get size() {
    return this._data._state.size;
  }
  override has(key: K) {
    return this._data._slot(key) in this._data._state;
  }
  override get(key: K) {
    return unbox<V | undefined>(this._data._state[this._data._slot(key)]);
  }
  override set(key: K, value: V): this {
    this._data._set(key, value);
    return this;
  }
  override delete(key: K) {
    return this._data._delete(key);
  }
  override clear() {
    this._data._clear();
  }
  override keys(): MapIterator<K> {
    return this._data._keys();
  }
  override values(): MapIterator<V> {
    return this._data._iterate(slot => unbox<V>(this._data._state[slot]));
  }
  override entries(): MapIterator<[K, V]> {
    return this._data._iterate(slot => [this._data._key(slot), unbox<V>(this._data._state[slot])]);
  }
  override [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }
  override forEach(callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
    assertCallback(callback);
    for (const [key, value] of this.entries()) Reflect.apply(callback, thisArg, [value, key, this]);
  }
}

class CollectionSet<T> extends Set<T> {
  declare readonly _data: CollectionData<T, true>;
  override get size() {
    return this._data._state.size;
  }
  override has(value: T) {
    return this._data._slot(value) in this._data._state;
  }
  override add(value: T): this {
    this._data._set(value, true);
    return this;
  }
  override delete(value: T) {
    return this._data._delete(value);
  }
  override clear() {
    this._data._clear();
  }
  override keys(): SetIterator<T> {
    return this.values();
  }
  override values(): SetIterator<T> {
    return this._data._keys();
  }
  override entries(): SetIterator<[T, T]> {
    return this._data._iterate(slot => {
      const value = this._data._key(slot);
      return [value, value];
    });
  }
  override [Symbol.iterator](): SetIterator<T> {
    return this.values();
  }
  override forEach(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) {
    assertCallback(callback);
    for (const value of this.values()) Reflect.apply(callback, thisArg, [value, value, this]);
  }
  // Native set algebra reads the receiver's internal [[SetData]]. Our native
  // superclass is only a facade, so every algebra method needs a real snapshot.
  override union<U>(other: ReadonlySetLike<U>): Set<T | U> {
    return new Set(this).union(other);
  }
  override intersection<U>(other: ReadonlySetLike<U>): Set<T & U> {
    return new Set(this).intersection(other);
  }
  override difference<U>(other: ReadonlySetLike<U>): Set<T> {
    return new Set(this).difference(other);
  }
  override symmetricDifference<U>(other: ReadonlySetLike<U>): Set<T | U> {
    return new Set(this).symmetricDifference(other);
  }
  override isSubsetOf(other: ReadonlySetLike<unknown>): boolean {
    return new Set(this).isSubsetOf(other);
  }
  override isSupersetOf(other: ReadonlySetLike<unknown>): boolean {
    return new Set(this).isSupersetOf(other);
  }
  override isDisjointFrom(other: ReadonlySetLike<unknown>): boolean {
    return new Set(this).isDisjointFrom(other);
  }
}

function createCollection<K, V, Draft, Result>(
  input: Iterable<Entry<K, V>> | ReactiveCollectionCompute<Draft, Result>,
  options: ReactiveCollectionComputeOptions<Result> | undefined,
  View: new () => Draft & { readonly _data: CollectionData<K, V> },
  entries: (result: Result) => Iterable<Entry<K, V>>,
): Refreshable<Draft> {
  const encoder = new KeyEncoder();
  const dataFor = (state: State, write = collectionWriter(state)) =>
    new CollectionData<K, V>(state, write, encoder);
  const seed: State = { order: [], size: 0 };
  const factory = options?.optimistic ? createOptimisticStore : createStore;
  const config = storeOptions(options);
  let state: State, write: StoreSetter<State>;
  if (typeof input === "function") {
    if (config.seedLoadingValue) dataFor(seed)._replace(entries(options!.loadingValue!));
    [state, write] = factory(
      draft => {
        const data = dataFor(draft);
        return runCompute(
          input,
          collectionView(View, data),
          result => data._replace(entries(result)),
          data,
        );
      },
      seed,
      config,
    );
    observeKeys(
      () => state.order,
      () => {
        untrack(() => encoder._adopt(state));
        encoder._notify();
      },
    );
  } else {
    dataFor(seed)._replace(input as Iterable<Entry<K, V>>);
    [state, write] = factory(seed, config);
  }
  return collectionView(View, dataFor(state, write));
}

/**
 * Create a shallow reactive Map with lazy, independent presence/value tracking.
 * Compute functions receive a writable draft and may mutate, return a Map,
 * await a result, or yield replacements. The default initial draft is empty.
 * External writes follow Solid's batching; draft writes are immediately readable.
 * Compute-backed maps support Solid's refresh(), loading, and hydration protocols.
 */
export function createReactiveMap<K, V>(
  value?: Iterable<readonly [K, V]>,
  options?: ReactiveCollectionOptions,
): Map<K, V>;
export function createReactiveMap<K, V>(
  value: ReactiveCollectionCompute<Map<K, V>, ReadonlyMap<K, V>>,
  options?: CreateReactiveMapOptions<K, V>,
): Refreshable<Map<K, V>>;
export function createReactiveMap<K, V>(
  value: Iterable<readonly [K, V]> | ReactiveCollectionCompute<Map<K, V>, ReadonlyMap<K, V>> = [],
  options?: CreateReactiveMapOptions<K, V>,
): Refreshable<Map<K, V>> {
  return createCollection(normalizeCollectionInput(value), options, CollectionMap<K, V>, map =>
    map.entries(),
  );
}

/**
 * Create a shallow reactive Set with a separate lazy membership node per value.
 * Compute functions receive a writable draft and may mutate, return a Set,
 * await a result, or yield replacements. The default initial draft is empty.
 * External writes follow Solid's batching; draft writes are immediately readable.
 * Compute-backed sets support Solid's refresh(), loading, and hydration protocols.
 */
export function createReactiveSet<T>(
  value?: Iterable<T>,
  options?: ReactiveCollectionOptions,
): Set<T>;
export function createReactiveSet<T>(
  value: ReactiveCollectionCompute<Set<T>, ReadonlySet<T>>,
  options?: CreateReactiveSetOptions<T>,
): Refreshable<Set<T>>;
export function createReactiveSet<T>(
  value: Iterable<T> | ReactiveCollectionCompute<Set<T>, ReadonlySet<T>> = [],
  options?: CreateReactiveSetOptions<T>,
): Refreshable<Set<T>> {
  const input = normalizeCollectionInput(value);
  return createCollection(
    typeof input === "function" ? input : setEntries(input),
    options,
    CollectionSet<T>,
    setEntries,
  );
}
