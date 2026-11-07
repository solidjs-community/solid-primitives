/**
 * Utilities for composing `createResource` fetchers: abortable requests, response
 * caching, retrying, aggregating paginated data, and a deep-store-backed signal.
 *
 * @module
 */
import {
  createMemo,
  createSignal,
  type Accessor,
  type Signal,
  onCleanup,
  createStore,
  createComponent,
  isPending,
  Show,
} from "solid-js";

import { type JSX } from "@solidjs/web";

interface Unresolved {
  state: "unresolved";
  loading: false;
  error: undefined;
  latest: undefined;
  (): undefined;
}

interface Pending {
  state: "pending";
  loading: true;
  error: undefined;
  latest: undefined;
  (): undefined;
}

interface Ready<T> {
  state: "ready";
  loading: false;
  error: undefined;
  latest: T;
  (): T;
}

interface Refreshing<T> {
  state: "refreshing";
  loading: true;
  error: undefined;
  latest: T;
  (): T;
}

interface Errored {
  state: "errored";
  loading: false;
  error: any;
  latest: never;
  (): never;
}

export type Resource<T> = Unresolved | Pending | Ready<T> | Refreshing<T> | Errored;

export type InitializedResource<T> = Ready<T> | Refreshing<T> | Errored;

export type ResourceActions<T, R = unknown> = {
  mutate: Signal<T>[1];
  refetch: (info?: R) => T | Promise<T> | undefined | null;
};

export type ResourceSource<S> = S | false | null | undefined | (() => S | false | null | undefined);

export type ResourceFetcher<S, T, R = unknown> = (
  k: S,
  info: ResourceFetcherInfo<T, R>
) => T | Promise<T>;

export type ResourceFetcherInfo<T, R = unknown> = {
  value: T | undefined;
  refetching: R | boolean;
};

export type ResourceOptions<T, S = unknown> = {
  initialValue?: T;
  name?: string;
  deferStream?: boolean;
  ssrLoadFrom?: "initial" | "server";
  storage?: <X>(...args: any[]) => Signal<X>;
  onHydrated?: (k: S | undefined, info: { value: T | undefined }) => void;
};

export type InitializedResourceOptions<T, S = unknown> = ResourceOptions<T, S> & {
  initialValue: T;
};

export type ResourceReturn<T, R = unknown> = [Resource<T>, ResourceActions<T | undefined, R>];

export type InitializedResourceReturn<T, R = unknown> = [
  InitializedResource<T>,
  ResourceActions<T, R>
];

/**
 * Creates a resource that wraps a repeated promise in a reactive pattern:
 * ```typescript
 * // Without source
 * const [resource, { mutate, refetch }] = createResource(fetcher, options);
 * // With source
 * const [resource, { mutate, refetch }] = createResource(source, fetcher, options);
 * ```
 * @param source - reactive data function which has its non-nullish and non-false values passed to the fetcher, optional
 * @param fetcher - function that receives the source (true if source not provided), the last or initial value, and whether the resource is being refetched, and returns a value or a Promise:
 * ```typescript
 * const fetcher: ResourceFetcher<S, T, R> = (
 *   sourceOutput: S,
 *   info: { value: T | undefined, refetching: R | boolean }
 * ) => T | Promise<T>;
 * ```
 * @param options - an optional object with the initialValue and the name (for debugging purposes); see {@link ResourceOptions}
 *
 * @returns ```typescript
 * [Resource<T>, { mutate: Setter<T>, refetch: () => void }]
 * ```
 *
 * * Setting an `initialValue` in the options will mean that both the prev() accessor and the resource should never return undefined (if that is wanted, you need to extend the type with undefined)
 * * `mutate` allows to manually overwrite the resource without calling the fetcher
 * * `refetch` will re-run the fetcher without changing the source, and if called with a value, that value will be passed to the fetcher via the `refetching` property on the fetcher's second parameter
 *
 * @description https://docs.solidjs.com/reference/basic-reactivity/create-resource
 */
export function createResource<T, R = unknown, I = T>(
  fetcher: (k: true, info: ResourceFetcherInfo<T | I, R>) => T | Promise<T>,
  options: ResourceOptions<T | I, true> & { initialValue: I }
): InitializedResourceReturn<T | I, R>;
export function createResource<T, R = unknown>(
  fetcher: ResourceFetcher<true, T, R>,
  options?: ResourceOptions<NoInfer<T>, true>
): ResourceReturn<T, R>;
export function createResource<T, S, R = unknown, I = T>(
  source: ResourceSource<S>,
  fetcher: (k: S, info: ResourceFetcherInfo<T | I, R>) => T | Promise<T>,
  options: ResourceOptions<T | I, S> & { initialValue: I }
): InitializedResourceReturn<T | I, R>;
export function createResource<T, S, R = unknown>(
  source: ResourceSource<S>,
  fetcher: ResourceFetcher<S, T, R>,
  options?: ResourceOptions<NoInfer<T>, S>
): ResourceReturn<T, R>;
export function createResource<T, S, R>(
  pSource: ResourceSource<S> | ResourceFetcher<S, T, R>,
  pFetcher?: ResourceFetcher<S, T, R> | ResourceOptions<T, S>,
  pOptions?: ResourceOptions<T, S> | undefined
): ResourceReturn<T, R> {
  let source: ResourceSource<S>;
  let fetcher: ResourceFetcher<S, T, R>;
  let options: ResourceOptions<T, S>;

  if (typeof pFetcher === "function") {
    source = pSource as ResourceSource<S>;
    fetcher = pFetcher as ResourceFetcher<S, T, R>;
    options = pOptions || ({} as ResourceOptions<T, S>);
  } else {
    source = true as ResourceSource<S>;
    fetcher = pSource as ResourceFetcher<S, T, R>;
    options = (pFetcher || {}) as ResourceOptions<T, S>;
  }
  
  let error: any;
  let value: T | undefined = options.initialValue;
  let refetching = false;
  let state: Resource<T>["state"] = "unresolved";
  
  const [getter, setter] = (options.storage ?? createSignal)(async () => {
    if (state !== "refreshing") {      
      state = "pending";
    }
    let sourceValue = source instanceof Function ? source() : source;
    if (!sourceValue) return value as T;
    try {
      const result = await fetcher(sourceValue, { value, refetching });
      value = result;
      state = "ready";
    } catch (err: any) {
      error = err;
      state = "errored";
    } finally {
      refetching = false;
      return value as T;
    }
  }, {
    name: options.name,
    deferStream: options.deferStream,
    loadingValue: value,
    
  });
  
  return [Object.assign(() => {
      if (error) throw error;
      return getter();
    }, {
    get state() { return state; },
    get loading() { return state === "pending"; },
    get error(): any {
      const output = error;
      error = undefined;
      return output;
    },
    get latest() { return value; }
  }), {
    mutate: (value: T | undefined) => {
      state = "ready";
      return setter(value! as any);
    },
    refetch: () => {
      state = "refreshing";
      // TODO: actually refetch
    },
  }] as unknown as ResourceReturn<T>;
}

export type SuspenseProps = {
  children: JSX.Element;
  fallback?: JSX.Element;
}

/**
 * Tracks all resources inside a component and renders a fallback until they are all resolved
 * ```typescript
 * const AsyncComponent = lazy(() => import('./component'));
 *
 * <Suspense fallback={<LoadingIndicator />}>
 *   <AsyncComponent />
 * </Suspense>
 * ```
 * @description https://docs.solidjs.com/reference/components/suspense
 */
export const Suspense = (props: SuspenseProps): JSX.Element => createComponent(Show, {
  get when() { return !isPending(() => props.children); },
  get fallback() { return props.fallback; },
  get children() { return () => props.children; },
});

/** Options for {@link makeAbortable} and {@link createAbortable}. */
export type AbortableOptions = {
  /** When true, a new call to `signal()` will not automatically abort a still-pending previous request. */
  noAutoAbort?: boolean;
  /** Time in milliseconds after which the signal auto-aborts. */
  timeout?: number;
};

/**
 * **Creates and handles an AbortSignal**
 * ```ts
 * const [signal, abort, filterAbortError] =
 *   makeAbortable({ timeout: 10000 });
 * const fetcher = (url) => fetch(url, { signal: signal() })
 *   .catch(filterAbortError); // filters abort errors
 * ```
 * Returns an accessor for the signal and the abort callback.
 *
 * Options are optional and include:
 * - `timeout`: time in Milliseconds after which the fetcher aborts automatically
 * - `noAutoAbort`: can be set to true to make a new source not automatically abort a previous request
 */
export function makeAbortable(
  options: AbortableOptions = {},
): [
  signal: () => AbortSignal,
  abort: (reason?: string) => void,
  filterAbortError: (err: any) => void,
] {
  let controller: AbortController | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const abort = (reason?: string) => {
    timeout && clearTimeout(timeout);
    controller?.abort(reason);
  };
  const signal = () => {
    if (!options.noAutoAbort && controller?.signal.aborted === false) {
      abort("retry");
    }
    controller = new AbortController();
    if (options.timeout) {
      timeout = setTimeout(() => abort("timeout"), options.timeout);
    }
    return controller.signal;
  };
  return [
    signal,
    abort,
    err => {
      if (err.name === "AbortError") {
        return undefined;
      }
      throw err;
    },
  ];
}

/**
 * **Creates and handles an AbortSignal with automated cleanup**
 * ```ts
 * const [signal, abort, filterAbortError] =
 *   createAbortable();
 * const fetcher = (url) => fetch(url, { signal: signal() })
 *   .catch(filterAbortError); // filters abort errors
 * ```
 * Returns an accessor for the signal and the abort callback.
 *
 * Options are optional and include:
 * - `timeout`: time in Milliseconds after which the fetcher aborts automatically
 * - `noAutoAbort`: can be set to true to make a new source not automatically abort a previous request
 */

export function createAbortable(
  options?: AbortableOptions,
): [() => AbortSignal, () => void, (err: any) => void] {
  const [signal, abort, filterAbortError] = makeAbortable(options);
  onCleanup(abort);
  return [signal, abort, filterAbortError];
}

const mapEntries = (entries: [key: string, value: any][]) =>
  entries.map(entry => entry.map(serializer).join(":"));

/** Default `sourceHash` used by {@link makeCache}: recursively stringifies a fetcher source into a stable cache key. */
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

/** A cached response as stored by {@link makeCache}, keyed by its serialized source. */
export type CacheEntry<T, S> = {
  source: S;
  data: T;
  ts: number;
};
/** Default, module-global cache shared by all {@link makeCache} calls that don't pass their own `cache`. */
export const cache: Record<string, CacheEntry<any, any>> = {};

/** Options for {@link makeCache}. */
export type CacheOptions<T, S> = {
  /** A local cache to use instead of the global {@link cache}. */
  cache?: Record<string, CacheEntry<T, S>>;
  /** Fixed number of milliseconds, or a function of the cached entry, after which a cache entry expires. */
  expires?: number | ((entry: Omit<CacheEntry<T, S>, "ts">) => number);
  /** `[serialize, deserialize]` pair used to persist the cache to `storage`. Defaults to `[JSON.stringify, JSON.parse]`. */
  serialize?: [(input: any) => string, (input: string) => any];
  /** Function computing the cache key from a fetcher source. Defaults to {@link serializer}. */
  sourceHash?: (source: S) => string;
  /** A storage like `localStorage` used to persist the cache across reloads. */
  storage?: Storage;
  /** Key under which the cache is persisted in `storage`. */
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
    } catch (_) {
      /**/
    }
  };
  const expireTimeout =
    typeof options?.expires === "function"
      ? options.expires
      : () => (options?.expires as number | undefined) || 300000;
  if (options?.storage) {
    try {
      Object.assign(localCache, deserialize(options.storage.getItem(key) || "{}"));
    } catch (_) {
      /**/
    }
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

/** Options for {@link makeRetrying}. */
export type RetryOptions = {
  /** Milliseconds to wait before retrying. Defaults to 5000. */
  delay?: number;
  /** Number of times to retry before giving up and throwing the last error. Defaults to 3. */
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
export function createAggregated<R, I extends R | R[]>(res: Accessor<R>, initialValue?: I): Accessor<I | R | {} | R[] | I[] | undefined> {
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
  }, { loadingValue: initialValue });
}

/**
 * **Creates a store-based signal for fine-grained resources**
 * ```ts
 * const [data] = createResource(fetcher, { storage, createDeepSignal });
 * ```
 * @see https://www.solidjs.com/docs/latest/api#createresource:~:text=Resources%20can%20be%20set%20with%20custom%20defined%20storage
 */
export function createDeepSignal<T>(): Signal<T | undefined>;
/** {@link createDeepSignal} overload with an initial value. */
export function createDeepSignal<T>(value: T): Signal<T>;
export function createDeepSignal<T>(v?: T): Signal<T> {
  const [store, setStore] = createStore([v]);
  return [
    () => store[0],
    (update: T | undefined) => (
      setStore(current => { current[0] = update; }),
      store[0]
    ),
  ] as Signal<T>;
}
