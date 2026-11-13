import type { Signal, StoreSetter, Store } from "solid-js";
import { action, createUniqueId, latest, untrack, reconcile, snapshot, DEV, NotReadyError } from "solid-js";
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
  /** Subscribes to sync and optionally returns an unsubscribe function. */
  subscribe: (subscriber: PersistenceSyncCallback) => void | (() => void),
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
  /**
   * Merge the stored value onto the initial value instead of replacing it, so keys added to the
   * initial value later keep their defaults when older persisted data is loaded. `true` deep-merges
   * plain objects (arrays and other values from the storage replace the default as a whole); a
   * function receives the deserialized stored value and the initial value and returns the value
   * to use. Applies to the initial load and to incoming sync data. If the initial value is still
   * pending (an async signal or store that has not produced its first value), there are no defaults:
   * `true` uses the stored value as is and a function receives `undefined` as `initial`.
   */
  merge?: boolean | ((stored: T, initial: T) => T);
  action?: (signal: S) => Parameters<typeof action>[0];
} & (undefined extends O
  ? { storage?: SyncStorage | AsyncStorage }
  : {
      storage: SyncStorageWithOptions<O> | AsyncStorageWithOptions<O>;
      storageOptions?: O;
    });

export type PersistedState<S, I = Promise<string> | string | null> = S extends [any, any] ? [...S, I, () => void] : never;

export type StoreTuple<T> = [Store<T>, StoreSetter<T>]; 

/** Whether `value` is a plain object (an object literal or one created with `Object.create(null)`). */
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

const setOwn = (target: Record<string, unknown>, key: string, value: unknown) =>
  Object.defineProperty(target, key, { value, enumerable: true, writable: true, configurable: true });

/**
 * Deep-copies arrays and plain objects; any other value is returned as is. Keys are written as
 * own properties, so a stored `__proto__` key can't change the copy's prototype.
 */
const clonePlain = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map(clonePlain) as T;
  if (!isPlainObject(value)) return value;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value)) setOwn(result, key, clonePlain(value[key]));
  return result as T;
};

/**
 * Deep-merges plain objects from `stored` onto `defaults`; any other stored value
 * (including arrays) replaces the default. Returns a fresh copy of `defaults`' plain objects.
 */
const mergeDefaults = (defaults: unknown, stored: unknown): unknown => {
  if (!isPlainObject(defaults) || !isPlainObject(stored)) return stored;
  const result = clonePlain(defaults);
  for (const key of Object.keys(stored))
    setOwn(result, key, Object.hasOwn(defaults, key) ? mergeDefaults(defaults[key], stored[key]) : stored[key]);
  return result;
};

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
 *   merge: true, // optional, deep-merge stored data onto the initial value
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
    return [signal[0], signal[1], null, () => {}] as unknown as PersistedState<S>;
  }
  const storageOptions = (options as unknown as { storageOptions: O }).storageOptions;
  const serialize: (data: T) => string = options.serialize || JSON.stringify.bind(JSON);
  const deserialize: (data: string) => T = options.deserialize || JSON.parse.bind(JSON);
  const init = storage.getItem(name, storageOptions);
  const isSignal = typeof signal[0] === "function";
  // capture the initial value before any stored data is applied, so it can serve as defaults;
  // an async signal or store that has not produced its first value yet throws NotReadyError
  // here - it has no defaults, so stored data is then used as is (`initial` stays undefined)
  let initial: T | undefined;
  if (options.merge) {
    try {
      initial = clonePlain(isSignal ? untrack(signal[0] as () => T) : snapshot(signal[0] as T));
    } catch (e) {
      if (!(e instanceof NotReadyError)) throw e;
    }
  }
  const merge: ((stored: T) => T) | undefined = !options.merge
    ? undefined
    : typeof options.merge === "function"
      ? (stored: T) => (options.merge as (stored: T, initial: T) => T)(stored, clonePlain(initial as T))
      : (stored: T) => mergeDefaults(initial, stored) as T;
  /** Deserializes stored data and, when `merge` is set, merges it onto the initial value. */
  const read = (data: string): T => {
    const value = deserialize(data);
    return merge ? merge(value) : value;
  };
  const set = isSignal
    ? (data: string) => {
        try {
          const value = read(data);
          (signal[1] as any)(() => value);
        } catch (e) {
          // oxlint-disable-next-line no-console
          if (DEV) console.warn(e);
        }
      }
    : (data: string) => {
        try {
          const value = read(data);
          (signal[1] as any)(reconcile(value, () => true));
        } catch (e) {
          // oxlint-disable-next-line no-console
          if (DEV) console.warn(e);
        }
      };
  let unchanged = true;
  let timer: ReturnType<typeof setTimeout> | undefined;

  if (init instanceof Promise) init.then(data => unchanged && data && set(data));
  else if (init)
    // in case of hydration mismatches due to the server lacking the same initial value,
    // we want to defer the initialization by a short amount so the same state can be used
    // during hydration
    if (options.hydrated) {
      timer = setTimeout(() => unchanged && set(init), 45);
    } else set(init);

  const getter: () => T = isSignal ? (signal[0] as () => T) : () => snapshot(signal[0] as T);

  const unsubscribe = options.sync?.[0]((data: PersistenceSyncData) => {
    if (
      data.key !== name ||
      (!isServer && (data.url || globalThis.location.href) !== globalThis.location.href) ||
      data.newValue === serialize(untrack(getter))
    ) {
      return;
    }
    set(data.newValue as string);
  });

  const persistValue = (next: T | undefined) => {
    if (next == null) {
      storage.removeItem(name, storageOptions);
      options.sync?.[1](name, null);
    } else {
      const serialized = serialize(next);
      storage.setItem(name, serialized, storageOptions);
      options.sync?.[1](name, serialized);
    }
  };
  const persist = () => persistValue(untrack(() => latest(getter)));
  return [
    signal[0], 
    (value: any) => untrack(() => {
      const output = signal[1](value);
      // As of solid-js 2.0.0-rc.1 a signal write stays pending until the next flush, so
      // reading it back through `getter` here would still report the *previous* value —
      // which would persist stale data, or wipe the entry entirely when the previous
      // value was nullish. A plain signal setter returns the value it just wrote, so
      // persist that directly. Stores mutate in place and are still read back through
      // `getter`, as are action-wrapped setters, whose value settles with the promise.
      if (isSignal && !(output instanceof Promise)) persistValue(output as T);
      else persist();
      unchanged = false;
      return output instanceof Promise ? output.then(async (result) => { await Promise.resolve(); persist(); return result; }, (err) => { persist(); throw err; }) : output;
    }),
    init,
    () => {
      unchanged = false;
      clearTimeout(timer);
      unsubscribe?.();
    },
  ] as unknown as PersistedState<S>;
}

/**
 * storageSync - synchronize localStorage
 * This does only work for { storage: localStorage }.
 * If you wish to use e.g. cookieStorage, you may use a different sync method
 */
export const storageSync: PersistenceSyncAPI = [
  (subscriber: PersistenceSyncCallback) => {
    const handler = (ev: StorageEvent) => subscriber(ev as PersistenceSyncData);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  },
  () => {
    /*storage already sends events fulfilling the PersistenceSyncData<T> conditions*/
  },
];

/**
 * messageSync - synchronize over post message or broadcast channel API
 */
export const messageSync = (channel: Window | BroadcastChannel = window, url: string | undefined = globalThis.location?.href): PersistenceSyncAPI => [
  (subscriber: PersistenceSyncCallback) => {
    const handler = (ev: Event) => {
      subscriber((ev as MessageEvent).data);
    };
    channel.addEventListener("message", handler);
    return () => channel.removeEventListener("message", handler);
  },
  (key, newValue) =>
    channel.postMessage(
      { key, newValue, timeStamp: Date.now(), url },
      location.origin,
    ),
];

/**
 * wsSync - syncronize persisted storage via web socket
 */
export const wsSync = (ws: WebSocket, warnOnError: boolean = !!DEV, url: string | undefined = globalThis.location?.href): PersistenceSyncAPI => [
  (subscriber: PersistenceSyncCallback) => {
    const handler = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        if (["key", "newValue", "timeStamp"].every(item => Object.hasOwn(data, item))) {
          subscriber(data);
        }
      } catch (e) {
        // oxlint-disable-next-line no-console
        if (warnOnError) console.warn(e);
      }
    };
    ws.addEventListener("message", handler);
    return () => ws.removeEventListener("message", handler);
  },
  (key, newValue) =>
    ws.send(
      JSON.stringify({
        key,
        newValue,
        timeStamp: +new Date(),
        ...(url ? { url } : {}),
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
  subscriber => {
    const unsubscribers = syncAPIs.map(([subscribe]) => subscribe(subscriber));
    return () => unsubscribers.forEach(unsubscribe => unsubscribe?.());
  },
  (key, value) => syncAPIs.forEach(([_, updater]) => updater(key, value)),
];
