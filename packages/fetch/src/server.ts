import { fetchRequest as originalFetchRequest } from "./request";

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

let fetchFallback: typeof fetch;
try {
  const nodeFetch = require("node-fetch");
  fetchFallback = nodeFetch;
} catch (_e) {
  fetchFallback = () => {
    console.warn(
      '"\x1b[33m⚠️ package missing to run createFetch on the server.\n Please run:\x1b[0m\n\nnpm i node-fetch\n"'
    );
    return Promise.reject();
  };
}

const fetchRequest = !globalThis.fetch
  ? (fetch = fetchFallback) => originalFetchRequest(fetch)
  : originalFetchRequest;

export { fetchRequest };
