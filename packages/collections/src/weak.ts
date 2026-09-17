/** Weak entries stored as ephemeron tokens in independent shallow store slots. */
import { $REFRESH, type Refreshable, type StoreSetter } from "@solidjs/signals";
import {
  createStore,
  createOptimisticStore,
  createSignal,
  getOwner,
  onCleanup,
  untrack,
} from "solid-js";
import { isServer } from "@solidjs/web";
import { createWeakCollectionToken, type WeakCollectionToken } from "./weak-token.js";
import type { ReactiveCollectionOptions, ReactiveCollectionCompute } from "./index.js";

type Pair<K, V> = readonly [K, V];
type State = Record<string, any> & { keys: object };
export interface CreateReactiveWeakMapOptions<
  K extends WeakKey,
  V,
> extends ReactiveCollectionOptions {
  loadingValue?: Iterable<Pair<K, V>>;
  deferStream?: boolean;
  ssrSource?: "server" | "hybrid" | "client";
}
export interface CreateReactiveWeakSetOptions<K extends WeakKey> extends ReactiveCollectionOptions {
  loadingValue?: Iterable<K>;
  deferStream?: boolean;
  ssrSource?: "server" | "hybrid" | "client";
}
export type CreateReactiveWeakMapComputeFunction<K extends WeakKey, V> = ReactiveCollectionCompute<
  WeakMap<K, V>,
  Iterable<Pair<K, V>>
>;
export type CreateReactiveWeakSetComputeFunction<K extends WeakKey> = ReactiveCollectionCompute<
  WeakSet<K>,
  Iterable<K>
>;

const validKey = (key: unknown): key is WeakKey =>
  (typeof key === "object" && key !== null) ||
  typeof key === "function" ||
  (typeof key === "symbol" && Symbol.keyFor(key) === undefined);
const read = <K extends WeakKey, V>(
  token: WeakCollectionToken<K, V> | undefined,
  key: K,
): V | undefined => token?.values.get(key);

class KeySlots<K extends WeakKey> {
  private aliases = new WeakMap<K, string[]>();
  private seen = new WeakSet<object>();
  private next = 0;
  private dead: string[] = [];
  maintenance: (() => void) | undefined;
  private registry = new FinalizationRegistry<string>(slot => {
    this.dead.push(slot);
    this.maintenance?.();
  });

  private register(key: K, slot: string): void {
    const slots = this.aliases.get(key);
    if (slots?.includes(slot)) return;
    if (slots) slots.push(slot);
    else this.aliases.set(key, [slot]);
    this.registry.register(key, slot);
  }

  slot(key: K, state: State): string {
    return untrack(() => {
      const marker = state.keys;
      if (!this.seen.has(marker)) {
        for (const prop of Object.keys(state))
          if (prop.startsWith("k:")) {
            const key = (state[prop] as WeakCollectionToken<K, K>).ref?.deref();
            if (key !== undefined) this.register(key, prop.slice(2));
          }
        this.seen.add(marker);
      }
      const aliases = this.aliases.get(key);
      if (aliases)
        return aliases.find(slot => state["k:" + slot]?.ref?.deref() === key) ?? aliases.at(-1)!;
      const slot = "o:" + (isServer ? "s" : "c") + this.next++;
      this.register(key, slot);
      return slot;
    });
  }

  drain(state: State): void {
    // Finalizers never invoke a derived setter: that would cancel a queued
    // compute. Empty tokens are pruned at the next ordinary write/derive.
    if (!this.dead.length) return;
    for (const slot of this.dead) {
      delete state[slot];
      delete state["k:" + slot];
    }
    this.dead.length = 0;
    state.keys = Object.freeze({});
  }
}

class WeakData<K extends WeakKey, V> {
  revision = 0;
  constructor(
    readonly state: State,
    readonly write: StoreSetter<State>,
    readonly slots: KeySlots<K>,
    readonly publishKeys = false,
    readonly maintain = true,
  ) {}
  has(key: K): boolean {
    // Read a harmless store property even for invalid keys so pending/error
    // behavior is consistent with other reads of a computed collection.
    if (!validKey(key)) {
      void this.state.keys;
      return false;
    }
    return this.slots.slot(key, this.state) in this.state;
  }
  get(key: K): V | undefined {
    if (!validKey(key)) {
      void this.state.keys;
      return undefined;
    }
    return read<K, V>(this.state[this.slots.slot(key, this.state)], key);
  }
  set(key: K, value: V): void {
    if (!validKey(key)) throw new TypeError("Invalid weak collection key");
    this.write(state => {
      if (this.maintain) this.slots.drain(state);
      const slot = this.slots.slot(key, state);
      const present = slot in state;
      if (!present) {
        state["k:" + slot] = createWeakCollectionToken(key, key);
        if (this.publishKeys) state.keys = Object.freeze({});
      }
      if (!present || !Object.is(read(state[slot], key), value)) {
        state[slot] = value === undefined ? undefined : createWeakCollectionToken(key, value);
        this.revision++;
      }
    });
  }
  delete(key: K): boolean {
    if (!validKey(key)) return false;
    let deleted = false;
    this.write(state => {
      if (this.maintain) this.slots.drain(state);
      const slot = this.slots.slot(key, state);
      if (!(slot in state)) return;
      delete state[slot];
      delete state["k:" + slot];
      if (this.publishKeys) state.keys = Object.freeze({});
      this.revision++;
      deleted = true;
    });
    return deleted;
  }
  replace(source: Iterable<Pair<K, V>>): void {
    if (typeof source?.[Symbol.iterator] !== "function")
      throw new TypeError(
        "Weak collection replacements must be iterable; mutate the draft for native WeakMap/WeakSet inputs",
      );
    const incoming = new Map(source);
    for (const key of incoming.keys())
      if (!validKey(key)) throw new TypeError("Invalid weak collection key");
    this.write(state => {
      if (this.maintain) this.slots.drain(state);
      for (const prop of Object.keys(state))
        if (prop.startsWith("k:")) {
          const key = (state[prop] as WeakCollectionToken<K, K>).ref?.deref();
          if (key === undefined || !incoming.has(key)) {
            delete state[prop.slice(2)];
            delete state[prop];
            if (this.publishKeys) state.keys = Object.freeze({});
            this.revision++;
          }
        }
      const draft = new WeakData(
        state,
        fn => {
          fn(state);
        },
        this.slots,
        this.publishKeys,
        false,
      );
      for (const [key, value] of incoming) draft.set(key, value);
      this.revision += draft.revision;
    });
  }
}

// Facades live outside factory closures so initial iterables are never retained
// through a shared closure environment. Native intrinsics bypass these methods.
class WeakMapView<K extends WeakKey, V> extends WeakMap<K, V> {
  declare private data: WeakData<K, V>;
  constructor(data: WeakData<K, V>) {
    super();
    Object.defineProperty(this, "data", { value: data });
    Object.defineProperty(this, $REFRESH, { get: () => (data.state as any)[$REFRESH] });
  }
  override has(key: K): boolean {
    return this.data.has(key);
  }
  override get(key: K): V | undefined {
    return this.data.get(key);
  }
  override set(key: K, value: V): this {
    this.data.set(key, value);
    return this;
  }
  override delete(key: K): boolean {
    return this.data.delete(key);
  }
}
class WeakSetView<K extends WeakKey> extends WeakSet<K> {
  declare private data: WeakData<K, true>;
  constructor(data: WeakData<K, true>) {
    super();
    Object.defineProperty(this, "data", { value: data });
    Object.defineProperty(this, $REFRESH, { get: () => (data.state as any)[$REFRESH] });
  }
  override has(key: K): boolean {
    return this.data.has(key);
  }
  override add(key: K): this {
    this.data.set(key, true);
    return this;
  }
  override delete(key: K): boolean {
    return this.data.delete(key);
  }
}
function* setEntries<K>(values: Iterable<K>): Generator<Pair<K, true>> {
  for (const key of values) yield [key, true];
}

// Static optimism has no user derive in which to prune dead properties. A
// private maintenance projection provides an authoritative cleanup channel;
// ordinary optimistic setters would roll that cleanup back. Keep this helper
// outside the input factory's closure environment so it cannot retain entries.
function createMaintainedStore<K extends WeakKey>(
  seed: State,
  slots: KeySlots<K>,
  name?: string,
): [State, StoreSetter<State>] {
  const [version, bump] = createSignal(0);
  const result = createOptimisticStore<State>(
    draft => {
      version();
      slots.drain(draft);
    },
    seed,
    { shallow: true, key: null, name },
  );
  slots.maintenance = () => {
    bump(value => value + 1);
  };
  if (getOwner())
    onCleanup(() => {
      slots.maintenance = undefined;
    });
  return result;
}

function createWeakCollection<K extends WeakKey, V, Draft, Result>(
  input: Iterable<Pair<K, V>> | ReactiveCollectionCompute<Draft, Result>,
  options: CreateReactiveWeakMapOptions<K, V> | undefined,
  view: (data: WeakData<K, V>) => Draft,
  entries: (result: Result) => Iterable<Pair<K, V>>,
): Refreshable<Draft> {
  const slots = new KeySlots<K>();
  const seed: State = { keys: Object.freeze({}) };
  const factory = options?.optimistic ? createOptimisticStore : createStore;
  const config = {
    name: options?.name,
    shallow: true,
    key: null,
    seedLoadingValue: options?.loadingValue !== undefined,
    deferStream: options?.deferStream,
    ssrSource: options?.ssrSource,
  };
  let state: State, write: StoreSetter<State>;
  if (typeof input === "function") {
    if (options?.loadingValue)
      new WeakData(
        seed,
        fn => {
          fn(seed);
        },
        slots,
      ).replace(options.loadingValue);
    [state, write] = factory(
      draft => {
        slots.drain(draft);
        const data = new WeakData<K, V>(
          draft,
          fn => {
            fn(draft);
          },
          slots,
          true,
          false,
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
            let yielded = false,
              revision = data.revision;
            for await (const value of result as AsyncIterable<void | Result>) {
              commit(value);
              yielded = true;
              revision = data.revision;
              yield;
            }
            if (!yielded || data.revision !== revision) yield;
          })();
        }
        if (result != null && typeof (result as PromiseLike<Result>).then === "function")
          return Promise.resolve(result as PromiseLike<void | Result>).then(commit);
        commit(result as void | Result);
      },
      seed,
      config,
    );
  } else {
    new WeakData(
      seed,
      fn => {
        fn(seed);
      },
      slots,
    ).replace(input);
    [state, write] = options?.optimistic
      ? createMaintainedStore(seed, slots, options.name)
      : factory(seed, config);
  }
  return view(
    new WeakData<K, V>(state, write, slots, false, !options?.optimistic),
  ) as Refreshable<Draft>;
}

export function createReactiveWeakMap<K extends WeakKey, V>(
  input: CreateReactiveWeakMapComputeFunction<K, V>,
  options?: CreateReactiveWeakMapOptions<K, V>,
): Refreshable<WeakMap<K, V>>;
export function createReactiveWeakMap<K extends WeakKey, V>(
  input?: Iterable<Pair<K, V>>,
  options?: ReactiveCollectionOptions,
): WeakMap<K, V>;
export function createReactiveWeakMap<K extends WeakKey, V>(
  input: Iterable<Pair<K, V>> | CreateReactiveWeakMapComputeFunction<K, V> = [],
  options?: CreateReactiveWeakMapOptions<K, V>,
): Refreshable<WeakMap<K, V>> {
  return createWeakCollection(
    input,
    options,
    data => new WeakMapView(data),
    entries => entries,
  );
}

export function createReactiveWeakSet<K extends WeakKey>(
  input: CreateReactiveWeakSetComputeFunction<K>,
  options?: CreateReactiveWeakSetOptions<K>,
): Refreshable<WeakSet<K>>;
export function createReactiveWeakSet<K extends WeakKey>(
  input?: Iterable<K>,
  options?: ReactiveCollectionOptions,
): WeakSet<K>;
export function createReactiveWeakSet<K extends WeakKey>(
  input: Iterable<K> | CreateReactiveWeakSetComputeFunction<K> = [],
  options?: CreateReactiveWeakSetOptions<K>,
): Refreshable<WeakSet<K>> {
  return createWeakCollection(
    typeof input === "function" ? input : setEntries(input),
    {
      ...options,
      loadingValue: options?.loadingValue && setEntries(options.loadingValue),
    },
    data => new WeakSetView(data),
    setEntries,
  );
}
