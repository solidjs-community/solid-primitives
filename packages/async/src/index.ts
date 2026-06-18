import { onCleanup, createMemo } from "solid-js";
import type { Accessor } from "solid-js";
import type { ReadableStream as NodeReadableStream } from "stream/web"

const chained = new Map<() => AbortSignal, (() => void)[]>();

/**
 * **aggregates web stream chunks into a memo**
 * ```ts
 * // from Response:
 * const streamed = createMemo(fromStream(() => fetch(url())));
 *
 * // from another ReadableStream:
 * const streamed = createMemo(fromStream(() => getStream()));
 * ```
 */
export function fromStream<Args extends [] | [any, ...any[]]>(fetcher: (...args: Args) => Promise<Response | ReadableStream | NodeReadableStream> | Response | ReadableStream | NodeReadableStream) {
  return async function*(...args: Args) {
    let parts = '', decoder;
    const source = await fetcher(...args);
    const stream = source instanceof Response ? source.body : source;
    const reader = stream?.getReader();
    if (!reader) {
      console.warn('No ReadableStream found!')
      return;
    }
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      if (value) {
        if (typeof value !== 'string') {
          parts += (decoder ??= new TextDecoder()).decode(value, { stream: true });
        } else {
          parts += value;
        }
      }
      yield parts;
    }
  }
}

const endMatcher = /(?:\W)(t|tru?|f|fa|fals?|n|nul?)$/;
const endLiterals: Record<string, string> = {
  t: "rue", tr: "ue", tru: "e", 
  f: "alse", fa: "lse", fal: "se", fals: "e",
  n: "ull", nu: "ll", nul: "l"
};

const closeJSONPart = (json: string) =>
  json.replace(/[,:]\s*$/, "") + 
    (endMatcher.test(json) && endLiterals[RegExp.$1] || "") +
    [...json].reduce((stack: string[], char: string) => {
      const close = ({ '"': '"', "[": "]", "{": "}" })[char];
      if (char === stack[0]) stack.shift();
      else if (close) stack.unshift(close);
      return stack;
    }, []).join("");

/**
 * **aggregates web stream chunks into a memo supporting partial JSON**
 * ```ts
 * // from Response:
 * const streamed = createMemo(fromStream(() => fetch(url())));
 *
 * // from another ReadableStream:
 * const streamed = createMemo(fromStream(() => getStream()));
 * ```
 */
export function fromJSONStream<Args extends [] | [any, ...any[]]>(fetcher: (...args: Args) => Promise<Response | ReadableStream | NodeReadableStream> | Response | ReadableStream | NodeReadableStream) {
  const wrappedFetcher = fromStream(fetcher);
  return async function*(...args: Args) {
    for await (const data of wrappedFetcher(...args)) {
      try {
        const parsed = JSON.parse(closeJSONPart(data));
        yield parsed;
      } catch (e) { /* ignore erroneous states, recover later */ }
    }
  }
}

export type AbortableReturn = [
  signal: () => AbortSignal,
  abort: (reason?: string) => void,
  filterAbortError: (err: any) => void,
]

export type AbortableOptions = {
  /** Should abort when a new signal is requested, default is true */
  autoAbort?: boolean;
  /** Automatically abort after a timeout in ms if set */
  timeout?: number;
  /** Aborts if a parent signal is aborted (e.g. first optimistic update after a second write) */
  chainTo?: () => AbortSignal;
};

/**
 * **Creates and handles an AbortSignal**
 * ```ts
 * const [signal, abort, filterAbortError] =
 *   makeAbortable({ timeout: 10000 });
 * const fetcher = (url) => fetch(url, { signal: signal() })
 *   .catch(filterAbortError); // filters abort errors
 * ```
 * Returns an accessor for the signal and the abort callback.
 *
 * Options are optional and include:
 * - `timeout`: time in Milliseconds after which the fetcher aborts automatically
 * - `autoAbort`: can be set to true to make a new source not automatically abort a previous request
 * - `chainTo`: listen to another abort signal to abort this signal
 */
export function makeAbortable(
  options: AbortableOptions = {},
): AbortableReturn {
  let controller: AbortController;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const abort = (reason?: string) => {
    timeout && clearTimeout(timeout);
    controller?.abort(reason);
  };
  if (options.chainTo) {
    chained.set(options.chainTo, [...(chained.get(options.chainTo) || []), () => abort("chain abort")]);
  }
  function signal() {
    if (options.autoAbort !== false && controller?.signal.aborted === false)
      abort("retry");
    controller = new AbortController();
    if (options.timeout) {
      timeout = setTimeout(() => abort("timeout"), options.timeout);
    }
    controller.signal.addEventListener('abort', () => chained.get(signal)?.forEach(a => a()));
    return controller.signal;
  };
  return [
    signal,
    abort,
    err => {
      if (err.name === "AbortError") {
        return undefined;
      }
      throw err;
    },
  ];
}

/**
 * **Creates and handles an AbortSignal with automated cleanup**
 * ```ts
 * const [signal, abort, filterAbortError] =
 *   createAbortable();
 * const fetcher = (url) => fetch(url, { signal: signal() })
 *   .catch(filterAbortError); // filters abort errors
 * ```
 * Returns an accessor for the signal and the abort callback.
 *
 * Options are optional and include:
 * - `timeout`: time in Milliseconds after which the fetcher aborts automatically
 * - `noAutoAbort`: can be set to true to make a new source not automatically abort a previous request
 * - `chainTo`: listen to another abort signal to abort this signal
 */
export function createAbortable(
  options?: AbortableOptions,
): [() => AbortSignal, () => void, (err: any) => void] {
  const [signal, abort, filterAbortError] = makeAbortable(options);
  onCleanup(abort);
  return [signal, abort, filterAbortError];
}

const isPromiseLike = (obj: unknown): obj is PromiseLike<unknown> => !!obj &&
  ['object', 'function'].includes(typeof obj) && typeof (obj as PromiseLike<unknown>).then === 'function';

const isIterable = (obj: unknown): obj is Iterable<unknown> => !!obj && Object.hasOwn(obj, Symbol.iterator);
  
const isAsyncIterable = (obj: unknown): obj is AsyncIterable<unknown> => !!obj && Object.hasOwn(obj, Symbol.asyncIterator);
  
export type RetryOptions = {
  delay?: number;
  retries?: number;
};

/**
 * **Creates a fetcher that retries multiple times in case of errors**
 * ```ts
 * const data = createMemo(makeRetrying(() => fetch(url()), { retries: 5 }));
 * ```
 * Receives the fetcher and an optional options object and returns a wrapped fetcher that retries on error after a delay multiple times.
 *
 * The optional options object contains the following optional properties:
 * - `delay` - number of Milliseconds to wait before retrying; default is 5s
 * - `retries` - number of times a request should be repeated before giving up throwing the last error; default is 3 times
 */
export function makeRetrying<T>(
  fetcher: (v?: T) => PromiseLike<T> | AsyncIterable<T> | T,
  options: RetryOptions = {},
): () => AsyncGenerator<T, void> {
  const delay = options.delay ?? 5000;
  let retries = options.retries || 3;
  
  return async function* retrying(v?: T): AsyncGenerator<T> {
    let result: T | PromiseLike<T> | AsyncIterable<T> | undefined;
    while (true) {
      try {
        result = fetcher(v);
        if (isPromiseLike(result)) { 
          yield await result;
          return;
        } else if (isIterable(result)) {
          for (const item of result) 
            if (isPromiseLike(item)) yield item as PromiseLike<T>;
            else yield Promise.resolve(item) as Promise<T>;
          return;
        } else if (isAsyncIterable(result)) {
          for await (const item of result) yield Promise.resolve(item) as PromiseLike<T>;
          return;
        } else {
          yield Promise.resolve(result) as PromiseLike<T>;
          return;
        }
      } catch(error) {
        if (retries-- <= 0) {
          retries = options.retries || 3;
          throw new Error(`retry failed ${options.retries || 3} times`);
        }
        if (delay) await new Promise<void>(resolve => setTimeout(resolve, delay));
      }
    }
  };}


function toArray(item: any) {
  return Array.isArray(item) ? item : item ? [item] : [];
}

/**
 * **Automatically aggregates resource changes**
 * ```ts
 * const pages = createAggregated(currentPage, [], { id: "infinite-scroll" });
 * ```
 * @param res {Accessor<R>} - The accessor that should be aggregated
 * @param initialValue {I | undefined} - an optional initial value
 * @param memoOptions - optional options for `createMemo`
 *
 * Depending on the content of the initialValue or the first response, this will aggregate the incoming responses:
 * - null will not overwrite undefined
 * - if the previous value is an Array, incoming values will be appended
 * - if any of the values are Objects, the current one will be shallow-merged into the previous one
 * - if the previous value is a string, more string data will be appended
 * - otherwise the incoming data will be put into an array
 *
 * Objects and Arrays are re-created on each operation, but the values will be left untouched, so `<For>` should work fine.
 */
export function createAggregated<R, I extends R | R[]>(res: Accessor<R>, initialValue?: I, memoOptions?: Parameters<typeof createMemo<{} | R | I | R[] | I[] | undefined>>[1]) {
  return createMemo<I | R | {} | R[] | I[] | undefined>((previous = initialValue) => {
    const current = res();
    return current == null && previous == null
      ? previous
      : Array.isArray(previous || current)
        ? [...toArray(previous), ...toArray(current)]
        : typeof (previous || current) === "object"
          ? { ...previous, ...current }
          : typeof previous === "string" || typeof current === "string"
            ? (previous?.toString() || "") + (current || "")
            : previous
              ? [previous, current]
              : [current];
  }, memoOptions);
}
