import {
  Accessor,
  createMemo,
  createResource,
  ResourceFetcherInfo,
  ResourceReturn
} from "solid-js";
import { RequestModifier } from "./modifiers";
import { fetchRequest } from "./request";

export type RequestContext<T> = {
  urlAccessor: Accessor<[info: RequestInfo, init?: RequestInit] | undefined>;
  wrapResource: () => ResourceReturn<T>;
  fetcher?: <T>(
    requestData: [info: RequestInfo, init?: RequestInit],
    info: ResourceFetcherInfo<T>
  ) => Promise<T>;
  response?: Response;
  resource?: ResourceReturn<T>;
  abortController?: AbortController;
  responseHandler?: (response: Response) => T;
  [key: string]: any;
};

export type FetchOptions<I> = I extends undefined
  ? {
      initialValue?: I;
      name?: string;
      fetch?: typeof fetch;
      request: <T>(requestContext: RequestContext<T>) => void;
      responseHandler?: (response: Response) => any;
      disable?: boolean;
    }
  : {
      initialValue: I;
      name?: string;
      fetch?: typeof fetch;
      request: <T>(requestContext: RequestContext<T>) => void;
      responseHandler?: (response: Response) => any;
      disable?: boolean;
    };

export type FetchReturn<T, I> = [
  {
    (): T | I;
    /** if you are using withAbort(), this will contain a boolean to check if the request was aborted */
    aborted?: boolean;
    error: any;
    loading: boolean;
    status: number | null;
    response: Response | null;
    [key: string]: any;
  },
  {
    /** if you are using withAbort(), this callback will allow you to abort the request */
    abort?: () => void;
    mutate: (v: T | I) => T | I;
    refetch: () => void;
  }
];

const isOptions = <I>(prop: any): prop is FetchOptions<I> =>
  typeof prop === "object" && ["name", "initialValue", "fetch", "request"].some((key) => key in prop);

/* we want to be able to overload our functions */
/* eslint no-redeclare:off */
/**
 * Creates a fetch resource with lightweight modifications
 *
 * ```typescript
 * createFetch<T>(
 *  requestInfo: RequestInfo,
 *  requestInit?: RequestInit,
 *  options?: {
 *    initialValue?: T,
 *    name?: string,
 *    fetch?: typeof fetch,
 *    // disable fetching, e.g. in SSR situations (use `isServer`)
 *    disabled?: boolean
 *  },
 *  modifiers: (withAbort() | withCache() | ...)[]
 * ): [
 *   Resource<T> & {
 *     status: number | null,
 *     response: Response | null
 *   } & ModifierResourceModifications,
 *   { mutate: (v: T) => T, refetch: () => void } &
 *   ModifierActionModifications
 * ]
 * ```
 *
 * * You can leave out `requestInit` and take the options as second argument
 * * Responses with content-type `application/json` will be handled as JSON
 * * Responses with content-type `text/*` will be handled as text
 * * Everything else will be handled as Blob(); use the Resource.response property for other use cases
 *
 * ## Examples:
 * ```typescript
 * const [value] = createFetch('https://my-url/');
 * const [json, { abort }] = createFetch({ url: 'https://my-url/', method: 'POST', body }, [withAbort()]);
 *
 * ## Available Modifiers:
 * * withAbort() - makes request abortable
 * * withTimeout(ms) - adds a request timeout (works with abort)
 * // TODO:
 * * withRetry(num) - retries request *num* times
 * * withCache(options) - caches requests
 * * withCatchAll() - catches all errors so you don't need a boundary
 *
 * You can even add your own modifiers.
 * ```
 */
export function createFetch<T, I = undefined>(
  requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
  modifiers?: RequestModifier[]
): FetchReturn<T, I>;
export function createFetch<T, I = undefined>(
  requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
  requestInit: Accessor<RequestInit | undefined> | RequestInit,
  modifiers?: RequestModifier[]
): FetchReturn<T, I>;
export function createFetch<T, I = undefined>(
  requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
  options: FetchOptions<I>,
  modifiers?: RequestModifier[]
): FetchReturn<T, I>;
export function createFetch<T, I>(
  requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
  options: FetchOptions<I>,
  modifiers?: RequestModifier[]
): FetchReturn<T, I>;
export function createFetch<T, I>(
  requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
  requestInit: Accessor<RequestInit | undefined> | RequestInit,
  options: FetchOptions<I>,
  modifiers?: RequestModifier[]
): FetchReturn<T, I>;
export function createFetch<T, I>(
  ...args:
    | [
        requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
        requestInit?: Accessor<RequestInit | undefined> | RequestInit | FetchOptions<I>,
        options?: FetchOptions<I>,
        modifiers?: RequestModifier[]
      ]
    | [
        requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
        requestInit?: Accessor<RequestInit | undefined> | RequestInit | FetchOptions<I>,
        modifiers?: RequestModifier[]
      ]
    | [
        requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
        options?: FetchOptions<I>,
        modifiers?: RequestModifier[]
      ]
    | [requestInfo: Accessor<RequestInfo | undefined> | RequestInfo, modifiers?: RequestModifier[]]
): FetchReturn<T, I> {
  const options: FetchOptions<T> = ([args[2], args[1]].find(isOptions) || {}) as FetchOptions<T>;
  const urlAccessor: Accessor<[info: RequestInfo, init?: RequestInit] | undefined> = createMemo(
    () => {
      if (options.disable) {
        return undefined;
      }
      const info: RequestInfo | undefined = typeof args[0] === "function" ? args[0]() : args[0];
      if (!info) {
        return undefined;
      }
      const init =
        typeof args[1] === "function"
          ? args[1]()
          : isOptions(args[1])
          ? undefined
          : (args[1] as RequestInit);
      return [info, init] as [info: RequestInfo, init?: RequestInit];
    }
  );
  const modifiers = args.slice(1).find(Array.isArray) || [];
  modifiers.unshift(options.request || fetchRequest(options.fetch));
  let index = 0;
  const fetchContext: RequestContext<T> = {
    urlAccessor,
    responseHandler: options.responseHandler,
    wrapResource: () => {
      const modifier = modifiers[index++];
      typeof modifier === "function" && modifier(fetchContext);
      if (!fetchContext.resource) {
        fetchContext.resource = createResource(
          fetchContext.urlAccessor,
          fetchContext.fetcher!,
          options as any
        ) as ResourceReturn<T>;
      }
      return fetchContext.resource!;
    }
  };
  fetchContext.wrapResource();
  return fetchContext.resource as unknown as FetchReturn<T, I>;
}
