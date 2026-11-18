/** Weak entries stored as ephemeron tokens in independent shallow store slots. */
import { $REFRESH, type Refreshable, type StoreSetter } from "@solidjs/signals";
import {
  createStore,
  createOptimisticStore,
  createEffect,
  getOwner,
  onCleanup,
  untrack,
} from "solid-js";
import { isServer } from "@solidjs/web";
import { collectionWriter, createAliasSlots, runCompute, type AliasSlots } from "./compute.ts";
import { createWeakCollectionToken, type WeakCollectionToken } from "./weak-token.ts";
import type { ReactiveCollectionOptions, ReactiveCollectionCompute } from "./index.ts";

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
  private aliases = new WeakMap<K, AliasSlots>();
  private notifications = new Set<() => void>();
  private seen = new WeakSet<object>();
  private registered = new WeakMap<K, Set<string>>();
  private next = 0;
  private dead: string[] = [];
  maintenance: (() => void) | undefined;
  private registry = new FinalizationRegistry<string>(slot => {
    this.dead.push(slot);
    this.maintenance?.();
  });

  private register(key: K, slot: string): void {
    const slots = this.aliases.get(key);
    if (slots?.slots.includes(slot)) return;
    if (slots) {
      slots.slots.push(slot);
      this.notifications.add(slots.notify);
    } else this.aliases.set(key, createAliasSlots(slot));
  }

  install(key: K, slot: string): void {
    this.register(key, slot);
    let installed = this.registered.get(key);
    if (!installed) this.registered.set(key, (installed = new Set()));
    if (installed.has(slot)) return;
    installed.add(slot);
    this.registry.register(key, slot);
  }

  adopt(state: State): void {
    const marker = state.keys;
    if (this.seen.has(marker)) return;
    for (const prop of Object.keys(state))
      if (prop.startsWith("k:")) {
        const key = (state[prop] as WeakCollectionToken<K, K>).ref?.deref();
        if (key !== undefined) this.install(key, prop.slice(2));
      }
    this.seen.add(marker);
  }

  notify(): void {
    for (const notify of this.notifications) notify();
    this.notifications.clear();
  }

  publish(state: State): void {
    // Adopt hydrated metadata before replacing its marker. Locally registered
    // keys already have aliases, so the next insertion needs no metadata scan.
    untrack(() => this.adopt(state));
    const marker = Object.freeze({});
    this.seen.add(marker);
    state.keys = marker;
  }

  slot(key: K, state: State): string {
    const slot = untrack(() => {
      this.adopt(state);
      const aliases = this.aliases.get(key);
      if (aliases)
        return (
          aliases.slots.find(slot => state["k:" + slot]?.ref?.deref() === key) ??
          aliases.slots.at(-1)!
        );
      const slot = "o:" + (isServer ? "s" : "c") + this.next++;
      this.register(key, slot);
      return slot;
    });
    this.aliases.get(key)!.track();
    return slot;
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
    this.publish(state);
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
        this.slots.install(key, slot);
        if (this.publishKeys) this.slots.publish(state);
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
      if (this.publishKeys) this.slots.publish(state);
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
            if (this.publishKeys) this.slots.publish(state);
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
// private backing store provides an authoritative cleanup channel;
// ordinary optimistic setters would roll that cleanup back. Keep this helper
// outside the input factory's closure environment so it cannot retain entries.
function createMaintainedStore<K extends WeakKey>(
  seed: State,
  slots: KeySlots<K>,
  name?: string,
): [State, StoreSetter<State>] {
  const [backing, write] = createStore(seed, { shallow: true, name });
  const result = untrack(() => createOptimisticStore(backing, { shallow: true, name }));
  // Update only finalized slots in the backing. Re-asking a derived
  // optimistic store would also settle unrelated live guesses in Solid 2.
  slots.maintenance = () => write(state => slots.drain(state));
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
  if (typeof input === "function" && typeof (input as any)[Symbol.iterator] !== "function") {
    if (options?.loadingValue)
      new WeakData(seed, collectionWriter(seed), slots).replace(options.loadingValue);
    [state, write] = factory(
      draft => {
        let active = true;
        onCleanup(() => {
          active = false;
        });
        slots.drain(draft);
        const writer = collectionWriter(draft);
        const write: StoreSetter<State> = fn => {
          if (active)
            writer(state => {
              slots.drain(state);
              fn(state);
            });
        };
        const data = new WeakData<K, V>(draft, write, slots, true, false);
        return runCompute(
          input,
          view(data),
          result => data.replace(entries(result)),
          data,
          () => write(() => {}),
        );
      },
      seed,
      config,
    );
    // Reserve the same owner slot on both runtimes. SSR must not read a
    // client-only source; application reads still expose source errors.
    if (getOwner())
      createEffect(() => (isServer ? undefined : state.keys), {
        effect: () => {
          untrack(() => slots.adopt(state));
          slots.notify();
        },
        error: () => {},
      });
  } else {
    new WeakData(seed, collectionWriter(seed), slots).replace(input as Iterable<Pair<K, V>>);
    [state, write] = options?.optimistic
      ? createMaintainedStore(seed, slots, options.name)
      : factory(seed, config);
  }
  return view(
    new WeakData<K, V>(state, write, slots, false, !options?.optimistic),
  ) as Refreshable<Draft>;
}

export function createReactiveWeakMap<K extends WeakKey, V>(
  input?: Iterable<Pair<K, V>>,
  options?: ReactiveCollectionOptions,
): WeakMap<K, V>;
export function createReactiveWeakMap<K extends WeakKey, V>(
  input: CreateReactiveWeakMapComputeFunction<K, V>,
  options?: CreateReactiveWeakMapOptions<K, V>,
): Refreshable<WeakMap<K, V>>;
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
  input?: Iterable<K>,
  options?: ReactiveCollectionOptions,
): WeakSet<K>;
export function createReactiveWeakSet<K extends WeakKey>(
  input: CreateReactiveWeakSetComputeFunction<K>,
  options?: CreateReactiveWeakSetOptions<K>,
): Refreshable<WeakSet<K>>;
export function createReactiveWeakSet<K extends WeakKey>(
  input: Iterable<K> | CreateReactiveWeakSetComputeFunction<K> = [],
  options?: CreateReactiveWeakSetOptions<K>,
): Refreshable<WeakSet<K>> {
  return createWeakCollection(
    typeof input === "function" && typeof (input as any)[Symbol.iterator] !== "function"
      ? input
      : setEntries(input as Iterable<K>),
    {
      ...options,
      loadingValue: options?.loadingValue && setEntries(options.loadingValue),
    },
    data => new WeakSetView(data),
    setEntries,
  );
}
