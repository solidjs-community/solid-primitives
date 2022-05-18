import { createSignal, ResourceFetcherInfo } from "solid-js";
import { RequestContext } from "./fetch";

export type RequestModifier = <T>(...args: any[]) => (requestContext: RequestContext<T>) => any;

export type Fetcher<T> = Exclude<RequestContext<T>['fetcher'], undefined>;

export const wrapFetcher = <T>(
  requestContext: RequestContext<T>,
  wrapper: (originalFetcher: Fetcher<T>) => Fetcher<T>
) => {
  const originalFetcher = requestContext.fetcher
  if (!originalFetcher) {
    throw new Error("could not read resource fetcher");
  }
  requestContext.fetcher = wrapper(originalFetcher) || originalFetcher;
};

export const wrapResource = <T>(
  requestContext: RequestContext<T>,
  wrapper: (requestContext: RequestContext<T>) => [
    props?: { [key: string]: any },
    actions?: { [key: string]: any }
  ]
) => {
  if (!requestContext.resource) {
    throw new Error("could not read resource");
  }
  const [props, actions] = wrapper(requestContext);
  props && Object.defineProperties(requestContext.resource[0], props);
  actions && Object.assign(requestContext.resource[1], actions);
};

export const withAbort: RequestModifier =
  <T>() =>
  requestContext => {
    wrapFetcher(requestContext, (originalFetcher) => <T>(
      requestData: [info: RequestInfo, init?: RequestInit],
      info: ResourceFetcherInfo<T>
    ) => {
      if (requestContext.abortController) {
        requestContext.abortController.abort();
      }
      requestContext.abortController = new AbortController();
      return originalFetcher(
        [requestData[0], { ...requestData[1], signal: requestContext.abortController.signal }],
        info
      ).catch(err => {
        if (info.value && err.name === "AbortError") {
          return Promise.resolve(info.value);
        }
        throw err;
      });
    });
    requestContext.wrapResource();
    wrapResource(requestContext, (requestContext) => [{
      aborted: { get: () => requestContext.abortController?.signal.aborted || false },
      status: { get: () => requestContext.response?.status },
      response: { get: () => requestContext.response }
    }, {
      abort: () => requestContext.abortController?.abort()
    }]);
  };

export const withTimeout: RequestModifier =
  <T>(timeout: number) =>
  requestContext => {
    wrapFetcher(requestContext, (originalFetcher) => (requestData, info) =>
    new Promise((resolve, reject) => {
      window.setTimeout(() => {
        requestContext.abortController?.abort("timeout");
        reject(new Error("timeout"));
      }, timeout);
      originalFetcher(requestData, info).then(resolve as any).catch(reject);
    }));
    requestContext.wrapResource();
  }

export const withCatchAll: RequestModifier =
  <T>() =>
  requestContext => {
    const [error, setError] = createSignal<Error | undefined>();
    wrapFetcher(requestContext, (originalFetcher) =>  (requestData, info) =>
      originalFetcher(requestData, info).catch(err => {
        setError(err);
        return Promise.resolve(info.value!);
      }));
    requestContext.wrapResource();
    wrapResource(requestContext, () => [{ error: { get: () => error() } }, undefined]);
  };

export type CacheOptions = {
  /** put the cached data into a storage, e.g. localStorage */
  storage?: Storage,
  /** put the cached data into a certain key in the storage; only works if a storage is specified */
  storageKey?: string,
  
};
  
/**
 * Caches requests
 * @param options 
 * @returns 
 */
export const withCache: RequestModifier = <T>(options: CacheOptions) => (requestContext) => {
  // TODO
}

const defaultWait = (attempt: number) => Math.max(1000 << attempt, 30000);

/**
 * Retries the request if it failed
 * 
 * @param retries the amount of times the request should be retried if it fails.
 * @param wait the time it should wait as a number of ms or a function that receives the 
 * number of the current attempt and returns a number; default is 1000 doubled on every
 * retry, but never more than 30000.
 * @param verify a function that receives the response and verifies if it is valid;
 * default checks if response.ok is true.
 */
export const withRetry: RequestModifier = <T>(
  retries: number,
  wait: number | ((attempt: number) => number) = defaultWait,
  verify = (response?: Response) => response?.ok
) => (requestContext) => {
  const waitForAttempt = (attempt: number) => new Promise<void>((resolve) => 
    setTimeout(resolve, typeof wait === 'number' ? wait : wait(attempt))
  );
  wrapFetcher(requestContext, (originalFetcher) =>
    <T>(
      requestData: [info: RequestInfo, init?: RequestInit | undefined],
      info: ResourceFetcherInfo<T>
    ) => {
      const wrappedFetcher = (attempt: number): Promise<T> => originalFetcher<T>(requestData, info)
        .then((data: T) => !verify(requestContext.response) && attempt <= retries
          ? waitForAttempt(attempt).then(() => wrappedFetcher(attempt + 1))
          : data
        )
        .catch((err) => attempt > retries
          ? Promise.reject(err)
          : waitForAttempt(attempt).then(() => wrappedFetcher(attempt + 1))
        );
      return wrappedFetcher(0);
    })
  requestContext.wrapResource();
};
