import { createSignal, ResourceFetcherInfo } from "solid-js";
import { RequestContext } from "./fetch";

export type RequestModifier = <T>(...args: any[]) => (requestContext: RequestContext<T>) => any;

export const withRequest: RequestModifier =
  <T>() =>
  requestContext => {
    requestContext.fetcher = (requestData: [info: RequestInfo, init?: RequestInit]) =>
      globalThis.fetch?.(...requestData).then((response: Response) => {
        if (requestContext.responseHandler) {
          return requestContext.responseHandler(response) as unknown as T;
        }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          return response.json();
        } else if (contentType.includes("text/")) {
          return response.text();
        } else {
          return response.blob();
        }
      });
    requestContext.wrapResource();
  };

export const withAbort: RequestModifier =
  <T>() =>
  requestContext => {
    const originalFetcher = requestContext.fetcher;
    if (!originalFetcher) {
      return Promise.reject(new Error("could not create resource fetcher"));
    }
    requestContext.fetcher = <T>(
      requestData: [info: RequestInfo, init?: RequestInit],
      info: ResourceFetcherInfo<T>
    ) => {
      if (requestContext.abortController) {
        requestContext.abortController.abort();
      }
      requestContext.abortController = new AbortController();
      return originalFetcher<T>(
        [requestData[0], { ...requestData[1], signal: requestContext.abortController.signal }],
        info
      ).catch(err => {
        if (info.value && err.name === "AbortError") {
          return Promise.resolve(info.value);
        }
        throw err;
      });
    };
    requestContext.wrapResource();
    if (!requestContext.resource) {
      throw new Error("could not create resource");
    }
    Object.defineProperties(requestContext.resource[0], {
      aborted: {
        get: () => requestContext.abortController?.signal.aborted || false
      },
      status: {
        get: () => requestContext.response?.status
      },
      response: {
        get: () => requestContext.response
      }
    });
    Object.assign(requestContext.resource[1], {
      abort: () => requestContext.abortController?.abort()
    });
  };

export const withTimeout: RequestModifier =
  <T>(timeout: number) =>
  requestContext => {
    const originalFetcher = requestContext.fetcher;
    if (!originalFetcher) {
      return Promise.reject(new Error("could not create resource fetcher"));
    }
    requestContext.fetcher = (requestData, info) =>
      new Promise((resolve, reject) => {
        window.setTimeout(() => {
          requestContext.abortController?.abort("timeout");
          reject(new Error("timeout"));
        }, timeout);
        originalFetcher(requestData, info).then(resolve).catch(reject);
      });
  };

export const withCatchAll: RequestModifier =
  <T>() =>
  requestContext => {
    const originalFetcher = requestContext.fetcher;
    if (!originalFetcher) {
      return Promise.reject(new Error("could not create resource fetcher"));
    }
    const [error, setError] = createSignal<Error | undefined>();
    requestContext.fetcher = (requestData, info) =>
      originalFetcher(requestData, info).catch(err => {
        setError(err);
        return Promise.resolve(info.value!);
      });
    requestContext.wrapResource();
    if (!requestContext.resource) {
      throw new Error("could not create resource");
    }
    Object.defineProperties(requestContext.resource[0], { error: { get: () => error() } });
  };

/* TODO
export const withCache: RequestModifier = <T>(options) => (requestContext) => {

}

export const withRetry: RequestModifier = <T>(retries: number) => (requestContext) => {

}
*/
