import type { Accessor, Setter, Signal } from "solid-js";
import { createUniqueId, untrack } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import { reconcile } from "solid-js/store";
import type { AsyncStorage, AsyncStorageWithOptions, StorageWithOptions } from "./types.js";

export type PersistenceBaseOptions<T> = {
  name?: string;
  serialize?: (data: T) => string;
  deserialize?: (data: string) => T;
};

export type PersistenceOptions<T, O extends Record<string, any>> = PersistenceBaseOptions<T> &
  (
    | {
        storage: StorageWithOptions<O> | AsyncStorageWithOptions<O>;
        storageOptions: O;
      }
    | { storage?: Storage | AsyncStorage }
  );

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
export function makePersisted<T>(
  signal: [Accessor<T>, Setter<T>],
  options?: PersistenceOptions<T, {}>,
): [Accessor<T>, Setter<T>];

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
export function makePersisted<T, O extends Record<string, any>>(
  signal: Signal<T>,
  options: PersistenceOptions<T, O>,
): Signal<T>;

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
export function makePersisted<T>(
  signal: [get: Store<T>, set: SetStoreFunction<T>],
  options?: PersistenceOptions<T, {}>,
): [get: Store<T>, set: SetStoreFunction<T>];

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
export function makePersisted<T, O extends Record<string, any>>(
  signal: [get: Store<T>, set: SetStoreFunction<T>],
  options: PersistenceOptions<T, O>,
): [get: Store<T>, set: SetStoreFunction<T>];

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
export function makePersisted<T, O extends Record<string, any> = {}>(
  signal: Signal<T> | [get: Store<T>, set: SetStoreFunction<T>],
  options: PersistenceOptions<T, O> = {},
): Signal<T> | [get: Store<T>, set: SetStoreFunction<T>] {
  const storage = options.storage || globalThis.localStorage;
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!storage) {
    return signal;
  }
  const storageOptions = (options as unknown as { storageOptions: O }).storageOptions;
  const name = options.name || `storage-${createUniqueId()}`;
  const serialize: (data: T) => string = options.serialize || JSON.stringify.bind(JSON);
  const deserialize: (data: string) => T = options.deserialize || JSON.parse.bind(JSON);
  const init = storage.getItem(name, storageOptions);
  const set =
    typeof signal[0] === "function"
      ? (data: string) => (signal[1] as any)(() => deserialize(data))
      : (data: string) => (signal[1] as any)(reconcile(deserialize(data)));
  let unchanged = true;

  if (init instanceof Promise) init.then(data => unchanged && data && set(data));
  else if (init) set(init);

  return [
    signal[0],
    typeof signal[0] === "function"
      ? (value?: T | ((prev: T) => T)) => {
          const output = (signal[1] as Setter<T>)(value as any);

          if (value) storage.setItem(name, serialize(output), storageOptions);
          else storage.removeItem(name, storageOptions);
          unchanged = false;
          return output;
        }
      : (...args: any[]) => {
          (signal[1] as any)(...args);
          const value = serialize(untrack(() => signal[0] as any));
          // @ts-ignore
          storage.setItem(name, value, storageOptions);
          unchanged = false;
        },
  ] as typeof signal;
}
