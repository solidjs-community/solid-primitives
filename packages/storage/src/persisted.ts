import type { Signal, StoreSetter, Store } from "solid-js";
import { action, createUniqueId, latest, untrack, reconcile, snapshot, DEV } from "solid-js";
import { isServer } from "@solid-primitives/utils";

export type SyncStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  [key: string]: any;
};
export type AsyncStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<unknown>;
  removeItem: (key: string) => Promise<void>;
  [key: string]: any;
};
export type SyncStorageWithOptions<O> = undefined extends O
  ? {
      getItem: (key: string, options?: O) => string | null;
      setItem: (key: string, value: string, options?: O) => void;
      removeItem: (key: string, options?: O) => void;
      [key: string]: any;
    }
  : {
      getItem: (key: string, options: O) => string | null;
      setItem: (key: string, value: string, options: O) => void;
      removeItem: (key: string, options: O) => void;
      [key: string]: any;
    };
export type AsyncStorageWithOptions<O> = undefined extends O
  ? {
      getItem: (key: string, options?: O) => Promise<string | null>;
      setItem: (key: string, value: string, options?: O) => Promise<unknown>;
      removeItem: (key: string, options?: O) => Promise<void>;
      [key: string]: any;
    }
  : {
      getItem: (key: string, options: O) => Promise<string | null>;
      setItem: (key: string, value: string, options: O) => Promise<unknown>;
      removeItem: (key: string, options: O) => Promise<void>;
      [key: string]: any;
    };

export type PersistenceSyncData = {
  key: string;
  newValue: string | null | undefined;
  timeStamp: number;
  url?: string;
};

export type PersistenceSyncCallback = (data: PersistenceSyncData) => void;

export type PersistenceSyncAPI = [
  /** subscribes to sync */
  subscribe: (subscriber: PersistenceSyncCallback) => void,
  update: (key: string, value: string | null | undefined) => void,
];

export type PersistenceOptions<
  S extends Signal<any> | [Store<any>, StoreSetter<any>] | readonly [Store<any>, StoreSetter<any>],
  O extends Record<string, any> | undefined,
  T = S extends Signal<infer T> ? T : S extends [Store<infer T>, StoreSetter<infer T>] ? T : never
> = {
  name?: string;
  serialize?: (data: T) => string;
  deserialize?: (data: string) => T;
  sync?: PersistenceSyncAPI;
  hydrated?: boolean;
  action?: (signal: S) => Parameters<typeof action>[0];
} & (undefined extends O
  ? { storage?: SyncStorage | AsyncStorage }
  : {
      storage: SyncStorageWithOptions<O> | AsyncStorageWithOptions<O>;
      storageOptions?: O;
    });

export type PersistedState<S, I = Promise<string> | string | null> = S extends [any, any] ? [...S, I] : never;

export type StoreTuple<T> = [Store<T>, StoreSetter<T>]; 

/**
 * Persists a signal, store or similar API
 * ```ts
 * const [getter, setter] = makePersisted(createSignal("data"), options);
 * const options = {
 *   storage: cookieStorage,  // can be any synchronous or asynchronous storage
 *   storageOptions: { ... }, // for storages with options, otherwise not needed
 *   name: "solid-data",      // optional
 *   serialize: (value: string) => value, // optional
 *   deserialize: (data: string) => data, // optional
 *   action: (setter: Setter<T>) => Setter<T> // optional, to be put inside action
 * };
 * ```
 * Can be used with `createSignal`, `createStore`, `createOptimistic`, or `createOptimisticStore` (for the latter
 * two, use options.action to wrap the setter). The initial value from the storage will overwrite the initial
 * value of the signal or store unless overwritten. Overwriting a signal with `null` or `undefined` will remove the
 * item from the storage.
 *
 * @param {Signal<T> | [get: Store<T>, set: StoreSetter<T>]} signal - The signal or store to be persisted.
 * @param {PersistenceOptions<Signal<T> | [get: Store<T>, set StoreSetter<T>], O>} options - The options for persistence.
 * @returns {PersistedState<T>} - The persisted signal or store.
 */
export function makePersisted<T>(
  signal: Signal<T>,
  options?: PersistenceOptions<Signal<T>, undefined>,
): PersistedState<Signal<T>>;
export function makePersisted<T>(
  signal: StoreTuple<T>,
  options?: PersistenceOptions<StoreTuple<T>, undefined>,
): PersistedState<StoreTuple<T>>;
export function makePersisted<
  T,
  O extends Record<string, any>
>(signal: Signal<T>, options: PersistenceOptions<Signal<T>, O>): PersistedState<Signal<T>>;
export function makePersisted<
  T,
  O extends Record<string, any>
>(signal: Signal<T>, options: PersistenceOptions<Signal<T>, O> & { storage: AsyncStorage | AsyncStorageWithOptions<O> }): PersistedState<Signal<T>, Promise<string> | null>;
export function makePersisted<
  T,
  O extends Record<string, any>
>(signal: StoreTuple<T>, options: PersistenceOptions<StoreTuple<T>, O>): PersistedState<StoreTuple<T>>;
export function makePersisted<
  T,
  O extends Record<string, any>
>(signal: StoreTuple<T>, options: PersistenceOptions<StoreTuple<T>, O> & { storage: AsyncStorage | AsyncStorageWithOptions<O> }): PersistedState<StoreTuple<T>, Promise<string> | null>;
export function makePersisted<
  T,
  O extends Record<string, any> | undefined,
  S extends Signal<T> | StoreTuple<T>,
>(
  signal: S,
  options: PersistenceOptions<S, O> = {} as PersistenceOptions<S, O>,
): PersistedState<S> {
  const storage = options.storage || (globalThis.localStorage as Storage | undefined);
  const name = options.name || `storage-${createUniqueId()}`;
  const actionFn = options.action && options.action(signal);
  if (actionFn) {
    (signal as any)[1] = action(actionFn) as unknown as S[1];
  }
  if (!storage) {
    return [signal[0], signal[1], null] as unknown as PersistedState<S>;
  }
  const storageOptions = (options as unknown as { storageOptions: O }).storageOptions;
  const serialize: (data: T) => string = options.serialize || JSON.stringify.bind(JSON);
  const deserialize: (data: string) => T = options.deserialize || JSON.parse.bind(JSON);
  const init = storage.getItem(name, storageOptions);
  const isSignal = typeof signal[0] === "function";
  const set = isSignal
    ? (data: string) => {
        try {
          const value = deserialize(data);
          (signal[1] as any)(() => value);
        } catch (e) {
          // oxlint-disable-next-line no-console
          if (DEV) console.warn(e);
        }
      }
    : (data: string) => {
        try {
          const value = deserialize(data);
          (signal[1] as any)(reconcile(value, () => true));
        } catch (e) {
          // oxlint-disable-next-line no-console
          if (DEV) console.warn(e);
        }
      };
  let unchanged = true;

  if (init instanceof Promise) init.then(data => unchanged && data && set(data));
  else if (init)
    // in case of hydration mismatches due to the server lacking the same initial value,
    // we want to defer the initialization by a short amount so the same state can be used
    // during hydration
    if (options.hydrated) setTimeout(() => set(init), 45);
    else set(init);

  const getter: () => T = isSignal ? (signal[0] as () => T) : () => snapshot(signal[0] as T);

  if (typeof options.sync?.[0] === "function") {
    options.sync[0]((data: PersistenceSyncData) => {
      if (
        data.key !== name ||
        (!isServer && (data.url || globalThis.location.href) !== globalThis.location.href) ||
        data.newValue === serialize(untrack(getter))
      ) {
        return;
      }
      set(data.newValue as string);
    });
  }

  const persist = () => {
    const next = untrack(() => latest(getter));
    if (next == null) {
      storage.removeItem(name, storageOptions);
      options.sync?.[1](name, null);
    } else {
      const serialized = serialize(next);
      storage.setItem(name, serialized, storageOptions);
      options.sync?.[1](name, serialized);
    }
  };
  return [
    signal[0], 
    (value: any) => untrack(() => {
      const output = signal[1](value);
      persist();
      unchanged = false;
      return output instanceof Promise ? output.then(async (result) => { await Promise.resolve(); persist(); return result; }, (err) => { persist(); throw err; }) : output;
    }),
    init,
  ] as unknown as PersistedState<S>;
}

/**
 * storageSync - synchronize localStorage
 * This does only work for { storage: localStorage }.
 * If you wish to use e.g. cookieStorage, you may use a different sync method
 */
export const storageSync: PersistenceSyncAPI = [
  (subscriber: PersistenceSyncCallback) =>
    window.addEventListener("storage", ev => subscriber(ev as PersistenceSyncData)),
  () => {
    /*storage already sends events fulfilling the PersistenceSyncData<T> conditions*/
  },
];

/**
 * messageSync - synchronize over post message or broadcast channel API
 */
export const messageSync = (channel: Window | BroadcastChannel = window): PersistenceSyncAPI => [
  (subscriber: PersistenceSyncCallback) =>
    channel.addEventListener("message", ev => {
      subscriber((ev as MessageEvent).data);
    }),
  (key, newValue) =>
    channel.postMessage(
      { key, newValue, timeStamp: Date.now(), url: location.href },
      location.origin,
    ),
];

/**
 * wsSync - syncronize persisted storage via web socket
 */
export const wsSync = (ws: WebSocket, warnOnError: boolean = !!DEV): PersistenceSyncAPI => [
  (subscriber: PersistenceSyncCallback) =>
    ws.addEventListener("message", (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        if (["key", "newValue", "timeStamp"].every(item => Object.hasOwn(data, item))) {
          subscriber(data);
        }
      } catch (e) {
        // oxlint-disable-next-line no-console
        if (warnOnError) console.warn(e);
      }
    }),
  (key, newValue) =>
    ws.send(
      JSON.stringify({
        key,
        newValue,
        timeStamp: +new Date(),
        ...(globalThis.window ? { url: location.href } : {}),
      }),
    ),
];

/**
 * multiplex arbitrary sync APIs
 *
 * ```ts
 * makePersisted(createSignal(0), { sync: multiplexSync(messageSync(bc), wsSync(ws)) })
 * ```
 */
export const multiplexSync = (...syncAPIs: PersistenceSyncAPI[]): PersistenceSyncAPI => [
  subscriber => syncAPIs.forEach(([subscribe]) => subscribe(subscriber)),
  (key, value) => syncAPIs.forEach(([_, updater]) => updater(key, value)),
];
