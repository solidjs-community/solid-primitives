import { AsyncStorage, AsyncStorageWithOptions, StorageWithOptions } from "./index.js";

/**
 * adds a `.clear` method to a Storage without one only using `.key`/`.removeItem`
 */
export const addClearMethod = <S extends Storage | StorageWithOptions<any>>(
  storage: Omit<S, "clear"> & { clear?: () => void },
): S => {
  if (typeof storage.clear === "function") {
    return storage as S;
  }
  (storage as S).clear = () => {
    let key;
    while ((key = storage.key!(0))) {
      storage.removeItem!(key);
    }
  };
  return storage as S;
};

const methodKeys = ["clear", "getItem", "getAll", "setItem", "removeItem", "key", "getLength"];

/**
 * adds a `.withOptions` method that wraps the storage to apply options
 */
export const addWithOptionsMethod = <
  O,
  S extends StorageWithOptions<O> | AsyncStorageWithOptions<O>,
  W extends AsyncStorage | Storage = S extends AsyncStorageWithOptions<O> ? AsyncStorage : Storage,
>(
  storage: S,
): S & { withOptions: (options: O) => W } => {
  storage.withOptions = (options: O): W =>
    methodKeys.reduce(
      (wrapped: Partial<S>, key: keyof S) => {
        if (typeof storage[key] === "function") {
          (wrapped as any)[key] = (...args: Parameters<(typeof storage)[typeof key]>) => {
            args[storage[key].length - 1] = options;
            storage[key](...args);
          }
        }
        return wrapped;
      },
      {
        get length() {
          return storage.length;
        },
        withOptions: (options: O) => storage.withOptions!(options),
      } as Partial<S>,
    ) as unknown as W;
  return storage as S & { withOptions: (options: O) => W };
};

const callStorageMethod = (
  storages: (Storage | AsyncStorage)[],
  method: string,
  args: any[] = [],
  first = false,
) => {
  const results = storages.map(storage => storage[method](...args));
  const isAsync = results.some(
    result => typeof result === "object" && typeof result?.then === "function",
  );
  return isAsync
    ? first
      ? Promise.race(results)
      : Promise.all(results)
    : first
      ? results.filter(Boolean)[0]
      : results;
};

const isNumber = (n: any): n is number => typeof n === "number";

export type StorageMultiplexer = <S extends any[]>(
  ...storages: S
) => AsyncStorage extends S[number] ? AsyncStorage : Storage;

/**
 * combines multiple storages to a single storage
 */
export const multiplexStorage: StorageMultiplexer = (...storages) => ({
  clear: () => callStorageMethod(storages, "clear"),
  getItem: (key: string) => callStorageMethod(storages, "getItem", [key], true),
  setItem: (key: string, value: string) => callStorageMethod(storages, "setItem", [key, value]),
  removeItem: (key: string) => callStorageMethod(storages, "removeItem", [key]),
  key: (no: number) => callStorageMethod(storages, "key", [no], true),
  get length() {
    const lengths: (number | Promise<number> | undefined)[] = storages.map(
      storage => storage.length,
    );
    const isAsync = lengths.some(
      len => len && typeof len === "object" && typeof len?.then === "function",
    );
    return (isAsync
      ? Promise.all(lengths).then(lens => Math.max(...lens.filter(isNumber)))
      : Math.max(...lengths.filter(isNumber))) as unknown as number;
  },
});
