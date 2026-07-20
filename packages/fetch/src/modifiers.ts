import { createSignal, getOwner, onCleanup, type ResourceFetcherInfo } from "solid-js";
import { isServer } from "solid-js/web";
import { type RequestContext } from "./fetch.ts";

export type RequestModifier = <Result, FetcherArgs extends any[]>(
  ...args: any[]
) => (requestContext: RequestContext<Result, FetcherArgs>) => void;

export type Fetcher<Result, FetcherArgs> = Exclude<
  RequestContext<Result, FetcherArgs>["fetcher"],
  undefined
>;

/**
 * Replaces `requestContext.fetcher` with the result of `wrapper(originalFetcher)`.
 * Used by modifiers to layer behavior (aborting, retrying, caching, ...) around
 * whatever fetcher is currently installed on the context.
 *
 * @param requestContext The context passed to a `RequestModifier`.
 * @param wrapper Receives the current fetcher and returns the replacement.
 */
export const wrapFetcher = <Result, FetcherArgs extends any[]>(
  requestContext: RequestContext<Result, FetcherArgs>,
  wrapper: (originalFetcher: Fetcher<Result, FetcherArgs>) => Fetcher<Result, FetcherArgs>,
): void => {
  const originalFetcher = requestContext.fetcher;
  if (!originalFetcher) {
    throw new Error("could not read resource fetcher");
  }
  // oxlint-disable-next-line @typescript-eslint/no-unnecessary-condition
  requestContext.fetcher = wrapper(originalFetcher) || originalFetcher;
};

/**
 * Extends the already-created resource returned by `requestContext.resource` with
 * extra properties (defined via property descriptors) and/or extra actions,
 * as produced by `wrapper`.
 *
 * @param requestContext The context passed to a `RequestModifier`, after `wrapResource()` has run.
 * @param wrapper Returns `[props, actions]` to merge onto the resource and its actions object.
 */
export const wrapResource = <Result, FetcherArgs>(
  requestContext: RequestContext<Result, FetcherArgs>,
  wrapper: (
    requestContext: RequestContext<Result, FetcherArgs>,
  ) => [props?: { [key: string]: any }, actions?: { [key: string]: any }],
): void => {
  if (!requestContext.resource) {
    throw new Error("could not read resource");
  }
  const [props, actions] = wrapper(requestContext);
  props && Object.defineProperties(requestContext.resource[0], props);
  actions && Object.assign(requestContext.resource[1], actions);
};

/**
 * Makes the request abortable and adds `aborted`, `status`, and `response` to
 * the resource, plus an `abort()` action. Re-fetching automatically aborts the
 * previous in-flight request.
 */
export const withAbort: RequestModifier =
  <Result, FetcherArgs extends any[]>() =>
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
        return originalFetcher(requestData, info).catch(err => {
          if (info.value && err.name === "AbortError") {
            return Promise.resolve(info.value);
          }
          throw err;
        });
      },
    );
    requestContext.wrapResource();
    wrapResource(requestContext, requestContext => [
      {
        aborted: { get: () => requestContext.abortController?.signal.aborted || false },
        status: { get: () => requestContext.response?.status },
        response: { get: () => requestContext.response },
      },
      {
        abort: () => requestContext.abortController?.abort(),
      },
    ]);
  };

/**
 * Rejects the request if it doesn't resolve within `timeout` milliseconds,
 * aborting the underlying request in the process.
 *
 * @param timeout Milliseconds to wait before aborting and rejecting.
 */
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
      }),
  );
  requestContext.wrapResource();
};

/**
 * Catches all fetcher errors and exposes the last one as `error` on the resource,
 * instead of letting it propagate to a Suspense/ErrorBoundary. The resource's
 * value falls back to `info.value` (its previous value) when a request fails.
 */
export const withCatchAll: RequestModifier = () => requestContext => {
  const [error, setError] = createSignal<Error | undefined>();
  wrapFetcher(
    requestContext,
    originalFetcher => (requestData, info) =>
      originalFetcher(requestData, info).catch((err: Error) => {
        setError(err);
        return Promise.resolve(info.value) as any;
      }),
  );
  requestContext.wrapResource();
  const originalResource = requestContext.resource;
  requestContext.resource = [
    Object.defineProperties(() => originalResource?.[0](), {
      ...Object.getOwnPropertyDescriptors(originalResource?.[0]),
      error: { get: () => error() },
    }),
    originalResource?.[1],
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
  <Result, FetcherArgs extends any[]>(
    retries: number,
    wait: number | ((attempt: number) => number) = defaultWait,
    verify = (response?: Response) => response?.ok,
  ) =>
  requestContext => {
    const waitForAttempt = (attempt: number) =>
      new Promise<void>(resolve =>
        setTimeout(resolve, typeof wait === "number" ? wait : wait(attempt)),
      );
    wrapFetcher<Result, FetcherArgs>(
      requestContext as unknown as RequestContext<Result, FetcherArgs>,
      originalFetcher => (requestData: FetcherArgs, info: ResourceFetcherInfo<Result>) => {
        const wrappedFetcher = (attempt: number): Promise<Result> =>
          attempt <= retries
            ? originalFetcher(requestData, info)
                .then(data =>
                  !verify(requestContext.response)
                    ? waitForAttempt(attempt).then(() => wrappedFetcher(attempt + 1))
                    : data,
                )
                .catch(() => waitForAttempt(attempt).then(() => wrappedFetcher(attempt + 1)))
            : originalFetcher(requestData, info);
        return wrappedFetcher(0);
      },
    );
    requestContext.wrapResource();
  };

/** Options for {@link withRefetchEvent}. */
export type RefetchEventOptions<Result, FetcherArgs extends any[]> = {
  /** Window events that trigger a refetch. Defaults to `["visibilitychange"]`. */
  on?: (keyof WindowEventMap)[];
  /** Called with the last request's args, its data, and the triggering event; return false to skip the refetch. */
  filter?: (requestData: FetcherArgs, data: Result | undefined, ev: Event) => boolean;
};

/**
 * Refetches the resource whenever one of `options.on` fires on `window`
 * (default: `visibilitychange`, refetching whenever the tab becomes visible again).
 */
export const withRefetchEvent: RequestModifier = isServer
  ? () => requestContext => {
      requestContext.wrapResource();
    }
  : <Result, FetcherArgs extends any[]>(options: RefetchEventOptions<Result, FetcherArgs> = {}) =>
      (requestContext: RequestContext<Result, FetcherArgs>) => {
        const lastRequestRef: { current: [requestData: FetcherArgs, data?: Result] | undefined } = {
          current: undefined,
        };
        wrapFetcher<Result, FetcherArgs>(requestContext, originalFetcher => (...args) => {
          lastRequestRef.current = [args as any, undefined];
          return originalFetcher(...args).then(data => {
            lastRequestRef.current = [args as any, data];
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

/**
 * Aggregates each new response into the resource's current value instead of
 * replacing it: arrays are concatenated, objects shallow-merged, strings
 * concatenated, and everything else collected into an array. Useful for
 * paginated data sources.
 *
 * @param dataFilter Optional transform applied to each response before it's merged in.
 */
export const withAggregation: RequestModifier =
  <Result, FetcherArgs extends any[]>(dataFilter?: (result: Result) => Result) =>
  (requestContext: RequestContext<Result, FetcherArgs>) => {
    wrapFetcher<Result, FetcherArgs>(
      requestContext,
      originalFetcher =>
        (...args) =>
          originalFetcher(...args).then(data => {
            const next = dataFilter ? dataFilter(data) : data;
            const current = requestContext.resource?.[0]();
            return Array.isArray(current)
              ? Array.isArray(next)
                ? ([...current, ...next] as Result)
                : ([...current, next] as Result)
              : typeof current === "object" && typeof next === "object"
                ? ({ ...current, ...next } as Result)
                : typeof current === "string" && typeof next === "string"
                  ? ((current + next) as Result)
                  : current != null
                    ? ([current, next] as Result)
                    : next;
          }),
    );
    requestContext.wrapResource();
  };
