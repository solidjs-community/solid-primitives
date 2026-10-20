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
import { $REFRESH, type Refreshable, type StoreSetter } from "@solidjs/signals";
import { createStore, createOptimisticStore, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import { collectionWriter, runCompute } from "./compute.js";
export {
  createReactiveWeakMap,
  createReactiveWeakSet,
  type CreateReactiveWeakMapOptions,
  type CreateReactiveWeakSetOptions,
  type CreateReactiveWeakMapComputeFunction,
  type CreateReactiveWeakSetComputeFunction,
} from "./weak.js";

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
const iteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(new Map().keys()));

// Separate closure environments keep input iterables and old loading seeds out
// of the long-lived ordinal/derive callbacks.
function createOrdinal(): (root?: Order) => number {
  let next = 0;
  return (order?: Order) => {
    next = Math.max(next, (order?.at(-1)?.id ?? -1) + 1);
    if (next === Number.MAX_SAFE_INTEGER)
      throw new RangeError("Collection insertion limit exceeded");
    return next++;
  };
}

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
  return typeof key === "symbol" && Symbol.keyFor(key) !== undefined
    ? Symbol.keyFor(key)
    : box(key);
}
function readKey<K>(state: State, slot: string): K {
  return slot.startsWith("symbol:") ? (Symbol.for(slot.slice(7)) as K) : unbox(state["k:" + slot]);
}

/** No strong registry of absent keys: primitives/global symbols encode
 * directly; objects, functions and local symbols use a WeakMap. Never use a
 * caller's symbol as a slot: it could be one of Solid's store protocol keys. */
function keyEncoder<K>() {
  const objects = new WeakMap<WeakKey, string[]>();
  const seen = new WeakSet<Order>();
  const register = (order: Order, state: State): void => {
    if (seen.has(order)) return;
    for (const { slot } of order) {
      const key = readKey<K>(state, slot);
      if (
        (typeof key === "object" && key !== null) ||
        typeof key === "function" ||
        (typeof key === "symbol" && Symbol.keyFor(key) === undefined)
      ) {
        const slots = objects.get(key as WeakKey);
        if (!slots) objects.set(key as WeakKey, [slot]);
        else if (!slots.includes(slot)) slots.push(slot);
      }
    }
    seen.add(order);
  };
  let next = 0;
  const encode = (key: K, state: State): string => {
    if (key === null) return "l:";
    switch (typeof key) {
      case "object":
      case "function":
      case "symbol": {
        if (typeof key === "symbol") {
          const globalKey = Symbol.keyFor(key);
          if (globalKey !== undefined) return "symbol:" + globalKey;
        }
        // Hydrated snapshots carry the authoritative key identities and slot
        // names. Adopt each visible order once, without subscribing the
        // caller to structure. This also replaces mappings made by trace runs.
        return untrack(() => {
          register(state.order, state);
          const object = key as WeakKey;
          const slots = objects.get(object);
          if (slots) {
            // Loading/held/optimistic readers can simultaneously see different
            // generations. Retain both trace and wire aliases, choosing the
            // one actually present in this reader's state.
            return (
              slots.find(slot => unbox(state["k:" + slot]) === key) ?? slots[slots.length - 1]!
            );
          }
          const slot = "o:" + (isServer ? "s" : "c") + next++;
          objects.set(object, [slot]);
          return slot;
        });
      }
      // Prefixes cannot collide with metadata or pollution-guarded names.
      default:
        return typeof key + ":" + String(key);
    }
  };
  return {
    encode,
    order: (order: Order): Order => {
      // Locally built orders already registered every key through encode().
      // Only unfamiliar hydrated orders need a scan to adopt wire identities.
      seen.add(order);
      return order;
    },
  };
}

class CollectionData<K, V> {
  revision = 0;
  constructor(
    readonly store: State,
    readonly write: StoreSetter<State>,
    readonly encoder: ReturnType<typeof keyEncoder<K>>,
    readonly ordinal: (root?: Order) => number,
  ) {}

  slot(key: K): string {
    return this.encoder.encode(key, this.store);
  }

  has(key: K): boolean {
    return this.slot(key) in this.store;
  }

  get(key: K): V | undefined {
    return unbox(this.store[this.slot(key)]);
  }

  set(key: K, value: V): void {
    // Native Map/Set canonicalize negative zero, including iteration output.
    if (key === 0) key = 0 as K;
    this.write(state => {
      const slot = this.encoder.encode(key, state);
      const present = slot in state;
      if (!present) {
        const id = this.ordinal(state.order);
        state["k:" + slot] = boxKey(key);
        state.order = this.encoder.order([...state.order, { id, slot }]);
        state.size++;
      }
      if (!present || !Object.is(unbox(state[slot]), value)) {
        state[slot] = box(value);
        this.revision++;
      }
    });
  }

  delete(key: K): boolean {
    let deleted = false;
    this.write(state => {
      const slot = this.encoder.encode(key, state);
      if (!(slot in state)) return;
      deleted = true;
      this.revision++;
      state.order = this.encoder.order(state.order.filter(entry => entry.slot !== slot));
      delete state[slot];
      delete state["k:" + slot];
      state.size--;
    });
    return deleted;
  }

  clear(): void {
    this.write(state => {
      if (!state.size) return;
      this.revision++;
      for (const { slot } of state.order) {
        delete state[slot];
        delete state["k:" + slot];
      }
      state.order = this.encoder.order([]);
      state.size = 0;
    });
  }

  replace(entries: Iterable<Entry<K, V>>): void {
    // Materialize before writing: replacements may read this very collection.
    const incoming = new Map(entries);
    this.write(state => {
      this.revision++;
      const order = [...incoming.keys()];
      // Resolve identities before removing metadata from the old index. The
      // encoder must never cache a half-written historical order as adopted.
      const slots = order.map(key => this.encoder.encode(key, state));
      const retained = new Set(slots);
      for (const { slot } of state.order) {
        if (!retained.has(slot)) {
          delete state[slot];
          delete state["k:" + slot];
        }
      }
      let index = 0;
      for (const value of incoming.values()) {
        const slot = slots[index++]!;
        if (!(slot in state) || !Object.is(unbox(state[slot]), value)) state[slot] = box(value);
      }
      if (
        slots.length !== state.order.length ||
        slots.some((slot, index) => slot !== state.order[index]!.slot)
      ) {
        // A changed replacement order is a fresh iteration generation, like
        // clear/reinsert, while unchanged value and presence slots stay intact.
        const first = order.length ? this.ordinal(state.order) : 0;
        state.order = this.encoder.order(
          order.map((key, index) => {
            const slot = slots[index]!,
              id = index === 0 ? first : this.ordinal();
            if (!("k:" + slot in state)) state["k:" + slot] = boxKey(key);
            return { id, slot };
          }),
        );
      }
      state.size = order.length;
    });
  }

  key(slot: string): K {
    // Order already tracks identity. Keys need no metadata subscription/cache.
    return untrack(() => readKey<K>(this.store, slot));
  }

  /** Track on consumption; old orders/cursors contain slot names, never keys. */
  iterate<R>(select: (slot: string) => R): MapIterator<R> {
    let previous: Order | undefined,
      index = 0,
      cursor = -1,
      done = false;
    // Native cursors have no return(): early loop exits leave them usable.
    return Object.setPrototypeOf(
      {
        next: () => {
          if (done) return { done: true, value: undefined };
          const order = this.store.order;
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
          if (!entry) {
            done = true;
            previous = undefined;
            return { done: true, value: undefined };
          }
          cursor = entry.id;
          return { done: false, value: select(entry.slot) };
        },
      },
      iteratorPrototype,
    );
  }

  keys(): MapIterator<K> {
    return this.iterate(slot => this.key(slot));
  }
  values(): MapIterator<V> {
    return this.iterate(slot => unbox<V>(this.store[slot]));
  }
  entries(): MapIterator<[K, V]> {
    return this.iterate(slot => [this.key(slot), unbox<V>(this.store[slot])]);
  }
}

class CollectionMap<K, V> extends Map<K, V> {
  declare private readonly data: CollectionData<K, V>;
  constructor(data: CollectionData<K, V>) {
    super();
    Object.defineProperty(this, "data", { value: data });
  }
  get [$REFRESH]() {
    return this.data.store[$REFRESH];
  }
  override get size() {
    return this.data.store.size;
  }
  override has(key: K) {
    return this.data.has(key);
  }
  override get(key: K) {
    return this.data.get(key);
  }
  override set(key: K, value: V): this {
    this.data.set(key, value);
    return this;
  }
  override delete(key: K) {
    return this.data.delete(key);
  }
  override clear() {
    this.data.clear();
  }
  override keys(): MapIterator<K> {
    return this.data.keys();
  }
  override values(): MapIterator<V> {
    return this.data.values();
  }
  override entries(): MapIterator<[K, V]> {
    return this.data.entries();
  }
  override [Symbol.iterator](): MapIterator<[K, V]> {
    return this.entries();
  }
  override forEach(callback: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any) {
    if (typeof callback !== "function") throw new TypeError("callback must be a function");
    for (const [key, value] of this.entries()) callback.call(thisArg, value, key, this);
  }
}

class CollectionSet<T> extends Set<T> {
  declare private readonly data: CollectionData<T, true>;
  constructor(data: CollectionData<T, true>) {
    super();
    Object.defineProperty(this, "data", { value: data });
  }
  get [$REFRESH]() {
    return this.data.store[$REFRESH];
  }
  override get size() {
    return this.data.store.size;
  }
  override has(value: T) {
    return this.data.has(value);
  }
  override add(value: T): this {
    this.data.set(value, true);
    return this;
  }
  override delete(value: T) {
    return this.data.delete(value);
  }
  override clear() {
    this.data.clear();
  }
  override keys(): SetIterator<T> {
    return this.values();
  }
  override values(): SetIterator<T> {
    return this.data.keys();
  }
  override entries(): SetIterator<[T, T]> {
    return this.data.iterate(slot => {
      const value = this.data.key(slot);
      return [value, value];
    });
  }
  override [Symbol.iterator](): SetIterator<T> {
    return this.values();
  }
  override forEach(callback: (value: T, value2: T, set: Set<T>) => void, thisArg?: any) {
    if (typeof callback !== "function") throw new TypeError("callback must be a function");
    for (const value of this.values()) callback.call(thisArg, value, value, this);
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
  view: (data: CollectionData<K, V>) => Draft,
  entries: (result: Result) => Iterable<Entry<K, V>>,
): Refreshable<Draft> {
  const slot = keyEncoder<K>();
  const ordinal = createOrdinal();
  const seed: State = { order: [], size: 0 };
  const factory = options?.optimistic ? createOptimisticStore : createStore;
  const loading = options?.loadingValue !== undefined;
  const storeOptions = {
    name: options?.name,
    shallow: true,
    key: null,
    seedLoadingValue: loading,
    deferStream: options?.deferStream,
    ssrSource: options?.ssrSource,
  };
  let state: State, write: StoreSetter<State>;
  if (typeof input === "function") {
    if (loading)
      new CollectionData<K, V>(seed, collectionWriter(seed), slot, ordinal).replace(
        entries(options!.loadingValue!),
      );
    [state, write] = factory(
      draft => {
        const data = new CollectionData<K, V>(draft, collectionWriter(draft), slot, ordinal);
        return runCompute(input, view(data), result => data.replace(entries(result)), data);
      },
      seed,
      storeOptions,
    );
  } else {
    new CollectionData<K, V>(seed, collectionWriter(seed), slot, ordinal).replace(input);
    [state, write] = factory(seed, storeOptions);
  }
  return view(new CollectionData(state, write, slot, ordinal)) as Refreshable<Draft>;
}

/**
 * Create a shallow reactive Map with lazy, independent presence/value tracking.
 * Compute functions receive a writable draft and may mutate, return a Map,
 * await a result, or yield replacements. The default initial draft is empty.
 * External writes follow Solid's batching; draft writes are immediately readable.
 * Compute-backed maps support Solid's refresh(), loading, and hydration protocols.
 */
export function createReactiveMap<K, V>(
  value: ReactiveCollectionCompute<Map<K, V>, ReadonlyMap<K, V>>,
  options?: CreateReactiveMapOptions<K, V>,
): Refreshable<Map<K, V>>;
export function createReactiveMap<K, V>(
  value?: Iterable<readonly [K, V]>,
  options?: ReactiveCollectionOptions,
): Map<K, V>;
export function createReactiveMap<K, V>(
  value: Iterable<readonly [K, V]> | ReactiveCollectionCompute<Map<K, V>, ReadonlyMap<K, V>> = [],
  options?: CreateReactiveMapOptions<K, V>,
): Refreshable<Map<K, V>> {
  return createCollection(
    value,
    options,
    data => new CollectionMap(data),
    map => map.entries(),
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
  value: ReactiveCollectionCompute<Set<T>, ReadonlySet<T>>,
  options?: CreateReactiveSetOptions<T>,
): Refreshable<Set<T>>;
export function createReactiveSet<T>(
  value?: Iterable<T>,
  options?: ReactiveCollectionOptions,
): Set<T>;
export function createReactiveSet<T>(
  value: Iterable<T> | ReactiveCollectionCompute<Set<T>, ReadonlySet<T>> = [],
  options?: CreateReactiveSetOptions<T>,
): Refreshable<Set<T>> {
  const entries = (set: Iterable<T>): Iterable<Entry<T, true>> =>
    (function* () {
      for (const key of set) yield [key, true] as const;
    })();
  return createCollection(
    typeof value === "function" ? value : entries(value),
    options,
    data => new CollectionSet(data),
    entries,
  );
}
