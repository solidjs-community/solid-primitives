/** Weak entries stored as ephemeron tokens in independent shallow store slots. */
import type { Refreshable, StoreSetter } from "@solidjs/signals";
import { createStore, createOptimisticStore, getOwner, onCleanup, latest, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
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
import { createWeakCollectionToken, type WeakCollectionToken } from "./weak-token.ts";
import type {
  ReactiveCollectionOptions,
  ReactiveCollectionComputeOptions,
  ReactiveCollectionCompute,
} from "./index.ts";

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

function assertWeakKey(key: unknown): asserts key is WeakKey {
  if (!isWeakKey(key)) throw new TypeError("Invalid weak collection key");
}
const read = <K extends WeakKey, V>(
  token: WeakCollectionToken<K, V> | undefined,
  key: K,
): V | undefined => token?.values.get(key);

class KeySlots<K extends WeakKey> extends KeyAliases<State> {
  private _registered = new WeakMap<K, Set<string>>();
  private _dead: string[] = [];
  _maintenance: (() => void) | undefined;
  private _registry = new FinalizationRegistry<string>(slot => {
    this._dead.push(slot);
    this._maintenance?.();
  });

  _readKey(state: State, slot: string): K | undefined {
    return (state["k:" + slot] as WeakCollectionToken<K, K> | undefined)?.ref?.deref();
  }

  _install(key: K, slot: string): void {
    this._register(key, slot);
    let installed = this._registered.get(key);
    if (!installed) this._registered.set(key, (installed = new Set()));
    if (installed.has(slot)) return;
    installed.add(slot);
    this._registry.register(key, slot);
  }

  _adopt(state: State): void {
    const marker = state.keys;
    if (this._seen.has(marker)) return;
    for (const prop of Object.keys(state))
      if (prop.startsWith("k:")) {
        const key = (state[prop] as WeakCollectionToken<K, K>).ref?.deref();
        if (key !== undefined) this._install(key, prop.slice(2));
      }
    this._seen.add(marker);
  }

  _publish(state: State): void {
    // Adopt hydrated metadata before replacing its marker. Locally registered
    // keys already have aliases, so the next insertion needs no metadata scan.
    untrack(() => this._adopt(state));
    const marker = Object.freeze({});
    this._seen.add(marker);
    state.keys = marker;
  }

  _confirm(state: State): void {
    latest(() => {
      this._dead = this._dead.filter(slot => slot in state || "k:" + slot in state);
    });
  }

  _drain(state: State, retry = false): boolean {
    // Finalizers never invoke a derived setter: that would cancel a queued
    // compute. Empty tokens are pruned at the next ordinary write/derive.
    if (!this._dead.length) return false;
    for (const slot of this._dead) deleteSlot(state, slot);
    if (!retry) this._dead.length = 0;
    this._publish(state);
    return true;
  }
}

class WeakData<K extends WeakKey, V> {
  _revision = 0;
  constructor(
    readonly _state: State,
    readonly _write: StoreSetter<State>,
    readonly _slots: KeySlots<K>,
    readonly _publishKeys = false,
    readonly _maintain = true,
  ) {}
  _has(key: K): boolean {
    // Read a harmless store property even for invalid keys so pending/error
    // behavior is consistent with other reads of a computed collection.
    if (!isWeakKey(key)) {
      void this._state.keys;
      return false;
    }
    return this._slots._slot(key, this._state) in this._state;
  }
  _get(key: K): V | undefined {
    if (!isWeakKey(key)) {
      void this._state.keys;
      return undefined;
    }
    return read<K, V>(this._state[this._slots._slot(key, this._state)], key);
  }
  _set(key: K, value: V): void {
    assertWeakKey(key);
    this._write(state => {
      if (this._maintain) this._slots._drain(state);
      this._setEntry(state, key, value);
    });
  }

  private _setEntry(state: State, key: K, value: V): void {
    const slot = this._slots._slot(key, state);
    const present = slot in state;
    if (!present) {
      state["k:" + slot] = createWeakCollectionToken(key, key);
      this._slots._install(key, slot);
      if (this._publishKeys) this._slots._publish(state);
    }
    if (!present || !Object.is(read(state[slot], key), value)) {
      state[slot] = value === undefined ? undefined : createWeakCollectionToken(key, value);
      this._revision++;
    }
  }
  _delete(key: K): boolean {
    if (!isWeakKey(key)) return false;
    let deleted = false;
    this._write(state => {
      if (this._maintain) this._slots._drain(state);
      const slot = this._slots._slot(key, state);
      if (!(slot in state)) return;
      this._deleteEntry(state, slot);
      deleted = true;
    });
    return deleted;
  }
  private _deleteEntry(state: State, slot: string): void {
    deleteSlot(state, slot);
    if (this._publishKeys) this._slots._publish(state);
    this._revision++;
  }

  _replace(source: Iterable<Pair<K, V>>): void {
    const method = source?.[Symbol.iterator];
    if (typeof method !== "function")
      throw new TypeError(
        "Weak collection replacements must be iterable; mutate the draft for native WeakMap/WeakSet inputs",
      );
    const incoming = new Map<K, V>({ [Symbol.iterator]: () => Reflect.apply(method, source, []) });
    for (const key of incoming.keys()) assertWeakKey(key);
    this._write(state => {
      if (this._maintain) this._slots._drain(state);
      for (const prop of Object.keys(state))
        if (prop.startsWith("k:")) {
          const key = (state[prop] as WeakCollectionToken<K, K>).ref?.deref();
          if (key === undefined || !incoming.has(key)) this._deleteEntry(state, prop.slice(2));
        }
      for (const [key, value] of incoming) this._setEntry(state, key, value);
    });
  }
}

// Facades live outside factory closures so initial iterables are never retained
// through a shared closure environment. Native intrinsics bypass these methods.
class WeakMapView<K extends WeakKey, V> extends WeakMap<K, V> {
  declare readonly _data: WeakData<K, V>;
  override has(key: K): boolean {
    return this._data._has(key);
  }
  override get(key: K): V | undefined {
    return this._data._get(key);
  }
  override set(key: K, value: V): this {
    this._data._set(key, value);
    return this;
  }
  override delete(key: K): boolean {
    return this._data._delete(key);
  }
}
class WeakSetView<K extends WeakKey> extends WeakSet<K> {
  declare readonly _data: WeakData<K, true>;
  override has(key: K): boolean {
    return this._data._has(key);
  }
  override add(key: K): this {
    this._data._set(key, true);
    return this;
  }
  override delete(key: K): boolean {
    return this._data._delete(key);
  }
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
  slots._maintenance = () =>
    write(state => {
      slots._drain(state);
    });
  if (getOwner())
    onCleanup(() => {
      slots._maintenance = undefined;
    });
  return result;
}

function createWeakCollection<K extends WeakKey, V, Draft, Result>(
  input: Iterable<Pair<K, V>> | ReactiveCollectionCompute<Draft, Result>,
  options: ReactiveCollectionComputeOptions<Result> | undefined,
  View: new () => Draft & { readonly _data: WeakData<K, V> },
  entries: (result: Result) => Iterable<Pair<K, V>>,
): Refreshable<Draft> {
  const slots = new KeySlots<K>();
  const seed: State = { keys: Object.freeze({}) };
  const factory = options?.optimistic ? createOptimisticStore : createStore;
  const config = storeOptions(options);
  let state: State, write: StoreSetter<State>;
  if (typeof input === "function") {
    if (options?.loadingValue !== undefined)
      new WeakData(seed, collectionWriter(seed), slots)._replace(entries(options.loadingValue));
    [state, write] = factory(
      draft => {
        let active = true;
        onCleanup(() => {
          active = false;
        });
        slots._drain(draft, true);
        const writer = collectionWriter(draft);
        const write: StoreSetter<State> = fn => {
          if (active) writer(fn);
        };
        const data = new WeakData<K, V>(draft, write, slots, true, false);
        return runCompute(
          input,
          collectionView(View, data),
          result => data._replace(entries(result)),
          data,
          () =>
            write(state => {
              if (slots._drain(state, true)) data._revision++;
            }),
          // Server drafts mutate the authoritative state directly. Effects do
          // not run there, so acknowledge only after a successful commit.
          isServer ? () => slots._confirm(draft) : undefined,
        );
      },
      seed,
      config,
    );
    observeKeys(
      () => state.keys,
      () => {
        untrack(() => slots._adopt(state));
        slots._notify();
        slots._confirm(state);
      },
    );
  } else {
    new WeakData(seed, collectionWriter(seed), slots)._replace(input as Iterable<Pair<K, V>>);
    [state, write] = options?.optimistic
      ? createMaintainedStore(seed, slots, options.name)
      : factory(seed, config);
  }
  return collectionView(View, new WeakData<K, V>(state, write, slots, false, !options?.optimistic));
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
    normalizeCollectionInput(input),
    options,
    WeakMapView<K, V>,
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
  const value = normalizeCollectionInput(input);
  return createWeakCollection(
    typeof value === "function" ? value : setEntries(value),
    options,
    WeakSetView<K>,
    setEntries,
  );
}
