export { createFetch, FetchReturn, FetchOptions, RequestContext } from "./fetch";
export {
  withAbort,
  withCatchAll,
  withTimeout,
  withRetry,
  withRefetchEvent,
  wrapFetcher,
  wrapResource
} from "./modifiers";
export { withCache, withCacheStorage } from "./cache";

import { fetchRequest as originalFetchRequest } from "./request";

let fetchFallback: typeof fetch;
try {
  const nodeFetch = require("node-fetch");
  fetchFallback = nodeFetch;
} catch (_e) {
  fetchFallback = () => {
    console.warn(
      '"\x1b[33m⚠️ package missing to run createFetch on the server.\n Please run:\x1b[0m\n\nnpm i node-fetch\n"'
    );
    return Promise.reject(new Error("fetch not available"));
  };
}

const fetchRequest = !globalThis.fetch
  ? (fetch: any) => {
      const originalRequest = originalFetchRequest(fetch ?? fetchFallback);
      console.warn(originalRequest instanceof Promise);
      return originalRequest;
    }
  : originalFetchRequest;

export { fetchRequest };
