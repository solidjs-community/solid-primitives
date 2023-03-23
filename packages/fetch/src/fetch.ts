import {
  Accessor,
  createMemo,
  createResource,
  Resource,
  ResourceActions,
  ResourceFetcherInfo,
  ResourceOptions,
  ResourceReturn,
} from "solid-js";
import { RequestModifier } from "./modifiers";
import { fetchRequest, Request } from "./request";

export type FetchArgs = [info: RequestInfo] | [info: RequestInfo, init?: RequestInit];

export type DistributeFetcherArgs<FetcherArgs extends any[], ExtraArgs extends any[]> = [
  FetcherArgs,
  ExtraArgs,
] extends [any, any]
  ?
      | [...FetcherArgs, ...ExtraArgs]
      | [Accessor<FetcherArgs | undefined>, ...ExtraArgs]
      | [...{ [n in keyof FetcherArgs]: Accessor<FetcherArgs[n] | undefined> }, ...ExtraArgs]
  : never;

export type FetchOptions<Result, InitialValue, FetcherArgs> = ResourceOptions<
  Result | InitialValue
> & {
  fetch?: typeof fetch;
  request?: (requestContext: RequestContext<Result, FetcherArgs>) => void;
  responseHandler?: (response: Response) => any;
  disable?: boolean;
};

export type FetchReturn<Result, InitialValue> = [
  Resource<Result> & {
    /** if you are using withAbort(), this will contain a boolean to check if the request was aborted */
    aborted?: boolean;
    status: number | null;
    response: Response | null;
    [key: string]: any;
  },
  ResourceActions<Result, ResourceOptions<Result | InitialValue>> & {
    /** if you are using withAbort(), this callback will allow you to abort the request */
    abort?: () => void;
    /** if you are using withCache(), this callback will invalidate the current resource or the one specified by the fetcher args */
    invalidate?: (...fetchargs: any[]) => void;
  },
];

export type RequestContext<Result, FetcherArgs> = {
  urlAccessor: Accessor<FetcherArgs | undefined>;
  wrapResource: () => ResourceReturn<Result, ResourceOptions<Result>>;
  fetcher?: (requestData: FetcherArgs, info: ResourceFetcherInfo<Result>) => Promise<Result>;
  response?: Response;
  resource?: ResourceReturn<Result, ResourceOptions<Result>>;
  abortController?: AbortController;
  responseHandler?: (response: Response) => Result;
  [key: string]: any;
};

const isOptions = <Result, InitialValue, FetcherArgs>(
  prop: any,
): prop is FetchOptions<Result, InitialValue, FetcherArgs> =>
  typeof prop === "object" && ["name", "initialValue", "fetch", "request"].some(key => key in prop);

const fetcherArgsFromArgs = <FetcherArgs extends any[]>(
  args: [...fetcherArgs: FetcherArgs | [], ...rest: any[]],
): FetcherArgs | undefined => {
  const info: FetcherArgs[0] | undefined =
    typeof args[0] === "function" ? (args[0] as Accessor<FetcherArgs | FetcherArgs[0]>)() : args[0];
  if (!info) {
    return undefined;
  }

  const init =
    typeof args[1] === "function"
      ? (args[1] as Accessor<FetcherArgs[1]>)()
      : isOptions(args[1]) || Array.isArray(args[1])
      ? undefined
      : (args[1] as RequestInit);
  return [info, init] as FetcherArgs;
};

/**
 * Creates a fetch resource with lightweight modifications
 *
 * ```typescript
 * createFetch<Result, InitialValue, FetcherArgs>(
 *  requestInfo: RequestInfo,
 *  requestInit?: RequestInit,
 *  options?: {
 *    initialValue?: T,
 *    name?: string,
 *    fetch?: typeof fetch,
 *    // disable fetching, e.g. in SSR situations (use `isServer`)
 *    disabled?: boolean
 *  },
 *  modifiers?: (withAbort() | withCache() | ...)[]
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
 * ```
 * ## Available Modifiers:
 * * withAbort() - makes request abortable
 * * withAggregation(dataFilter) - automatically aggregates the response data
 * * withTimeout(ms) - adds a request timeout (works with abort)
 * * withRetry(num) - retries request *num* times
 * * withRefetchEvent(events, filter) - automatically fetches again after certain event(s)
 * * withCache(options) - caches requests
 * * withCacheStorage(storage) - saves cache e.g. to localStorage (which is the default if no option is given)
 * * withRefetchOnExpiry(pollDelayMs) - refetches automatically on expiry; if expiry is handled by a function, it needs to be polled.
 * * withCatchAll() - catches all errors so you do not need a boundary
 *
 * You can even add your own modifiers.
 */
export function createFetch<Result>(
  ...fetcherArgs: DistributeFetcherArgs<FetchArgs, []>
): FetchReturn<Result, undefined>;
export function createFetch<Result>(
  ...args: DistributeFetcherArgs<FetchArgs, [modifiers: ReturnType<RequestModifier>[]]>
): FetchReturn<Result, undefined>;
export function createFetch<Result>(
  ...args: DistributeFetcherArgs<FetchArgs, [options: FetchOptions<Result, undefined, FetchArgs>]>
): FetchReturn<Result, undefined>;
export function createFetch<Result>(
  ...args: DistributeFetcherArgs<
    FetchArgs,
    [options: FetchOptions<Result, undefined, FetchArgs>, modifiers: ReturnType<RequestModifier>[]]
  >
): FetchReturn<Result, undefined>;
export function createFetch<Result, InitialValue extends Result | undefined = undefined>(
  ...args: DistributeFetcherArgs<
    FetchArgs,
    [options: FetchOptions<Result, InitialValue, FetchArgs>]
  >
): FetchReturn<Result, InitialValue>;
export function createFetch<Result, InitialValue extends Result | undefined = undefined>(
  ...args: DistributeFetcherArgs<
    FetchArgs,
    [
      options: FetchOptions<Result, InitialValue, FetchArgs>,
      modifiers: ReturnType<RequestModifier>[],
    ]
  >
): FetchReturn<Result, InitialValue>;
export function createFetch<
  Result,
  InitialValue extends Result | undefined = undefined,
  FetcherArgs extends any[] = FetchArgs,
>(
  ...args: DistributeFetcherArgs<
    FetcherArgs,
    [options: FetchOptions<Result, InitialValue, FetcherArgs>]
  >
): FetchReturn<Result, InitialValue>;
export function createFetch<
  Result,
  InitialValue extends Result | undefined = undefined,
  FetcherArgs extends any[] = FetchArgs,
>(
  ...args: DistributeFetcherArgs<
    FetcherArgs,
    [
      options: FetchOptions<Result, InitialValue, FetcherArgs>,
      modifiers: ReturnType<RequestModifier>[],
    ]
  >
): FetchReturn<Result, InitialValue>;
export function createFetch<
  Result,
  InitialValue extends Result | undefined,
  FetcherArgs extends any[],
>(
  ...args:
    | DistributeFetcherArgs<FetchArgs, []>
    | DistributeFetcherArgs<FetchArgs, [options: FetchOptions<Result, InitialValue, FetchArgs>]>
    | DistributeFetcherArgs<FetchArgs, [modifiers: ReturnType<RequestModifier>[]]>
    | DistributeFetcherArgs<
        FetchArgs,
        [
          options: FetchOptions<Result, InitialValue, FetchArgs>,
          modifiers: ReturnType<RequestModifier>[],
        ]
      >
    | DistributeFetcherArgs<FetcherArgs, [options: FetchOptions<Result, InitialValue, FetcherArgs>]>
    | DistributeFetcherArgs<FetcherArgs, [modifiers: ReturnType<RequestModifier>[]]>
    | DistributeFetcherArgs<
        FetcherArgs,
        [
          options: FetchOptions<Result, InitialValue, FetcherArgs>,
          modifiers: ReturnType<RequestModifier>[],
        ]
      >
): FetchReturn<Result, InitialValue> {
  const options = ([args[2], args[1]].find(isOptions) || {}) as FetchOptions<
    Result,
    InitialValue,
    FetcherArgs
  >;
  const urlAccessor: Accessor<FetcherArgs | undefined> = options.disable
    ? () => undefined
    : typeof args[0] === "function" || typeof args[1] === "function"
    ? createMemo(() => fetcherArgsFromArgs(args))
    : (
        fetcherArgs => () =>
          fetcherArgs
      )(fetcherArgsFromArgs(args));
  const modifiers: (Request<FetcherArgs> | RequestModifier)[] = ((): RequestModifier[] => {
    for (let l = args.length - 1; l >= 1; l--) {
      if (Array.isArray(args[l])) {
        return args[l] as RequestModifier[];
      }
    }
    return [];
  })();
  modifiers.unshift((options.request || fetchRequest(options.fetch)) as Request<FetcherArgs>);
  let index = 0;
  const fetchContext: RequestContext<Result, FetcherArgs> = {
    urlAccessor,
    responseHandler: options.responseHandler,
    wrapResource: () => {
      const modifier = modifiers[index++];
      typeof modifier === "function" && (modifier as RequestModifier)(fetchContext);
      if (!fetchContext.resource) {
        fetchContext.resource = createResource(
          fetchContext.urlAccessor,
          fetchContext.fetcher!,
          options as ResourceOptions<Result>,
        ) as ResourceReturn<Result, ResourceOptions<Result>>;
      }
      return fetchContext.resource;
    },
  };
  fetchContext.wrapResource();
  return fetchContext.resource as unknown as FetchReturn<Result, InitialValue>;
}
