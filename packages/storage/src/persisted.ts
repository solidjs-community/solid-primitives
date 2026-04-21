import type { Signal, StoreSetter, Store } from "solid-js";
import { createUniqueId, latest, untrack, reconcile, DEV } from "solid-js";

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

export type PersistenceOptions<T, O extends Record<string, any> | undefined> = {
  name?: string;
  serialize?: (data: T) => string;
  deserialize?: (data: string) => T;
  sync?: PersistenceSyncAPI;
} & (undefined extends O
  ? { storage?: SyncStorage | AsyncStorage }
  : {
      storage: SyncStorageWithOptions<O> | AsyncStorageWithOptions<O>;
      storageOptions?: O;
    });

export type PersistedState<S> = S extends [any, any] ? [...S, Promise<string> | string | null] : never;   

/**
 * Persists a signal, store or similar API
 *  ```ts
 *  const [getter, setter] = makePersisted(createSignal("data"), options);
 *  const options = {
 *    storage: cookieStorage,  // can be any synchronous or asynchronous storage
 *    storageOptions: { ... }, // for storages with options, otherwise not needed
 *    name: "solid-data",      // optional
 *    serialize: (value: string) => value, // optional
 *    deserialize: (data: string) => data, // optional
 *  };
 *  ```
 *  Can be used with `createSignal` or `createStore`. The initial value from the storage will overwrite the initial
 *  value of the signal or store unless overwritten. Overwriting a signal with `null` or `undefined` will remove the
 *  item from the storage.
 *
 * @param {Signal<T> | [get: Store<T>, set: St<T>]} signal - The signal or store to be persisted.
 * @param {PersistenceOptions<T, O>} options - The options for persistence.
 * @returns {PersistedState<T>} - The persisted signal or store.
 */
export function makePersisted<T>(
  signal: Signal<T>,
  options?: PersistenceOptions<T, undefined>,
): PersistedState<Signal<T>>;
export function makePersisted<T>(
  signal: [Store<T>, StoreSetter<T>],
  options?: PersistenceOptions<T, undefined>,
): PersistedState<[Store<T>, StoreSetter<T>]>;
export function makePersisted<
  T,
  O extends Record<string, any>,
>(signal: Signal<T>, options: PersistenceOptions<T, O>): PersistedState<Signal<T>>;
export function makePersisted<
  T,
  O extends Record<string, any>,
>(signal: [Store<T>, StoreSetter<T>], options: PersistenceOptions<T, O>): PersistedState<[Store<T>, StoreSetter<T>]>;
export function makePersisted<
  T,
  O extends Record<string, any> | undefined,
  S extends Signal<T> | [Store<T>, StoreSetter<T>],
>(
  signal: S,
  options: PersistenceOptions<T, O> = {} as PersistenceOptions<T, O>,
): PersistedState<S> {
  const storage = options.storage || (globalThis.localStorage as Storage | undefined);
  const name = options.name || `storage-${createUniqueId()}`;
  if (!storage) {
    return [signal[0], signal[1], null] as unknown as PersistedState<S>;
  }
  const storageOptions = (options as unknown as { storageOptions: O }).storageOptions;
  const serialize: (data: T) => string = options.serialize || JSON.stringify.bind(JSON);
  const deserialize: (data: string) => T = options.deserialize || JSON.parse.bind(JSON);
  const init = storage.getItem(name, storageOptions);
  const set =
    typeof signal[0] === "function"
      ? (data: string) => {
          try {
            const value = deserialize(data);
            (signal[1] as any)(() => value);
          } catch (e) {
            // eslint-disable-next-line no-console
            if (DEV) console.warn(e);
          }
        }
      : (data: string) => {
          try {
            const value = deserialize(data);
            (signal[1] as any)(reconcile(value, () => undefined));
          } catch (e) {
            // eslint-disable-next-line no-console
            if (DEV) console.warn(e);
          }
        };
  let unchanged = true;

  if (init instanceof Promise) init.then(data => unchanged && data && set(data));
  else if (init) set(init);

  if (typeof options.sync?.[0] === "function") {
    const get: () => T =
      typeof signal[0] === "function" ? (signal[0] as () => T) : () => signal[0] as T;
    options.sync[0]((data: PersistenceSyncData) => {
      if (
        data.key !== name ||
        (!globalThis.window && (data.url || globalThis.location.href) !== globalThis.location.href) ||
        data.newValue === serialize(untrack(get))
      ) {
        return;
      }
      set(data.newValue as string);
    });
  }

  const getter = typeof signal[0] === "function" ? signal[0] as () => T : () => signal[0] as T;
  return [
    signal[0], 
    (value: any) => untrack(() => {
      const output = signal[1](value);
      const next = latest(getter);
      if (value == null) {
        storage.removeItem(name, storageOptions);
        options.sync?.[1](name, null);
      } else {
        const serialized = serialize(next);
        storage.setItem(name, serialized, storageOptions);
        options.sync?.[1](name, serialized);
      } 
      unchanged = false;
      return output;
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
      { key, newValue, timeStamp: +new Date(), url: location.href },
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
        // eslint-disable-next-line no-console
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
