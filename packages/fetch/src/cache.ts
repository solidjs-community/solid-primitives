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

export const serializeRequest = (requestData: [info: RequestInfo, init?: RequestInit]): string =>
  JSON.stringify({
    ...(typeof requestData[0] === "string" ? { url: requestData[0] } : requestData[0]),
    ...requestData[1]
  });

export const withCache: RequestModifier =
  <T>(options: CacheOptions = defaultCacheOptions) =>
  (requestContext: RequestContext<T>) => {
    requestContext.cache = requestContext.cache || options.cache;
    const isExpired = (entry: CacheEntry) =>
      typeof options.expires === "number"
        ? entry.ts + options.expires > new Date().getTime()
        : options.expires(entry);
    wrapFetcher<T>(requestContext, <T>(originalFetcher: any) => (requestData, info) => {
      const serializedRequest = serializeRequest(requestData);
      const cached: CacheEntry | undefined = requestContext.cache[serializedRequest];
      const shouldRead = requestContext.readCache?.(cached) !== false;
      if (cached && !isExpired(cached) && shouldRead) {
        return Promise.resolve<T>(cached.data);
      }
      return originalFetcher(requestData, info).then((data: T) => {
        requestContext.writeCache?.(
          serializedRequest,
          (requestContext.cache[serializedRequest] = {
            ts: new Date().getTime(),
            requestData: requestData,
            data
          })
        );
        return data;
      });
    });
    requestContext.wrapResource();
    Object.assign(requestContext.resource![1], {
      invalidate: (requestData: [info: RequestInfo, init?: RequestInit]) => {
        try {
          delete requestContext.cache[serializeRequest(requestData)];
        } catch (e) {
          DEV &&
            console.warn("attempt to invalidate cache for", requestData, "failed with error", e);
        }
      }
    });
  };

export const withCacheStorage: RequestModifier =
  (storage: Storage = localStorage, key = "fetch-cache") =>
  requestContext => {
    try {
      const loadedCache = JSON.parse(storage.getItem(key) || "{}");
      requestContext.cache = loadedCache;
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
