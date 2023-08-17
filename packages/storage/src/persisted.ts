import {createUniqueId, untrack} from "solid-js";
import {reconcile} from "solid-js/store";
import type {Accessor, Setter} from "solid-js";
import type {Store, SetStoreFunction} from "solid-js/store";
import type {StorageWithOptions, AsyncStorage, AsyncStorageWithOptions} from "./types.js";

export type PersistenceBaseOptions<T> = {
  name?: string;
  serialize?: (data: T) => string;
  deserialize?: (data: string) => T;
}

export type PersistenceOptions<T, O extends Record<string, any> = {}> = PersistenceBaseOptions<T> & (
  {
    storage?: Storage | AsyncStorage;
  } |
  {
    storage: StorageWithOptions<O> | AsyncStorageWithOptions<O>;
    storageOptions: O;
  });

/*
 * Persists a signal, store or similar API
 * ```ts
 * const [getter, setter] = makePersisted(createSignal("data"), options);
 * const options = {
 *   storage: cookieStorage,  // can be any synchronous or asynchronous storage
 *   storageOptions: { ... }, // for storages with options, otherwise not needed
 *   name: "solid-data",      // optional
 *   autoRemove: true,       // optional, removes key from storage when value is set to null or undefined
 *   serialize: (value: string) => value, // optional
 *   deserialize: (data: string) => data, // optional
 * };
 * ```
 * Can be used with `createSignal` or `createStore`. The initial value from the storage will overwrite the initial value of the signal or store unless overwritten. Overwriting a signal with `null` or `undefined` will remove the item from the storage.
 */
export function makePersisted<T>(
  signal: [Accessor<T>, Setter<T>],
  options?: PersistenceOptions<T>,
): [Accessor<T>, Setter<T>];
export function makePersisted<T, O extends Record<string, any>>(
  signal: [Accessor<T>, Setter<T>],
  options: PersistenceOptions<T, O>,
): [Accessor<T>, Setter<T>];
export function makePersisted<T>(
  signal: [Store<T>, SetStoreFunction<T>],
  options?: PersistenceOptions<T>,
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

  if (init instanceof Promise)
    init.then(data => unchanged && data && set(data));
  else if (init)
    set(init);

  return [
    signal[0],
    typeof signal[0] === "function"
      ? (value?: T | ((prev: T) => T)) => {
        const output = (signal[1] as Setter<T>)(value as any);

        if (value != null)
          storage.setItem(name, serialize(output), storageOptions);
        else
          storage.removeItem(name, storageOptions);
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
