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
import { advance, build, insert, remove, seek, type Order, type OrderNode } from "./order.js";
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

const sameKey = (a: unknown, b: unknown) => a === b || (a !== a && b !== b);

// A shallow store permanently raw-marks inserted wrappable objects. Collections
// must not change a user's object's behavior in OTHER stores. Only our frozen
// shell reaches that boundary; get() returns the original reference. Primitive
// values stay unboxed, preserving get(missing) === get(present-undefined) at
// the subscription-node level. Existing shells are reused for unchanged values.
function box(value: unknown): unknown {
  return value !== null && typeof value === "object" ? Object.freeze({ value }) : value;
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
function keyEncoder<K>(): (key: K, state: State) => string {
  const objects = new WeakMap<WeakKey, string[]>();
  const seen = new WeakSet<OrderNode>();
  const register = (root: Order, state: State): void => {
    if (!root || seen.has(root)) return;
    const key = readKey<K>(state, root.slot);
    if (
      (typeof key === "object" && key !== null) ||
      typeof key === "function" ||
      (typeof key === "symbol" && Symbol.keyFor(key) === undefined)
    ) {
      const slots = objects.get(key as WeakKey);
      if (!slots) objects.set(key as WeakKey, [root.slot]);
      else if (!slots.includes(root.slot)) slots.push(root.slot);
    }
    register(root.left, state);
    register(root.right, state);
    seen.add(root);
  };
  let next = 0;
  return (key, state) => {
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
        // names. Visit only new persistent-tree paths, without subscribing the
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
}

class CollectionData<K, V> {
  revision = 0;
  private readonly keysByNode = new WeakMap<OrderNode, { value: K } | WeakRef<WeakKey>>();
  constructor(
    readonly store: State,
    readonly write: StoreSetter<State>,
    readonly encode: (key: K, state: State) => string,
    readonly ordinal: (root?: Order) => number,
  ) {}

  slot(key: K): string {
    return this.encode(key, this.store);
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
      const slot = this.encode(key, state);
      const present = slot in state;
      if (!present) {
        const id = this.ordinal(state.order);
        state["i:" + slot] = id;
        state["k:" + slot] = boxKey(key);
        state.order = insert(state.order, id, slot);
        state.size++;
      }
      if (!present || unbox(state[slot]) !== value) {
        state[slot] = box(value);
        this.revision++;
      }
    });
  }

  delete(key: K): boolean {
    let deleted = false;
    this.write(state => {
      const slot = this.encode(key, state);
      if (!(slot in state)) return;
      deleted = true;
      this.revision++;
      state.order = remove(state.order!, state["i:" + slot]);
      delete state[slot];
      delete state["i:" + slot];
      delete state["k:" + slot];
      state.size--;
    });
    return deleted;
  }

  clear(): void {
    this.write(state => {
      if (!state.size) return;
      this.revision++;
      const stack: OrderNode[] = [];
      seek(state.order, -1, stack);
      let entry: OrderNode | undefined;
      while ((entry = advance(stack))) {
        delete state[entry.slot];
        delete state["i:" + entry.slot];
        delete state["k:" + entry.slot];
      }
      state.order = undefined;
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
      // encoder must never cache a half-written historical tree as adopted.
      const slots = order.map(key => this.encode(key, state));
      const stack: OrderNode[] = [];
      seek(state.order, -1, stack);
      const oldOrder: K[] = [];
      let entry: OrderNode | undefined;
      while ((entry = advance(stack))) {
        const key = readKey<K>(state, entry.slot);
        oldOrder.push(key);
        if (!incoming.has(key)) {
          delete state[entry.slot];
          delete state["i:" + entry.slot];
          delete state["k:" + entry.slot];
        }
      }
      let index = 0;
      for (const value of incoming.values()) {
        const slot = slots[index++]!;
        if (!(slot in state) || unbox(state[slot]) !== value) state[slot] = box(value);
      }
      if (
        order.length !== oldOrder.length ||
        order.some((key, index) => !sameKey(key, oldOrder[index]))
      ) {
        // A changed replacement order is a fresh iteration generation, like
        // clear/reinsert, while unchanged value and presence slots stay intact.
        const first = order.length ? this.ordinal(state.order) : 0;
        state.order = build(
          order.map((key, index) => {
            const slot = slots[index]!,
              id = index === 0 ? first : this.ordinal();
            state["i:" + slot] = id;
            if (!("k:" + slot in state)) state["k:" + slot] = boxKey(key);
            return { id, slot };
          }),
        );
      }
      state.size = order.length;
    });
  }

  /** Track on consumption. Seek again only when the visible order changes. */
  *iterate<R>(select: (key: K, slot: string) => R): Generator<R, undefined, unknown> {
    let previous: Order;
    let cursor = -1;
    const stack: OrderNode[] = [];
    while (true) {
      // Read the store's current view directly. A separate memo can retain a
      // committed root while an untracked iterator sees optimistic slot data.
      const order = this.store.order;
      if (order !== previous) {
        seek(order, cursor, stack);
        previous = order;
      }
      const entry = advance(stack);
      if (!entry) return;
      cursor = entry.id;
      // The order dependency covers key identity; avoid allocating a value
      // subscription for every metadata slot just to enumerate keys.
      let reference = this.keysByNode.get(entry);
      if (!reference) {
        const key = untrack(() => readKey<K>(this.store, entry.slot));
        reference =
          (typeof key === "object" && key !== null) ||
          typeof key === "function" ||
          (typeof key === "symbol" && Symbol.keyFor(key) === undefined)
            ? new WeakRef(key as WeakKey)
            : { value: key };
        this.keysByNode.set(entry, reference);
      }
      // The current store keeps live keys strongly reachable. Historical
      // cursor stacks/cache entries must not retain deleted object keys.
      const key = reference instanceof WeakRef ? (reference.deref() as K) : reference.value;
      yield select(key, entry.slot);
    }
  }

  keys(): MapIterator<K> {
    return this.iterate(key => key);
  }
  values(): MapIterator<V> {
    return this.iterate((_, slot) => unbox<V>(this.store[slot]));
  }
  entries(): MapIterator<[K, V]> {
    return this.iterate((key, slot) => [key, unbox<V>(this.store[slot])]);
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
    return this.data.iterate(value => [value, value]);
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
  let nextOrdinal = 0;
  const ordinal = (root?: Order) => {
    if (root) {
      while (root.right) root = root.right;
      nextOrdinal = Math.max(nextOrdinal, root.id + 1);
    }
    if (nextOrdinal === Number.MAX_SAFE_INTEGER)
      throw new RangeError("Collection insertion limit exceeded");
    return nextOrdinal++;
  };
  const seed: State = { order: undefined, size: 0 };
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
      new CollectionData<K, V>(
        seed,
        fn => {
          fn(seed);
        },
        slot,
        ordinal,
      ).replace(entries(options!.loadingValue!));
    [state, write] = factory(
      draft => {
        const data = new CollectionData<K, V>(
          draft,
          fn => {
            fn(draft);
          },
          slot,
          ordinal,
        );
        const collection = view(data);
        const commit = (result: void | Result) => {
          if (result !== undefined && result !== (collection as unknown))
            data.replace(entries(result));
        };
        const result = input(collection);
        if (
          result != null &&
          typeof (result as AsyncIterable<Result>)[Symbol.asyncIterator] === "function"
        ) {
          return (async function* () {
            // The surrounding projection's draft guards each operation against
            // supersession, including producer mutations after awaits/yields.
            let yielded = false,
              revision = data.revision;
            for await (const value of result as AsyncIterable<void | Result>) {
              commit(value);
              yielded = true;
              revision = data.revision;
              yield;
            }
            // The store's SSR patch stream flushes on yields. Ensure terminal
            // draft edits (and a producer that yielded nothing) cross the wire.
            if (!yielded || revision !== data.revision) yield;
          })();
        }
        if (result != null && typeof (result as PromiseLike<Result>).then === "function") {
          return Promise.resolve(result as PromiseLike<void | Result>).then(commit);
        }
        commit(result as void | Result);
      },
      seed,
      storeOptions,
    );
  } else {
    new CollectionData<K, V>(
      seed,
      fn => {
        fn(seed);
      },
      slot,
      ordinal,
    ).replace(input);
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
