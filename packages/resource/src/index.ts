import {
  createMemo,
  createSignal,
  type Accessor,
  type ResourceFetcher,
  type ResourceFetcherInfo,
  type Signal,
} from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";

export type AbortableOptions = {
  noAutoAbort?: true;
  timeout?: number;
};

/**
 * **Creates and handles an AbortSignal**
 * ```ts
 * const [signal, abort] = makeAbortable({ timeout: 10000 });
 * const fetcher = (url) => fetch(url, { signal: signal() });
 * ```
 * Returns an accessor for the signal and the abort callback.
 *
 * Options are optional and include:
 * - `timeout`: time in Milliseconds after which the fetcher aborts automatically
 * - `noAutoAbort`: can be set to true to make a new source not automatically abort a previous request
 */
export function makeAbortable(
  options?: AbortableOptions,
): [signal: () => AbortSignal, abort: () => void] {
  let controller: AbortController | undefined;
  let timeout: NodeJS.Timeout | number | undefined;
  const abort = () => {
    timeout && clearTimeout(timeout);
    controller?.abort();
  };
  const signal = () => {
    if (!options?.noAutoAbort && controller?.signal.aborted === false) {
      abort();
    }
    controller = new AbortController();
    if (options?.timeout) {
      timeout = setTimeout(abort, options.timeout);
    }
    return controller.signal;
  };
  return [signal, abort];
}

const mapEntries = (entries: [key: string, value: any][]) =>
  entries.map(entry => entry.map(serializer).join(":"));

export const serializer = (req: any): string =>
  // non-objects and null allow for string coercion
  !req || typeof req !== "object"
    ? req + "" === req
      ? `"${req}"`
      : req + ""
    : // serializing the array items allows for string coercion: [1,2,3] == "[1,2,3]"
    Array.isArray(req)
    ? `[${req.map(serializer)}]`
    : // Headers and maps support an entries method giving an entries iterator,
      // otherwise use Object.entries()s
      `{${mapEntries(
        typeof req.entries === "function" ? [...req.entries()] : Object.entries(req),
      )}}`;

export type CacheEntry<T, S> = {
  source: S;
  data: T;
  ts: number;
};
export const cache: Record<string, CacheEntry<any, any>> = {};

export type CacheOptions<T, S> = {
  cache?: Record<string, CacheEntry<T, S>>;
  expires?: number | ((entry: Omit<CacheEntry<T, S>, "ts">) => number);
  serialize?: [(input: any) => string, (input: string) => any];
  sourceHash?: (source: S) => string;
  storage?: Storage;
  storageKey?: string;
};

/**
 * **Creates a caching fetcher**
 * ```ts
 * const [fetcher, invalidate, expired] =
 *   makeCache(
 *     (source) => fetch(source).then(r => r.json()),
 *     { storage: localStorage, storageKey: 'foo' }
 *   );
 * ```
 * Wraps the fetcher to use a cache. Returns the wrapped fetcher, an invalidate callback that requires the source to invalidate the request and a signal accessor with the last automatically invalidated request.
 *
 * Can be customized with the following optional options:
 * - `cache` - allows to use a local cache instead of the global one, of type `Record<string, CacheEntry<T, S>>`
 * - `expires` - allows to define a custom timeout; either accepts a number or a function that receives an object with source and data of the request and returns a number in Milliseconds
 * - `serialize` - a tuple [serialize, deserialize] used for persistence, default is `[JSON.stringify, JSON.parse]`
 * - `sourceHash` - a function receiving the source (true if none is used) and returns a hash string
 * - `storage` - a storage like localStorage to persist the cache over reloads
 * - `storageKey` - the key which is used to store the cache in the storage
 */
export function makeCache<T, S, R>(
  fetcher: ResourceFetcher<S, T, R>,
  options?: CacheOptions<T, S>,
): [
  fetcher: ResourceFetcher<S, T, R>,
  invalidate: ((source?: S) => void) & { all: () => void },
  expired: Accessor<CacheEntry<T, S> | undefined>,
] {
  const [expired, setExpired] = createSignal<CacheEntry<T, S>>();
  const [serialize, deserialize] = options?.serialize || [JSON.stringify, JSON.parse];
  const localCache = options?.cache || (cache as Record<string, CacheEntry<T, S>>);
  const key = options?.storageKey || "solid-cache";
  const save = () => {
    try {
      options?.storage?.setItem(key, serialize(localCache));
    } catch (e) {}
  };
  const expireTimeout =
    typeof options?.expires === "function"
      ? options.expires
      : () => (options?.expires as number | undefined) || 300000;
  if (options?.storage) {
    try {
      Object.assign(localCache, deserialize(options.storage.getItem(key) || "{}"));
    } catch (e) {}
  }
  const sourceHash = options?.sourceHash || serializer;
  return [
    async (s: S, info: ResourceFetcherInfo<T, R>) => {
      const hash = sourceHash(s);
      const cachedEntry: CacheEntry<T, S> | undefined = Object.hasOwn(localCache, hash)
        ? localCache[hash]
        : undefined;
      const now = +new Date();
      if (cachedEntry && (cachedEntry.ts || now) >= now) {
        return cachedEntry.data;
      }
      const response: T = await fetcher(s, info);
      const entry = { source: s, data: response } as CacheEntry<T, S>;
      const expiryDelay = expireTimeout(entry);
      entry.ts = now + expiryDelay;
      localCache[hash] = entry;
      save();
      setTimeout(() => {
        if (Object.hasOwn(localCache, hash)) {
          delete localCache[hash];
          save();
          setExpired(entry);
        }
      }, expiryDelay);
      return response;
    },
    Object.assign(
      (s: S = true as S) => {
        delete localCache[sourceHash(s)];
        save();
      },
      {
        all: () => {
          Object.keys(localCache).forEach(key => {
            delete localCache[key];
          });
          save();
        },
      },
    ),
    expired,
  ];
}

export type RetryOptions = {
  delay?: number;
  retries?: number;
};

/**
 * **Creates a fetcher that retries multiple times in case of errors**
 * ```ts
 * const fetcher = makeRetrying((url) => fetch(url), { retries: 5 });
 * ```
 * Receives the fetcher and an optional options object and returns a wrapped fetcher that retries on error after a delay multiple times.
 *
 * The optional options object contains the following optional properties:
 * - `delay` - number of Milliseconds to wait before retrying; default is 5s
 * - `retries` - number of times a request should be repeated before giving up throwing the last error; default is 3 times
 */
export function makeRetrying<S, T, R = unknown>(
  fetcher: ResourceFetcher<S, T, R>,
  options: RetryOptions = {},
): ResourceFetcher<S, T, R> {
  const delay = options.delay ?? 5000;
  let retries = options.retries || 3;
  const retrying: ResourceFetcher<S, T, R> = async (k: S, info: ResourceFetcherInfo<T, R>) => {
    try {
      return await fetcher(k, info);
    } catch (error: unknown) {
      if (retries-- > 0) {
        delay && (await new Promise(resolve => setTimeout(resolve, delay)));
        return retrying(k, info);
      } else {
        retries = options.retries || 3;
        throw error;
      }
    }
  };
  return retrying;
}

function toArray(item: any) {
  return Array.isArray(item) ? item : item ? [item] : [];
}

/**
 * **Automatically aggregates resource changes**
 * ```ts
 * const pages = makeAggregated(currentPage, []);
 * ```
 * Depending on the content of the initialValue or the first response, this will aggregate the incoming responses:
 * - null will not overwrite undefined
 * - if the previous value is an Array, incoming values will be appended
 * - if any of the values are Objects, the current one will be shallow-merged into the previous one
 * - if the previous value is a string, more string data will be appended
 * - otherwise the incoming data will be put into an array
 *
 * Objects and Arrays are re-created on each operation, but the values will be left untouched, so `<For>` should work fine.
 */
export function createAggregated<R, I extends R | R[]>(res: Accessor<R>, initialValue?: I) {
  return createMemo<I | R | {} | R[] | I[] | undefined>(previous => {
    const current = res();
    return current == null && previous == null
      ? previous
      : Array.isArray(previous || current)
      ? [...toArray(previous), ...toArray(current)]
      : typeof (previous || current) === "object"
      ? { ...previous, ...current }
      : typeof previous === "string" || typeof current === "string"
      ? (previous?.toString() || "") + (current || "")
      : previous
      ? [previous, current]
      : [current];
  }, initialValue);
}

/**
 * **Creates a store-based signal for fine-grained resources**
 * ```ts
 * const [data] = createResource(fetcher, { storage, createDeepSignal });
 * ```
 * @see https://www.solidjs.com/docs/latest/api#createresource:~:text=Resources%20can%20be%20set%20with%20custom%20defined%20storage
 */
export function createDeepSignal<T>(): Signal<T | undefined>;
export function createDeepSignal<T>(value: T): Signal<T>;
export function createDeepSignal<T>(v?: T): Signal<T> {
  const [store, setStore] = createStore([v]);
  return [
    () => store[0],
    (update: T) => (
      setStore(0, reconcile(typeof update === "function" ? update(unwrap(store[0])) : v)), store[0]
    ),
  ] as Signal<T>;
}
