import { createMemo, createResource, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";

const abortError = "AbortError";

type FetchOptions<I> = I extends undefined
  ? {
      initialValue?: I;
      name?: string;
      fetch?: typeof fetch;
      responseHandler?: (response: Response) => any;
    }
  : {
      initialValue: I;
      name?: string;
      fetch?: typeof fetch;
      responseHandler?: (response: Response) => any;
    };

export type FetchReturn<T, I> = [
  {
    (): T | I;
    aborted: boolean;
    error: any;
    loading: boolean;
    status: number | null;
    response: Response | null;
  },
  {
    abort: () => void;
    mutate: (v: T | I) => T | I;
    refetch: () => void;
  }
];

const isOptions = <I>(
  prop:
    | Accessor<RequestInfo>
    | Accessor<RequestInit>
    | RequestInfo
    | RequestInit
    | FetchOptions<I>
    | undefined
): prop is FetchOptions<I> => {
  return typeof prop === "object" && ("name" in prop || "initialValue" in prop || "fetch" in prop);
};

/* we want to be able to overload our functions */
/* eslint no-redeclare:off */
/**
 * Creates an abortable fetch resource.
 *
 * ```typescript
 * createFetch<T>(
 *  requestInfo: RequestInfo,
 *  requestInit?: RequestInit,
 *  options?: { initialValue?: T, name?: string, fetch?: typeof fetch }
 * ): [
 *   Resource<T> & {
 *     aborted: boolean,
 *     status: number | null,
 *     response: Response | null
 *   },
 *   { abort: () => void, mutate: (v: T) => T, refetch: () => void }
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
 * const [json, { abort }] = createFetch({ url: 'https://my-url/', method: 'POST', body });
 * ```
 */
export function createFetch<T, I = undefined>(
  requestInfo: Accessor<RequestInfo> | RequestInfo
): FetchReturn<T, I>;
export function createFetch<T, I = undefined>(
  requestInfo: Accessor<RequestInfo> | RequestInfo,
  requestInit: Accessor<RequestInit> | RequestInit
): FetchReturn<T, I>;
export function createFetch<T, I = undefined>(
  requestInfo: Accessor<RequestInfo> | RequestInfo,
  options: FetchOptions<I>
): FetchReturn<T, I>;
export function createFetch<T, I>(
  requestInfo: Accessor<RequestInfo> | RequestInfo,
  options: FetchOptions<I>
): FetchReturn<T, I>;
export function createFetch<T, I>(
  requestInfo: Accessor<RequestInfo> | RequestInfo,
  requestInit: Accessor<RequestInit> | RequestInit,
  options: FetchOptions<I>
): FetchReturn<T, I>;
export function createFetch<T, I>(
  requestInfo: Accessor<RequestInfo> | RequestInfo,
  requestInit?: Accessor<RequestInit> | RequestInit | FetchOptions<I>,
  options?: FetchOptions<I>
): FetchReturn<T, I> {
  let abort: AbortController;
  let resourceReturn: FetchReturn<T, I>;

  if (isOptions(requestInit)) {
    options = requestInit;
    requestInit = undefined;
  }

  const fetcher = (
    [requestInfo, requestInit]: [requestInfo: RequestInfo, requestInit?: RequestInit],
    getPrev: () => T | I
  ): Promise<T | I> => {
    if (!abort || (!abort.signal.aborted && resourceReturn?.[0].loading)) {
      abort?.abort();
      abort = new AbortController();
    }
    Promise.resolve().then(() => {
      resourceReturn[0].aborted = false;
    });
    return (options?.fetch ?? fetch)(requestInfo, requestInit)
      .then((response: Response) => {
        resourceReturn[0].status = response.status;
        resourceReturn[0].response = response;
        if (typeof options?.responseHandler === "function") {
          return options.responseHandler(response) as T | Promise<T>;
        }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          return response.json();
        } else if (contentType.includes("text/")) {
          return response.text();
        } else {
          return response.blob();
        }
      })
      .catch(err => {
        if (err?.name === abortError) {
          resourceReturn[0].aborted = true;
          return Promise.resolve(getPrev());
        }
        throw err;
      });
  };
  resourceReturn = createResource<T | I, [RequestInfo, RequestInit | undefined]>(
    createMemo<[RequestInfo, RequestInit | undefined]>(() => [
      typeof requestInfo === "function" ? requestInfo() : requestInfo,
      typeof requestInit === "function" ? requestInit() : (requestInit as RequestInit | undefined)
    ]),
    fetcher,
    options as any
  ) as unknown as FetchReturn<T, I>;
  Object.assign(resourceReturn[0], {
    status: null,
    response: null
  });
  Object.defineProperty(resourceReturn[1], "abort", {
    get: () => () => {
      resourceReturn[0].aborted = true;
      abort?.abort();
    }
  });

  onCleanup(() => {
    abort?.abort();
  });

  return resourceReturn;
}
