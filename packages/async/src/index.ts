import {
  onCleanup,
} from "solid-js";

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
export function fromStream<Args extends [] | [any, ...any[]]>(fetcher: (...args: Args) => Promise<Response | ReadableStream> | Response | ReadableStream) {
  return async function*(...args: Args) {
    let parts = '';
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
        parts += typeof value === 'string' ? value : String.fromCharCode(value);
      }
      yield parts;
    }
  }
}

export type AbortableReturn = [
  signal: () => AbortSignal,
  abort: (reason?: string) => void,
  filterAbortError: (err: any) => void,
]

export type AbortableOptions = {
  noAutoAbort?: boolean;
  timeout?: number;
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
 * - `noAutoAbort`: can be set to true to make a new source not automatically abort a previous request
 * - `chainTo`: listen to another abort signal to abort this signal
 */
export function makeAbortable(
  options: AbortableOptions = {},
): AbortableReturn {
  let controller: AbortController;
  let timeout: NodeJS.Timeout | number | undefined;
  const abort = (reason?: string) => {
    timeout && clearTimeout(timeout);
    controller?.abort(reason);
  };
  if (options.chainTo) {
    chained.set(options.chainTo, [...(chained.get(options.chainTo) || []), () => abort("chain abort")]);
  }
  function signal() {
    if (!options.noAutoAbort && controller?.signal.aborted === false) {
      abort("retry");
    }
    controller = new AbortController();
    if (!controller) { throw new Error('AbortController is not supported!'); }
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