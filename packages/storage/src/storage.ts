import { createHydratableSignal } from "@solid-primitives/utils";
import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type Accessor,
  type Setter,
  type Signal,
} from "solid-js";
import type {
  AnyStorageProps,
  AsyncStorage,
  AsyncStorageActions,
  AsyncStorageObject,
  AsyncStorageSetter,
  AsyncStorageWithOptions,
  StorageActions,
  StorageObject,
  StorageProps,
  StorageSetter,
  StorageSignalProps,
  StorageWithOptions,
  StringStorageProps,
} from "./types";

/**
 * like createStore, but bound to a localStorage-like API
 * ```typescript
 * type StorageWithOptions<O> = Storage; // but with options added to setItem
 * type StorageProps<T extends string, O> = {
 *   api?: Storage | StorageWithOptions;
 *   // or an array thereof, default will be localStorage
 *   deserializer?: (value: string, key: string, options?: O) => T;
 *   serializer?: (value: T, key: string, options?: O) => string;
 *   options?: O; // options
 *   prefix?: string // will be prefixed to the key
 * };
 * createStorage(props?: StorageProps) => [
 *   store: StorageObject<T>, // basically like `Store<T>`
 *   setter: StorageSetter<T>, // like `setStoreFunction<T>`
 *   actions: {
 *     remove: (key: string) => void;
 *     clear: () => void;
 *     toJSON: () => { [key: string]: T };
 *   }
 * ]
 * ```
 * @deprecated in favor of makePersisted
 */
export function createStorage<O>(
  props?: StringStorageProps<Storage | StorageWithOptions<O>, O>,
): [
  store: StorageObject<string>,
  setter: StorageSetter<string, O>,
  actions: StorageActions<string>,
];
export function createStorage<O, T>(
  props?: AnyStorageProps<Storage | StorageWithOptions<O>, O, T>,
): [store: StorageObject<T>, setter: StorageSetter<T, O>, actions: StorageActions<T>];
export function createStorage<O, T>(
  props?: StorageProps<T, Storage | StorageWithOptions<O>, O>,
): [store: StorageObject<T>, setter: StorageSetter<T, O>, actions: StorageActions<T>] {
  const [error, setError] = createSignal<Error>();
  const handleError = props?.throw
    ? (err: unknown, fallback: string) => {
        setError(err instanceof Error ? err : new Error(fallback));
        throw err;
      }
    : (err: unknown, fallback: string) => {
        setError(err instanceof Error ? err : new Error(fallback));
      };
  const apis = props?.api
    ? Array.isArray(props.api)
      ? props.api
      : [props.api]
    : [globalThis.localStorage].filter(Boolean);
  const prefix = props?.prefix ? `${props.prefix}.` : "";
  const signals = new Map<string, Signal<undefined>>();
  const store = new Proxy<Record<string, T>>(
    {},
    {
      get(_, key: string) {
        let node = signals.get(key);
        if (!node) {
          node = createSignal(undefined, { equals: false });
          signals.set(key, node);
        }
        node[0]();
        const value = apis.reduce<string | null>(
          (result: string | null, api: Storage | StorageWithOptions<O> | undefined) => {
            if (result !== null || !api) {
              return result;
            }
            try {
              return api.getItem(`${prefix}${key}`);
            } catch (err) {
              handleError(err, `Error reading ${prefix}${key} from ${api["name"]}`);
              return null;
            }
          },
          null,
        );
        if (value !== null && props?.deserializer) {
          return props.deserializer(value, key, props.options as O) as T;
        }
        return value as T | null;
      },
    },
  );
  const setter: StorageSetter<T, O> = (key, value: T, options?: O) => {
    const filteredValue = props?.serializer
      ? props.serializer(value as any, key, options ?? props.options)
      : (value as unknown as string);
    const apiKey = `${prefix}${key}`;
    apis.forEach(api => {
      try {
        api.getItem(apiKey) !== filteredValue && api.setItem(apiKey, filteredValue);
      } catch (err) {
        handleError(err, `Error setting ${prefix}${key} to ${filteredValue} in ${api.name}`);
      }
    });
    const node = signals.get(key);
    node && node[1]();
  };
  const remove = (key: string) =>
    apis.forEach(api => {
      try {
        api.removeItem(`${prefix}${key}`);
      } catch (err) {
        handleError(err, `Error removing ${prefix}${key} from ${api.name}`);
      }
    });
  const clear = () =>
    apis.forEach(api => {
      try {
        api.clear();
      } catch (err) {
        handleError(err, `Error clearing ${api.name}`);
      }
    });
  const toJSON = (): StorageObject<T> => {
    const result: StorageObject<T> = {};
    const addValue = (key: string, value: any) => {
      if (!result.hasOwnProperty(key)) {
        const filteredValue: T | null =
          value && props?.deserializer
            ? (props.deserializer(value, key, props.options) as T)
            : (value as T | null);
        if (filteredValue) {
          result[key] = filteredValue;
        }
      }
    };
    apis.forEach(api => {
      if (typeof api.getAll === "function") {
        let values;
        try {
          values = api.getAll();
        } catch (err) {
          handleError(err, `Error getting all values from in ${api.name}`);
        }
        for (const key of values) {
          addValue(key, values[key]);
        }
      } else {
        let index = 0,
          key: string | null;
        try {
          while ((key = api.key(index++))) {
            if (!result.hasOwnProperty(key)) {
              addValue(key, api.getItem(key));
            }
          }
        } catch (err) {
          handleError(err, `Error getting all values from ${api.name}`);
        }
      }
    });
    return result;
  };
  props?.sync !== false &&
    onMount(() => {
      const listener = (ev: StorageEvent) => {
        let changed = false;
        apis.forEach(api => {
          try {
            if (api !== ev.storageArea && ev.key && ev.newValue !== api.getItem(ev.key)) {
              ev.newValue ? api.setItem(ev.key, ev.newValue) : api.removeItem(ev.key);
              changed = true;
            }
          } catch (err) {
            handleError(
              err,
              `Error synching api ${api.name} from storage event (${ev.key}=${ev.newValue})`,
            );
          }
        });
        (changed as boolean) && ev.key && signals.get(ev.key)?.[1]();
      };
      if ("addEventListener" in globalThis) {
        globalThis.addEventListener("storage", listener);
        onCleanup(() => globalThis.removeEventListener("storage", listener));
      } else {
        apis.forEach(api => api.addEventListener?.("storage", listener));
        onCleanup(() => apis.forEach(api => api.removeEventListener?.("storage", listener)));
      }
    });
  return [
    store,
    setter,
    {
      clear,
      error,
      remove,
      toJSON,
    },
  ];
}

/**
 * like createStore, but bound to an asynchronous localStorage-like API
 * ```typescript
 * type AsyncStorage = Storage // but returns everything wrapped in Promises
 * type AsyncStorageWithOptions<O> = Storage; // but with options added to setItem
 * type AsyncStorageProps<T extends string, O> = {
 *   api?: AsyncStorage | AsyncStorageWithOptions;
 *   // or an array thereof, default will be localStorage
 *   deserializer?: (value: string, key: string, options?: O) => T;
 *   serializer?: (value: T, key: string, options?: O) => string;
 *   options?: O; // options
 *   prefix?: string // will be prefixed to the key
 * };
 * createStorage(props?: AsyncStorageProps) => [
 *   store: AsyncStorageObject<T>, // basically like `Store<T>`
 *   setter: AsyncStorageSetter<T>, // like `setStoreFunction<T>`
 *   actions: {
 *     remove: (key: string) => Promise<void>;
 *     clear: () => Promise<void>;
 *     toJSON: () => Promise<{ [key: string]: T }>;
 *   }
 * ]
 * ```
 * @deprecated in favor of makePersisted
 */
export function createAsyncStorage<O>(
  props?: StringStorageProps<AsyncStorage | AsyncStorageWithOptions<O>, O>,
): [
  store: AsyncStorageObject<string>,
  setter: AsyncStorageSetter<string, O>,
  actions: AsyncStorageActions<string>,
];
export function createAsyncStorage<O, T>(
  props?: AnyStorageProps<T, AsyncStorage | AsyncStorageWithOptions<O>, O>,
): [
  store: AsyncStorageObject<T>,
  setter: AsyncStorageSetter<T, O>,
  actions: AsyncStorageActions<T>,
];
export function createAsyncStorage<O, T>(
  props?: StorageProps<T, AsyncStorage | AsyncStorageWithOptions<O>, O>,
): [
  store: AsyncStorageObject<T>,
  setter: AsyncStorageSetter<T, O>,
  actions: AsyncStorageActions<T>,
] {
  const [error, setError] = createSignal<Error>();
  const handleError = props?.throw
    ? (err: unknown, fallback: string) => {
        setError(err instanceof Error ? err : new Error(fallback));
        throw err;
      }
    : (err: unknown, fallback: string) => {
        setError(err instanceof Error ? err : new Error(fallback));
      };
  const apis = props?.api ? (Array.isArray(props.api) ? props.api : [props.api]) : [];
  const prefix = props?.prefix ? `${props.prefix}.` : "";
  const signals = new Map<string, Signal<undefined>>();
  const store: AsyncStorageObject<T> = new Proxy({} as AsyncStorageObject<T>, {
    get(_, key: string) {
      let node = signals.get(key);
      if (!node) {
        node = createSignal(undefined, { equals: false });
        signals.set(key, node);
      }
      node[0]();
      return apis.reduce((result: T | null, api: AsyncStorage | undefined): T | null => {
        if (result !== null || !api) {
          return result;
        }
        let value;
        try {
          value = api.getItem(`${prefix}${key}`);
        } catch (err) {
          handleError(err, `Error getting ${prefix}${key} from ${api.name}`);
        }
        if (value instanceof Promise) {
          return value.then((newValue: string | null) =>
            newValue && props?.deserializer
              ? props.deserializer(newValue, key, props.options)
              : newValue,
          ) as any;
        }
        return value !== null && props?.deserializer
          ? Promise.resolve(props.deserializer(value as string, key, props.options as O) as T)
          : (Promise.resolve(value as T | null) as any);
      }, null);
    },
  });
  const setter = (key: string, value: T, options?: O) => {
    const filteredValue = props?.serializer
      ? props.serializer(value as any, key, options ?? props.options)
      : (value as unknown as string);
    return Promise.all(
      apis.map(api => {
        try {
          api.setItem(`${prefix}${key}`, filteredValue, options ?? props?.options);
        } catch (err) {
          handleError(err, `Error setting ${prefix}${key} to ${filteredValue} in ${api.name}`);
        }
      }),
    ).then(() => {
      const node = signals.get(key);
      node && node[1]();
    });
  };
  const remove = (key: string) => {
    Promise.all(
      apis.map(api => {
        try {
          api.removeItem(`${prefix}${key}`);
        } catch (err) {
          handleError(err, `Error removing ${prefix}${key} from ${api.name}`);
        }
      }),
    ).then(() => {
      const node = signals.get(key);
      node && node[1]();
    });
  };
  const clear = () =>
    Promise.all(
      apis.map(async api => {
        let index = 0,
          key;
        while ((key = await api.key(index++))) {
          try {
            await api.removeItem(key);
          } catch (err) {
            handleError(err, `Error removing ${key} from ${api.name} during clear()`);
          }
        }
      }),
    ).then(() => {
      return;
    });
  const toJSON = async () => {
    const result: StorageObject<T> = {};
    const addValue = (key: string, value: any) => {
      if (!result.hasOwnProperty(key)) {
        const filteredValue: T | null =
          value && props?.deserializer
            ? (props.deserializer(value, key, props.options) as T)
            : (value as T | null);
        if (filteredValue) {
          result[key] = filteredValue;
        }
      }
    };
    await Promise.all(
      apis.map(async api => {
        if (typeof api.getAll === "function") {
          try {
            const values = await api.getAll();
            for (const key of values) {
              addValue(key, values[key]);
            }
          } catch (err) {
            handleError(err, `Error attempting to get all keys from ${api.name}`);
          }
        } else {
          let index = 0,
            key: string | null;
          try {
            while ((key = await api.key(index++))) {
              addValue(key, await api.getItem(key));
            }
          } catch (err) {
            handleError(err, `Error attempting to get all keys from ${api.name}`);
          }
        }
      }),
    );
    return result;
  };
  props?.sync !== false &&
    onMount(() => {
      const listener = (ev: StorageEvent) => {
        let changed = false;
        apis.forEach(async api => {
          try {
            if (api !== ev.storageArea && ev.key && ev.newValue !== (await api.getItem(ev.key))) {
              ev.newValue ? api.setItem(ev.key, ev.newValue) : api.removeItem(ev.key);
              changed = true;
            }
          } catch (err) {
            handleError(err, "Error attempting to sync on event");
          }
        });
        (changed as boolean) && ev.key && signals.get(ev.key)?.[1]();
      };
      if ("addEventListener" in globalThis) {
        globalThis.addEventListener("storage", listener);
        onCleanup(() => globalThis.removeEventListener("storage", listener));
      } else {
        apis.forEach(api => api.addEventListener?.("storage", listener));
        onCleanup(() => apis.forEach(api => api.removeEventListener?.("storage", listener)));
      }
    });
  return [
    store,
    setter,
    {
      remove,
      clear,
      error,
      toJSON,
    },
  ];
}

/**
 * like createSignal, but bound to a localStorage-like API
 * ```typescript
 * type StorageWithOptions<O> = Storage; // but with options added to setItem
 * type StorageProps<T extends string, O> = {
 *   api?: Storage | StorageWithOptions;
 *   // or an array thereof, default will be localStorage
 *   deserializer?: (value: string, key: string, options?: O) => T;
 *   serializer?: (value: T, key: string, options?: O) => string;
 *   options?: O; // options
 *   prefix?: string // will be prefixed to the key
 * };
 * createStorage<T extends string>(key: string, props?: StorageProps<T>) => [
 *   accessor: Accessor<T> &
 *     { error: () => Error | undefined },
 *     // basically like `value()`
 *   setter: Setter<T>, // like `setValue()`
 *   refetch: () => void // reloads from storage
 * ]
 * ```
 * @deprecated in favor of makePersisted
 */
export function createStorageSignal<T, O = {}>(
  key: string,
  initialValue?: T,
  props?: StorageSignalProps<T, Storage | StorageWithOptions<O>, O>,
): [accessor: Accessor<T | null>, setter: Setter<T | null>, refetch: () => void] {
  const [error, setError] = createSignal<Error>();
  const apis = props?.api
    ? Array.isArray(props.api)
      ? props.api
      : [props.api]
    : [globalThis.localStorage].filter(Boolean);
  const prefix = props?.prefix ? `${props.prefix}.` : "";
  const read = () =>
    apis.reduce<T | null>((result: T | null, api: StorageWithOptions<O> | Storage | undefined) => {
      if (result !== null || !api) {
        return result;
      }
      let value = null;
      try {
        value = api.getItem(`${prefix}${key}`) as T | null;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error(`Error reading ${prefix}${key} from ${api.name}`),
        );
        if (props?.throw) {
          throw err;
        }
      }
      if (value !== null && props?.deserializer) {
        return props.deserializer(value + "", key, props.options as O) as T;
      }
      return value;
    }, null);
  const [accessor, setter] = createHydratableSignal<T | null>(
    initialValue as T,
    () => read() ?? (initialValue as T),
    props as any,
  );
  createEffect(() => {
    const value = accessor();
    const filteredValue = props?.serializer
      ? props.serializer(value as string & T, key, props.options)
      : value + "";
    const apiKey = `${prefix}${key}`;
    try {
      if (value === null) {
        apis.forEach(api => api.getItem(apiKey) !== null && api.removeItem(apiKey));
      } else {
        apis.forEach(
          api =>
            api.getItem(apiKey) !== filteredValue &&
            api.setItem(apiKey, filteredValue, props?.options),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error(`Error ${value === null ? "removing" : "writing"} value`),
      );
      if (props?.throw) {
        throw err;
      }
    }
  });
  const refetch = () => {
    const value = read();
    setter(value as any);
  };
  props?.sync !== false &&
    onMount(() => {
      const listener = (ev: StorageEvent) => {
        let changed = false;
        try {
          apis.forEach(api => {
            if (api !== ev.storageArea && ev.key && ev.newValue !== api.getItem(ev.key)) {
              ev.newValue ? api.setItem(ev.key, ev.newValue) : api.removeItem(ev.key);
              changed = true;
            }
          });
        } catch (err) {
          setError(err instanceof Error ? err : new Error("Error synching api after event"));
          if (props?.throw) {
            throw err;
          }
        }
        (changed as boolean) && refetch();
      };
      if ("addEventListener" in globalThis) {
        globalThis.addEventListener("storage", listener);
        onCleanup(() => globalThis.removeEventListener("storage", listener));
      } else {
        apis.forEach(api => api.addEventListener?.("storage", listener));
        onCleanup(() => apis.forEach(api => api.removeEventListener?.("storage", listener)));
      }
    });
  return [Object.assign(accessor, { error }), setter, refetch];
}

/** @deprecated in favor of makePersistent */
export const createLocalStorage = createStorage;

/** @deprecated in favor of makePersistent */
export const createSessionStorage = <T, O = {}>(props: StorageProps<T, Storage, O>) =>
  createStorage({ ...props, api: globalThis.sessionStorage } as any);
