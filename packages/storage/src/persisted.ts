import type { Setter, Signal } from "solid-js";
import { createUniqueId, untrack } from "solid-js";
import { isServer, isDev } from "solid-js/web";
import type { SetStoreFunction, Store } from "solid-js/store";
import { reconcile } from "solid-js/store";

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
export type SyncStorageWithOptions<O> = undefined extends O ? { 
  getItem: (key: string, options?: O) => string | null;
  setItem: (key: string, value: string, options?: O) => void;
  removeItem: (key: string, options?: O) => void;
  [key: string]: any;
} : { 
  getItem: (key: string, options: O) => string | null;
  setItem: (key: string, value: string, options: O) => void;
  removeItem: (key: string, options: O) => void;
  [key: string]: any;
};
export type AsyncStorageWithOptions<O> = undefined extends O ? { 
  getItem: (key: string, options?: O) => Promise<string | null>;
  setItem: (key: string, value: string, options?: O) => Promise<unknown>;
  removeItem: (key: string, options?: O) => Promise<void>;
  [key: string]: any;
} : { 
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

export type SignalType<S extends Signal<any> | [Store<any>, SetStoreFunction<any>]> =
  S extends Signal<infer T> ? T : S extends [Store<infer T>, SetStoreFunction<infer T>] ? T : never;

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
 * @param {Signal<T> | [get: Store<T>, set: SetStoreFunction<T>]} signal - The signal or store to be persisted.
 * @param {PersistenceOptions<T, O>} options - The options for persistence.
 * @returns {Signal<T> | [get: Store<T>, set: SetStoreFunction<T>]} - The persisted signal or store.
 */
export function makePersisted<S extends Signal<any> | [Store<any>, SetStoreFunction<any>]>(
  signal: S,
  options?: PersistenceOptions<SignalType<S>, undefined>,
): S;
export function makePersisted<
  S extends Signal<any> | [Store<any>, SetStoreFunction<any>],
  O extends Record<string, any>,
>(signal: S, options: PersistenceOptions<SignalType<S>, O>): S;
export function makePersisted<
  S extends Signal<any> | [Store<any>, SetStoreFunction<any>],
  O extends Record<string, any> | undefined,
  T = SignalType<S>,
>(signal: S, options: PersistenceOptions<T, O> = {} as PersistenceOptions<T, O>): S {
  const storage = options.storage || globalThis.localStorage;
  const name = options.name || `storage-${createUniqueId()}`;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!storage) {
    return signal;
  }
  const storageOptions = (options as unknown as { storageOptions: O }).storageOptions;
  const serialize: (data: T) => string = options.serialize || JSON.stringify.bind(JSON);
  const deserialize: (data: string) => T = options.deserialize || JSON.parse.bind(JSON);
  // @ts-ignore
  const init = storage.getItem(name, storageOptions);
  const set =
    typeof signal[0] === "function"
      ? (data: string) => {
          try {
            const value = deserialize(data);
            (signal[1] as any)(() => value);
          } catch (e) {
            if (isDev) console.warn(e);
          }
        }
      : (data: string) => {
          try {
            const value = deserialize(data);
            (signal[1] as any)(reconcile(value));
          } catch (e) {
            if (isDev) console.warn(e);
          }
        };
  let unchanged = true;

  if (init instanceof Promise) init.then(data => unchanged && data && set(data as string));
  else if (init) set(init);

  if (typeof options.sync?.[0] === "function") {
    const get: () => T =
      typeof signal[0] === "function" ? (signal[0] as () => T) : () => signal[0] as T;
    options.sync[0]((data: PersistenceSyncData) => {
      if (
        data.key !== name ||
        (!isServer && (data.url || globalThis.location.href) !== globalThis.location.href) ||
        data.newValue === serialize(untrack(get))
      ) {
        return;
      }
      set(data.newValue as string);
    });
  }

  return [
    signal[0],
    typeof signal[0] === "function"
      ? (value?: T | ((prev: T) => T)) => {
          const output = (signal[1] as Setter<T>)(value as any);
          const serialized: string | null | undefined =
            value != null ? (serialize(output) as string) : (value as null | undefined);
          options.sync?.[1](name, serialized);
          // @ts-ignore
          if (value != null) storage.setItem(name, serialized as string, storageOptions);
          // @ts-ignore
          else storage.removeItem(name, storageOptions);
          unchanged = false;
          return output;
        }
      : (...args: any[]) => {
          (signal[1] as any)(...args);
          const value = serialize(untrack(() => signal[0] as any));
          options.sync?.[1](name, value);
          // @ts-ignore
          storage.setItem(name, value, storageOptions);
          unchanged = false;
        },
  ] as S;
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
export const wsSync = (ws: WebSocket, warnOnError: boolean = isDev): PersistenceSyncAPI => [
  (subscriber: PersistenceSyncCallback) =>
    ws.addEventListener("message", (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        if (["key", "newValue", "timeStamp"].every(item => Object.hasOwn(data, item))) {
          subscriber(data);
        }
      } catch (e) {
        if (warnOnError) console.warn(e);
      }
    }),
  (key, newValue) =>
    ws.send(
      JSON.stringify({
        key,
        newValue,
        timeStamp: +new Date(),
        ...(isServer ? {} : { url: location.href }),
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
