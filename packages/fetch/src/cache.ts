import { DEV } from "solid-js";
import { RequestContext } from "./fetch";
import { RequestModifier, wrapFetcher } from "./modifiers";

export type CacheEntry = {
  ts: number;
  requestData: [info: RequestInfo, init?: RequestInit];
  data: any;
};

export type CacheOptions = {
  expires: number | ((entry: CacheEntry) => boolean);
};

export const defaultCacheOptions = {
  expires: 5000
};

export type RequestCache = Record<string, Response>;

export const serializeRequest = (requestData: [info: RequestInfo, init?: RequestInit]): string =>
  JSON.stringify({
    ...(typeof requestData[0] === "string" ? { url: requestData[0] } : requestData[0]),
    ...requestData[1]
  });

export const withCache: RequestModifier =
  <T>(options = defaultCacheOptions) =>
  (requestContext: RequestContext<T>) => {
    requestContext.cache = {} as RequestCache;
    const isExpired =
      typeof options.expires === "number"
        ? (entry: CacheEntry) => entry.ts + options.expires > new Date().getTime()
        : options.expires;
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
  };

export const withCacheStorage: RequestModifier =
  (storage: Storage = localStorage, key = "cache") =>
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
        localStorage.setItem(key, JSON.stringify(requestContext.cache));
      } catch (e) {
        DEV && console.warn("attempt to store request cache failed with error", e);
      }
    };
    requestContext.wrapResource();
  };
