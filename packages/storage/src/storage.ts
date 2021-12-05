import { Accessor, createEffect, createSignal, onCleanup, onMount, Setter } from "solid-js";

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
  StringStorageProps
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
 */
export function createStorage<O>(
  props?: StringStorageProps<Storage | StorageWithOptions<O>, O>
): [
  store: StorageObject<string>,
  setter: StorageSetter<string, O>,
  actions: StorageActions<string>
];
export function createStorage<O, T>(
  props?: AnyStorageProps<Storage | StorageWithOptions<O>, O, T>
): [store: StorageObject<T>, setter: StorageSetter<T, O>, actions: StorageActions<T>];
export function createStorage<O, T>(
  props?: StorageProps<T, Storage | StorageWithOptions<O>, O>
): [store: StorageObject<T>, setter: StorageSetter<T, O>, actions: StorageActions<T>] {
  const apis = props?.api
    ? Array.isArray(props.api)
      ? props.api
      : [props.api]
    : [globalThis.localStorage].filter(Boolean);
  const prefix = props?.prefix ? `${props.prefix}.` : "";
  const signals = new Map<string, ReturnType<typeof createSignal>>();
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
            return api.getItem(`${prefix}${key}`) as string | null;
          },
          null
        );
        if (value !== null && props?.deserializer) {
          return props.deserializer(value as string, key, props?.options as O) as T;
        }
        return value as T | null;
      }
    }
  );
  const setter: StorageSetter<T, O> = (key, value: T, options?: O) => {
    const filteredValue = props?.serializer
      ? (props.serializer(
          value as any,
          key,
          options ?? (props?.options as O | undefined)
        ) as string)
      : (value as unknown as string);
    apis.forEach(api => api.setItem(`${prefix}${key}`, filteredValue));
    const node = signals.get(key);
    node && node[1]();
  };
  const remove = (key: string) => apis.forEach(api => api.removeItem(key));
  const clear = () => apis.forEach(api => api?.clear?.());
  const toJSON = (): StorageObject<T> => {
    const result: StorageObject<T> = {};
    const addValue = (key: string, value: any) => {
      if (!result.hasOwnProperty(key)) {
        const filteredValue: T | null =
          value && props?.deserializer
            ? (props.deserializer(value, key, props?.options) as T)
            : (value as T | null);
        if (filteredValue) {
          result[key] = filteredValue;
        }
      }
    };
    apis.forEach(api => {
      if (typeof api.getAll === "function") {
        const values = api.getAll();
        for (const key of values) {
          addValue(key, values[key]);
        }
      } else {
        let index = 0,
          key: string | null;
        while ((key = api.key(index++))) {
          if (!result.hasOwnProperty(key)) {
            addValue(key, api.getItem(key));
          }
        }
      }
    });
    return result;
  };
  onMount(() => {
    const listener = (ev: StorageEvent) => {
      let changed = false;
      apis.forEach(api => {
        if (api !== ev.storageArea && ev.key && ev.newValue !== api.getItem(ev.key)) {
          ev.newValue ? api.setItem(ev.key, ev.newValue) : api.removeItem(ev.key);
          changed = true;
        }
      });
      changed && ev.key && signals.get(ev.key)?.[1]();
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
      remove,
      toJSON
    }
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
 */
export function createAsyncStorage<O>(
  props?: StringStorageProps<AsyncStorage | AsyncStorageWithOptions<O>, O>
): [
  store: AsyncStorageObject<string>,
  setter: AsyncStorageSetter<string, O>,
  actions: AsyncStorageActions<string>
];
export function createAsyncStorage<O, T>(
  props?: AnyStorageProps<T, AsyncStorage | AsyncStorageWithOptions<O>, O>
): [
  store: AsyncStorageObject<T>,
  setter: AsyncStorageSetter<T, O>,
  actions: AsyncStorageActions<T>
];
export function createAsyncStorage<O, T>(
  props?: StorageProps<T, AsyncStorage | AsyncStorageWithOptions<O>, O>
): [
  store: AsyncStorageObject<T>,
  setter: AsyncStorageSetter<T, O>,
  actions: AsyncStorageActions<T>
] {
  const apis = props?.api ? (Array.isArray(props.api) ? props.api : [props.api]) : [];
  const prefix = props?.prefix ? `${props.prefix}.` : "";
  const signals = new Map<string, ReturnType<typeof createSignal>>();
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
        const value = api.getItem(`${prefix}${key}`);
        if (value instanceof Promise) {
          return value.then((value: string | null) =>
            value && props?.deserializer ? props.deserializer(value, key, props?.options) : value
          ) as any;
        }
        return value !== null && props?.deserializer
          ? Promise.resolve(props.deserializer(value as string, key, props?.options as O) as T)
          : (Promise.resolve(value as T | null) as any);
      }, null);
    }
  });
  const setter = (key: string, value: T, options?: O) => {
    const filteredValue = props?.serializer
      ? props.serializer(value as any, key, options ?? props?.options)
      : (value as unknown as string);
    return Promise.all(
      apis.map(api =>
        api.setItem(`${prefix}${key}`, filteredValue, options ?? (props?.options as O | undefined))
      )
    ).then(() => {
      const node = signals.get(key);
      node && node[1]();
    });
  };
  const remove = (key: string) =>
    Promise.all(apis.map(api => api.removeItem(`${prefix}${key}`))).then(() => {
      const node = signals.get(key);
      node && node[1]();
    });
  const clear = () =>
    Promise.all(
      apis.map(async api => {
        let index = 0,
          key;
        while ((key = await api.key(index++))) {
          await api.removeItem(key);
        }
      })
    ).then(() => {
      return;
    });
  const toJSON = async () => {
    const result: StorageObject<T> = {};
    const addValue = (key: string, value: any) => {
      if (!result.hasOwnProperty(key)) {
        const filteredValue: T | null =
          value && props?.deserializer
            ? (props.deserializer(value, key, props?.options) as T)
            : (value as T | null);
        if (filteredValue) {
          result[key] = filteredValue;
        }
      }
    };
    await Promise.all(
      apis.map(async api => {
        if (typeof api.getAll === "function") {
          const values = await api.getAll();
          for (const key of values) {
            addValue(key, values[key]);
          }
        } else {
          let index = 0,
            key: string | null;
          while ((key = await api.key(index++))) {
            addValue(key, await api.getItem(key));
          }
        }
      })
    );
    return result;
  };
  onMount(() => {
    const listener = (ev: StorageEvent) => {
      let changed = false;
      apis.forEach(async api => {
        if (api !== ev.storageArea && ev.key && ev.newValue !== (await api.getItem(ev.key))) {
          ev.newValue ? api.setItem(ev.key, ev.newValue) : api.removeItem(ev.key);
          changed = true;
        }
      });
      changed && ev.key && signals.get(ev.key)?.[1]();
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
      toJSON
    }
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
 *   accessor: Accessor<T>, // basically like `value()`
 *   setter: Setter<T>, // like `setValue()`
 *   refetch: () => void // reloads from storage
 * ]
 * ```
 */
export function createStorageSignal<T extends any, O extends any>(
  key: string,
  initialValue?: T,
  props?: StorageSignalProps<T, Storage | StorageWithOptions<O>, O>
): [accessor: Accessor<T | null>, setter: Setter<T | null>, refetch: () => void] {
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
      const value = api.getItem(`${prefix}${key}`) as T | null;
      if (value !== null && props?.deserializer) {
        return props.deserializer(value as string, key, props?.options as O) as T;
      }
      return value;
    }, null);
  const [accessor, setter] = createSignal<T | null>(read() ?? (initialValue as T));
  createEffect(() => {
    const value = accessor();
    const filteredValue = props?.serializer
      ? props.serializer(value as string & T, key, props?.options)
      : (value as string);
    if (value === null) {
      apis.forEach(api => api.removeItem(`${prefix}${key}`));
    } else {
      apis.forEach(api => api.setItem(`${prefix}${key}`, filteredValue, props?.options));
    }
  });
  const refetch = () => {
    const value = read();
    setter(value as any);
  };
  onMount(() => {
    const listener = (ev: StorageEvent) => {
      let changed = false;
      apis.forEach(api => {
        if (api !== ev.storageArea && ev.key && ev.newValue !== api.getItem(ev.key)) {
          ev.newValue ? api.setItem(ev.key, ev.newValue) : api.removeItem(ev.key);
          changed = true;
        }
      });
      changed && refetch();
    };
    if ("addEventListener" in globalThis) {
      globalThis.addEventListener("storage", listener);
      onCleanup(() => globalThis.removeEventListener("storage", listener));
    } else {
      apis.forEach(api => api.addEventListener?.("storage", listener));
      onCleanup(() => apis.forEach(api => api.removeEventListener?.("storage", listener)));
    }
  });
  return [accessor, setter, refetch];
}

export const createLocalStorage = createStorage;

export const createSessionStorage = <T, O>(props: StorageProps<T, Storage, O>) =>
  createStorage({ ...props, api: globalThis.sessionStorage } as any);
