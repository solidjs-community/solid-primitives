import { DEV } from "solid-js";
import { RequestContext } from "./fetch";
import { RequestModifier, wrapFetcher } from "./modifiers";

export type CacheEntry<T = any> = {
  ts: number;
  requestData: [info: RequestInfo, init?: RequestInit];
  data: T;
};

export type RequestCache<T = any> = Record<string, CacheEntry<T>>;

export type CacheOptions<T = any> = {
  expires: number | ((entry: CacheEntry<T>) => boolean);
  cache?: RequestCache<T>;
};

export const defaultCacheOptions: CacheOptions = {
  expires: 5000,
  cache: {}
};

export const serializeRequest = <FetcherArgs extends any[]>(requestData: FetcherArgs): string =>
  JSON.stringify({
    ...(typeof requestData[0] === "string" ? { url: requestData[0] } : requestData[0]),
    ...requestData[1]
  });

/**
 * Modifies createFetch request to support caching
 * ```ts
 * withCache({
 *   expires: number | ((entry: CacheEntry<T>) => boolean);
 *   cache?: RequestCache<T>; // global cache by default
 * })
 * ```
 * `CacheEntry` is structured as follows:
 * ```ts
 * type CacheEntry<T = any> = {
 *   ts: number;
 *   requestData: [info: RequestInfo, init?: RequestInit];
 *   data: T;
 * };
 * ```
 * The RequestCache is a simple object.
 */
export const withCache: RequestModifier =
  <Result extends unknown, FetcherArgs extends any[]>(
    options: CacheOptions = defaultCacheOptions
  ) =>
  (requestContext: RequestContext<Result, FetcherArgs>) => {
    requestContext.cache = options.cache || requestContext.cache;
    requestContext.expires = options.expires;
    const isExpired = (entry: CacheEntry) =>
      typeof options.expires === "number"
        ? entry.ts + options.expires < new Date().getTime()
        : options.expires(entry);
    wrapFetcher<Result, FetcherArgs>(
      requestContext,
      <T>(originalFetcher: any) =>
        (requestData, info) => {
          requestContext.lastRequestData = requestData;
          const serializedRequest: string = serializeRequest(requestData);
          const cached: CacheEntry | undefined = requestContext.cache[serializedRequest];
          const shouldRead = requestContext.readCache?.(cached) !== false;
          if (cached && !isExpired(cached) && shouldRead) {
            return Promise.resolve<T>(cached.data);
          }
          return originalFetcher(requestData, info).then((data: T) => {
            const cacheEntry = {
              ts: new Date().getTime(),
              requestData: requestData,
              data
            };
            requestContext.cache[serializedRequest] = cacheEntry;
            requestContext.writeCache?.(serializedRequest, cacheEntry);
            return data;
          });
        }
    );
    requestContext.wrapResource();
    Object.assign(requestContext.resource![1], {
      invalidate: (requestData?: FetcherArgs) => {
        try {
          delete requestContext.cache[serializeRequest(requestData || requestContext.lastRequestData)];
        } catch (e) {
          DEV &&
            console.warn("attempt to invalidate cache for", requestData || requestContext.lastRequestData, "failed with error", e);
        }
      }
    });
  };

export const withRefetchOnExpiry: RequestModifier =
  <Result extends unknown, FetcherArgs extends any[]>(pollDelayMs = 100) =>
  (requestContext: RequestContext<Result, FetcherArgs>) => {
    wrapFetcher<Result, FetcherArgs>(
      requestContext,
      <T>(originalFetcher: any) =>
        (requestData, info) => {
          const serializedRequest = serializeRequest(requestData);
          const cached: CacheEntry | undefined = requestContext.cache[serializedRequest];
          if (!cached) {
            if (typeof requestContext.expires === "number") {
              setTimeout(() => requestContext.resource?.[1].refetch(), requestContext.expires + 10);
            } else if (typeof requestContext.expires === "function") {
              const delay =
                pollDelayMs === 0
                  ? (fn: FrameRequestCallback, _ms: number) => requestAnimationFrame(fn)
                  : setTimeout;
              const poll = () => {
                if (requestContext.expires(cached)) {
                  requestContext.resource?.[1].refetch();
                } else {
                  delay(poll, pollDelayMs);
                }
              };
              poll();
            }
          }
          return originalFetcher(requestData, info);
        }
    );
    requestContext.wrapResource();
    const originalInvalidate = requestContext.resource![1].invalidate;
    requestContext.resource![1].invalidate = (requestData?: FetcherArgs) => {
      originalInvalidate?.(requestData);
      requestContext.resource?.[1].refetch();
    }
  };

export const withCacheStorage: RequestModifier =
  (storage: Storage = localStorage, key = "fetch-cache") =>
  requestContext => {
    try {
      const loadedCache = JSON.parse(storage.getItem(key) || "{}");
      Object.assign(requestContext.cache, loadedCache);
    } catch (e) {
      DEV && console.warn("attempt to parse stored request cache failed with error", e);
    }
    const originalWriteCache = requestContext.writeCache;
    requestContext.writeCache = (...args: any[]) => {
      originalWriteCache?.(...args);
      try {
        storage.setItem(key, JSON.stringify(requestContext.cache));
      } catch (e) {
        DEV && console.warn("attempt to store request cache failed with error", e);
      }
    };
    requestContext.wrapResource();
  };
