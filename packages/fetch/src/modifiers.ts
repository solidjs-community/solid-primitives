import { createSignal, getOwner, onCleanup, ResourceFetcherInfo } from "solid-js";
import { isServer } from "solid-js/web";
import { RequestContext } from "./fetch";

export type RequestModifier = <Result extends unknown, FetcherArgs extends any[]>(
  ...args: any[]
) => (requestContext: RequestContext<Result, FetcherArgs>) => void;

export type Fetcher<Result, FetcherArgs> = Exclude<
  RequestContext<Result, FetcherArgs>["fetcher"],
  undefined
>;

export const wrapFetcher = <Result extends unknown, FetcherArgs extends any[]>(
  requestContext: RequestContext<Result, FetcherArgs>,
  wrapper: (originalFetcher: Fetcher<Result, FetcherArgs>) => Fetcher<Result, FetcherArgs>
) => {
  const originalFetcher = requestContext.fetcher;
  if (!originalFetcher) {
    throw new Error("could not read resource fetcher");
  }
  requestContext.fetcher = wrapper(originalFetcher) || originalFetcher;
};

export const wrapResource = <Result, FetcherArgs>(
  requestContext: RequestContext<Result, FetcherArgs>,
  wrapper: (
    requestContext: RequestContext<Result, FetcherArgs>
  ) => [props?: { [key: string]: any }, actions?: { [key: string]: any }]
) => {
  if (!requestContext.resource) {
    throw new Error("could not read resource");
  }
  const [props, actions] = wrapper(requestContext);
  props && Object.defineProperties(requestContext.resource[0], props);
  actions && Object.assign(requestContext.resource[1], actions);
};

export const withAbort: RequestModifier =
  <Result extends unknown, FetcherArgs extends any[]>() =>
  (requestContext: RequestContext<Result, FetcherArgs>) => {
    wrapFetcher(
      requestContext,
      originalFetcher => (requestData: FetcherArgs, info: ResourceFetcherInfo<Result>) => {
        if (requestContext.abortController) {
          requestContext.abortController.abort();
        }
        requestContext.abortController = new AbortController();
        const lastRequestDataObj = (() => {
          for (let l = requestData.length - 1; l >= 0; l--) {
            if (typeof requestData[l] === "object") {
              return requestData[l];
            }
          }
          const obj = {};
          requestData.push(obj);
          return obj;
        })();
        lastRequestDataObj.signal = requestContext.abortController.signal;
        return originalFetcher(
          requestData as FetcherArgs,
          info as ResourceFetcherInfo<Result>
        ).catch(err => {
          if (info.value && err.name === "AbortError") {
            return Promise.resolve(info.value);
          }
          throw err;
        });
      }
    );
    requestContext.wrapResource();
    wrapResource(requestContext, requestContext => [
      {
        aborted: { get: () => requestContext.abortController?.signal.aborted || false },
        status: { get: () => requestContext.response?.status },
        response: { get: () => requestContext.response }
      },
      {
        abort: () => requestContext.abortController?.abort()
      }
    ]);
  };

export const withTimeout: RequestModifier = (timeout: number) => requestContext => {
  wrapFetcher(
    requestContext,
    originalFetcher => (requestData, info) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          requestContext.abortController?.abort("timeout");
          reject(new Error("timeout"));
        }, timeout);
        originalFetcher(requestData, info)
          .then(resolve as any)
          .catch(reject);
      })
  );
  requestContext.wrapResource();
};

export const withCatchAll: RequestModifier =
  <T>() =>
  requestContext => {
    const [error, setError] = createSignal<Error | undefined>();
    wrapFetcher(
      requestContext,
      originalFetcher => (requestData, info) =>
        originalFetcher(requestData, info).catch((err: Error) => {
          setError(err);
          return Promise.resolve(info.value!);
        })
    );
    requestContext.wrapResource();
    const originalResource = requestContext.resource;
    requestContext.resource = [
      Object.defineProperties(() => originalResource?.[0](), {
        ...Object.getOwnPropertyDescriptors(originalResource?.[0]),
        error: { get: () => error() }
      }),
      originalResource?.[1]
    ] as typeof originalResource;
  };

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
export const withRetry: RequestModifier =
  <Result extends unknown, FetcherArgs extends any[]>(
    retries: number,
    wait: number | ((attempt: number) => number) = defaultWait,
    verify = (response?: Response) => response?.ok
  ) =>
  requestContext => {
    const waitForAttempt = (attempt: number) =>
      new Promise<void>(resolve =>
        setTimeout(resolve, typeof wait === "number" ? wait : wait(attempt))
      );
    wrapFetcher<Result, FetcherArgs>(
      requestContext as unknown as RequestContext<Result, FetcherArgs>,
      originalFetcher => (requestData: FetcherArgs, info: ResourceFetcherInfo<Result>) => {
        const wrappedFetcher = (attempt: number): Promise<Result> => attempt <= retries
          ? originalFetcher(requestData, info)
              .then(data =>
                !verify(requestContext.response)
                  ? waitForAttempt(attempt).then(() => wrappedFetcher(attempt + 1))
                  : data
              )
              .catch(_err => waitForAttempt(attempt).then(() => wrappedFetcher(attempt + 1)))
          : originalFetcher(requestData, info);
        return wrappedFetcher(0);
      }
    );
    requestContext.wrapResource();
  };

export type RefetchEventOptions<Result extends unknown, FetcherArgs extends any[]> = {
  on?: (keyof WindowEventMap)[];
  filter?: (requestData: FetcherArgs, data: Result | undefined, ev: Event) => boolean;
};

export const withRefetchEvent: RequestModifier = isServer
  ? () => requestContext => {
      requestContext.wrapResource();
    }
  : <Result extends unknown, FetcherArgs extends any[]>(
        options: RefetchEventOptions<Result, FetcherArgs> = {}
      ) =>
      (requestContext: RequestContext<Result, FetcherArgs>) => {
        const lastRequestRef: { current: [requestData: FetcherArgs, data?: Result] | undefined } = {
          current: undefined
        };
        wrapFetcher<Result, FetcherArgs>(requestContext, originalFetcher => (...args) => {
          lastRequestRef.current = [args as any, undefined];
          return originalFetcher(...args).then(data => {
            lastRequestRef.current = [args as any, data as Result];
            return data;
          });
        });
        requestContext.wrapResource();
        const events: string[] = options.on || ["visibilitychange"];
        const filter = options.filter || (() => true);
        const handler = (ev: Event) => {
          if (
            lastRequestRef.current &&
            !(ev.type === "visibilitychange" && document.visibilityState !== "visible") &&
            filter(...lastRequestRef.current, ev)
          ) {
            requestContext.resource?.[1].refetch();
          }
        };
        events.forEach(name => window.addEventListener(name, handler));
        getOwner() &&
          onCleanup(() => events.forEach(name => window.removeEventListener(name, handler)));
      };
