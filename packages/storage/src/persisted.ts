import { createUniqueId, untrack } from "solid-js";
import { reconcile } from "solid-js/store";
import type { Accessor, Setter } from "solid-js";
import type { Store, SetStoreFunction } from "solid-js/store";
import type { StorageWithOptions, AsyncStorage, AsyncStorageWithOptions } from "./types";

export type PersistenceOptions<T, O extends Record<string, any> = {}> =
  | {
      storage?: Storage | AsyncStorage;
      name?: string;
      serialize?: (data: T) => string;
      deserialize?: (data: string) => T;
    }
  | {
      storage: StorageWithOptions<O> | AsyncStorageWithOptions<O>;
      storageOptions: O;
      name?: string;
      serialize?: (data: T) => string;
      deserialize?: (data: string) => T;
    };

/*
 * Persists a signal, store or similar API
 * ```ts
 * const [getter, setter] = makePersisted(createSignal("data"), options);
 * const options = {
 *   storage: cookieStorage,  // can be any synchronous or asynchronous storage
 *   storageOptions: { ... }, // for storages with options, otherwise not needed
 *   name: "solid-data",      // optional
 *   serialize: (value: string) => value, // optional
 *   deserialize: (data: string) => data, // optional
 * };
 * ```
 * Can be used with `createSignal` or `createStore`. The initial value from the storage will overwrite the initial value of the signal or store unless overwritten. Overwriting a signal with `null` or `undefined` will remove the item from the storage.
 */
export function makePersisted<T>(
  signal: [Accessor<T>, Setter<T>],
  options?: PersistenceOptions<T, {}>,
): [Accessor<T>, Setter<T>];
export function makePersisted<T, O extends Record<string, any>>(
  signal: [Accessor<T>, Setter<T>],
  options: PersistenceOptions<T, O>,
): [Accessor<T>, Setter<T>];
export function makePersisted<T>(
  signal: [Store<T>, SetStoreFunction<T>],
  options?: PersistenceOptions<T, {}>,
): [Store<T>, SetStoreFunction<T>];
export function makePersisted<T, O extends Record<string, any>>(
  signal: [Store<T>, SetStoreFunction<T>],
  options: PersistenceOptions<T, O>,
): [Store<T>, SetStoreFunction<T>];
export function makePersisted<T, O extends Record<string, any> = {}>(
  signal: [Accessor<T>, Setter<T>] | [Store<T>, SetStoreFunction<T>],
  options: PersistenceOptions<T, O> = {},
): [Accessor<T>, Setter<T>] | [Store<T>, SetStoreFunction<T>] {
  const storage = options.storage || globalThis.localStorage;
  if (!storage) {
    return signal;
  }
  const name = options.name || `storage-${createUniqueId()}`;
  const serialize: (data: T) => string = options.serialize || JSON.stringify.bind(JSON);
  const deserialize: (data: string) => T = options.deserialize || JSON.parse.bind(JSON);
  const init = storage.getItem(name);
  const set =
    typeof signal[0] === "function"
      ? (data: string) => (signal[1] as Setter<T>)(() => deserialize(data))
      : (data: string) => (signal[1] as SetStoreFunction<T>)(reconcile(deserialize(data)));
  let unchanged = true;
  if (init instanceof Promise) {
    (init as Promise<string>).then((data: string) => unchanged && data && set(data));
  } else if (init) {
    set(init);
  }
  return [
    signal[0],
    typeof signal[0] === "function"
      ? (value?: T | ((prev: T) => T)) => {
          const output = (signal[1] as Setter<T>)(value as any);
          value != null
            ? // @ts-ignore
              storage.setItem(name, serialize(output), options.storageOptions)
            : storage.removeItem(name);
          unchanged = false;
          return output;
        }
      : (...args: Parameters<SetStoreFunction<T>>) => {
          (signal[1] as SetStoreFunction<T>)(...args);
          storage.setItem(
            name,
            serialize(untrack(() => signal[0] as Store<T>)),
            // @ts-ignore
            options.storageOptions,
          );
          unchanged = false;
        },
  ] as typeof signal;
}
