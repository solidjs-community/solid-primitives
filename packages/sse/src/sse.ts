import { onCleanup, createSignal, createTrackedEffect, untrack, NotReadyError } from "solid-js";
import type { Accessor } from "solid-js";
import { isServer } from "solid-js/web";
import { access, type MaybeAccessor } from "@solid-primitives/utils";

/**
 * Named constants for the SSE connection state, mirroring the `EventSource`
 * static properties. Use these instead of bare numbers for readability:
 *
 * ```ts
 * if (readyState() === SSEReadyState.OPEN) { ... }
 * ```
 */
export const SSEReadyState = {
  /** Connection is being established. */
  CONNECTING: 0,
  /** Connection is open and receiving events. */
  OPEN: 1,
  /** Connection is closed. */
  CLOSED: 2,
} as const;

/** The numeric type of a valid SSE ready-state value (`0 | 1 | 2`). */
export type SSEReadyStateValue = (typeof SSEReadyState)[keyof typeof SSEReadyState];

/**
 * Options shared between `makeSSE` and `createSSE`.
 */
export type SSEOptions = {
  /** Pass credentials with request (same as EventSourceInit.withCredentials) */
  withCredentials?: boolean;
  /** Called when the connection opens */
  onOpen?: (event: Event) => void;
  /** Called on every unnamed `"message"` event */
  onMessage?: (event: MessageEvent) => void;
  /**
   * Called on error. For non-terminal errors (browser is reconnecting,
   * `readyState` is still `CONNECTING`) this is purely informational.
   * For terminal errors (`readyState` is `CLOSED` with no retries left),
   * the error also propagates through the reactive graph so `<Errored>`
   * can catch it without any extra wiring.
   */
  onError?: (event: Event) => void;
  /** Handlers for custom named SSE event types, e.g. `{ update: handler }` */
  events?: Record<string, (event: MessageEvent) => void>;
};

export type SSEReconnectOptions = {
  /** Maximum number of reconnect attempts. Default: `Infinity` */
  retries?: number;
  /** Delay in milliseconds between reconnect attempts. Default: `3000` */
  delay?: number;
};

/**
 * Minimal interface that both `EventSource` and `WorkerEventSource` satisfy.
 * Used as the type of the `source` signal returned by `createSSE`.
 */
export type SSESourceHandle = EventTarget & {
  readonly readyState: number;
  close(): void;
};

/**
 * Factory function signature for creating an SSE source.
 * The default factory is `makeSSE`; swap it out with `makeSSEWorker(worker)` to
 * run the connection inside a Web Worker.
 */
export type SSESourceFn = (
  url: string,
  options: SSEOptions,
) => [source: SSESourceHandle, cleanup: VoidFunction];

export type CreateSSEOptions<T> = SSEOptions & {
  /**
   * Initial value of the `data` signal before any message arrives.
   *
   * When provided, `data()` returns this value immediately (no pending state).
   * When omitted, `data()` throws `NotReadyError` until the first message
   * arrives, integrating with Solid's `<Loading>` for a loading fallback.
   */
  initialValue?: T;
  /**
   * Transform raw string data from each message event.
   * Use this to parse JSON: `{ transform: JSON.parse }`
   */
  transform?: (raw: string) => T;
  /**
   * App-level reconnect behavior on terminal errors (readyState → CLOSED).
   *
   * - `false` (default): no app-level reconnect
   * - `true`: reconnect with defaults (Infinity retries, 3000ms delay)
   * - object: custom `{ retries?, delay? }`
   *
   * Note: `EventSource` already reconnects natively for transient network
   * drops. This option handles cases where the browser gives up entirely.
   */
  reconnect?: boolean | SSEReconnectOptions;
  /**
   * Custom source factory. Defaults to `makeSSE` (creates a real EventSource).
   * Swap this out to run SSE in a Worker:
   *   `source: makeSSEWorker(worker)`
   */
  source?: SSESourceFn;
};

export type SSEReturn<T> = {
  /** The underlying source instance. `undefined` on SSR or before first connect. */
  source: Accessor<SSESourceHandle | undefined>;
  /**
   * The latest message data, parsed through `transform` if provided.
   *
   * **Pending until the first message arrives** (unless `initialValue` is set).
   * Reading this inside a component wrapped with `<Loading>` will show the
   * fallback while the connection is establishing. After the first message the
   * signal updates reactively on every subsequent message.
   *
   * For stale-while-revalidating UI (after reconnect or URL change), use
   * `isPending(() => data())` — it is `false` during initial load (handled by
   * `<Loading>`) and `true` only once a stale value exists and new data is pending.
   *
   * Terminal errors (connection CLOSED with no retries left) are thrown through
   * `data()` so `<Errored>` can catch them without any extra wiring.
   */
  data: Accessor<T>;
  /**
   * The current connection state. Use `SSEReadyState` for named comparisons:
   * - `SSEReadyState.CONNECTING` (0)
   * - `SSEReadyState.OPEN` (1)
   * - `SSEReadyState.CLOSED` (2)
   */
  readyState: Accessor<SSEReadyStateValue>;
  /** Close the connection. */
  close: VoidFunction;
  /**
   * Force-close the current connection and open a new one.
   * Resets `data` to pending until the next message arrives.
   */
  reconnect: VoidFunction;
};

// Internal sentinel marking "no message received yet". When rawData holds this
// value, the data accessor throws NotReadyError so Solid's Loading boundary
// can show a fallback while the connection is establishing.
const NOT_SET: unique symbol = Symbol();
type NotSet = typeof NOT_SET;

/**
 * Creates a raw `EventSource` connection without Solid lifecycle management.
 * Event handlers are attached immediately; cleanup must be called manually.
 *
 * ```ts
 * const [source, cleanup] = makeSSE("https://api.example.com/events", {
 *   onMessage: (e) => console.log(e.data),
 *   onError: (e) => console.error("error", e),
 * });
 * // Later:
 * cleanup();
 * ```
 *
 * @param url The SSE endpoint URL
 * @param options Event handlers and `EventSource` options
 * @returns Tuple of `[EventSource, cleanup]`
 */
export const makeSSE = (
  url: string | URL,
  options: SSEOptions = {},
): [source: EventSource, cleanup: VoidFunction] => {
  const source = new EventSource(url, { withCredentials: options.withCredentials });

  if (options.onOpen) source.addEventListener("open", options.onOpen);
  if (options.onMessage) source.addEventListener("message", options.onMessage);
  if (options.onError) source.addEventListener("error", options.onError);
  if (options.events) {
    for (const [name, handler] of Object.entries(options.events))
      source.addEventListener(name, handler as EventListener);
  }

  const cleanup = () => {
    source.close();
    if (options.onOpen) source.removeEventListener("open", options.onOpen);
    if (options.onMessage) source.removeEventListener("message", options.onMessage);
    if (options.onError) source.removeEventListener("error", options.onError);
    if (options.events) {
      for (const [name, handler] of Object.entries(options.events))
        source.removeEventListener(name, handler as EventListener);
    }
  };

  return [source, cleanup];
};

/**
 * Creates a reactive SSE (Server-Sent Events) connection that integrates with
 * Solid's async reactivity system and owner lifecycle.
 *
 * - `data` is **pending** (throws `NotReadyError`) until the first message
 *   arrives, enabling `<Loading>` to show a loading fallback. Provide
 *   `initialValue` to start with a settled value instead.
 * - Terminal errors (CLOSED with no retries) are thrown through `data()` so
 *   `<Errored>` can catch them. Non-terminal errors call `onError` only.
 * - Accepts a reactive URL — reconnects automatically when the URL signal
 *   changes, resetting `data` to pending.
 * - Closes the connection on owner disposal via `onCleanup`.
 * - SSR-safe: returns static stubs on the server.
 *
 * ```ts
 * const { data, readyState, close, reconnect } = createSSE<{ msg: string }>(
 *   "https://api.example.com/events",
 *   { transform: JSON.parse, reconnect: { retries: 3, delay: 2000 } },
 * );
 *
 * // In JSX — Loading shows fallback while connecting, Errored catches terminal failures:
 * return (
 *   <Errored fallback={err => <p>Connection failed</p>}>
 *     <Loading fallback={<p>Connecting…</p>}>
 *       <p>{data()?.msg}</p>
 *     </Loading>
 *   </Errored>
 * );
 * ```
 *
 * @param url Static URL string or reactive `Accessor<string>`
 * @param options Configuration including handlers, transform, and reconnect policy
 */
export const createSSE = <T = string>(
  url: MaybeAccessor<string>,
  options: CreateSSEOptions<T> = {},
): SSEReturn<T> => {
  if (isServer) {
    return {
      source: () => undefined,
      data:
        options.initialValue !== undefined
          ? () => options.initialValue!
          : () => {
              throw new NotReadyError("SSE awaiting first message");
            },
      readyState: () => SSEReadyState.CLOSED,
      close: () => void 0,
      reconnect: () => void 0,
    };
  }

  const [source, setSource] = createSignal<SSESourceHandle | undefined>(undefined);

  // rawData holds either the latest message value or the NOT_SET sentinel.
  const [rawData, setRawData] = createSignal<T | NotSet>(
    options.initialValue !== undefined ? options.initialValue : NOT_SET,
  );

  // Terminal error signal: set when the connection closes with no retries left.
  // data() re-throws this so <Errored> can catch it — single error path.
  const [terminalError, setTerminalError] = createSignal<Event | undefined>(undefined);

  // Computed data signal: throws terminal error (→ Errored boundary) or
  // NotReadyError (→ Loading boundary) when not ready.
  const [data] = createSignal<T>(() => {
    const err = terminalError();
    if (err !== undefined) throw err;
    const val = rawData();
    if (val === NOT_SET) throw new NotReadyError("SSE awaiting first message");
    return val;
  });

  const [readyState, setReadyState] = createSignal<SSEReadyStateValue>(SSEReadyState.CONNECTING);

  const reconnectConfig: SSEReconnectOptions =
    options.reconnect === true
      ? { retries: Infinity, delay: 3000 }
      : !options.reconnect
        ? { retries: 0, delay: 0 }
        : options.reconnect;

  let retriesLeft = reconnectConfig.retries ?? 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  const clearReconnectTimer = () => {
    if (reconnectTimer !== undefined) {
      clearTimeout(reconnectTimer);
      reconnectTimer = undefined;
    }
  };

  let currentCleanup: VoidFunction | undefined;

  /** Open a fresh connection, resetting the retry counter and terminal error. */
  const connect = (resolvedUrl: string) => {
    retriesLeft = reconnectConfig.retries ?? 0;
    setTerminalError(undefined);
    _open(resolvedUrl);
  };

  /** Internal: open connection, decrement retries on terminal errors. */
  const _open = (resolvedUrl: string) => {
    clearReconnectTimer();

    const handleOpen = (e: Event) => {
      setReadyState(SSEReadyState.OPEN);
      options.onOpen?.(e);
    };

    const handleMessage = (e: MessageEvent) => {
      const value = options.transform ? options.transform(e.data as string) : (e.data as T);
      setRawData(() => value);
      options.onMessage?.(e);
    };

    const handleError = (e: Event) => {
      const es = e.target as SSESourceHandle;
      setReadyState(es.readyState as SSEReadyStateValue);
      options.onError?.(e);

      if (es.readyState === SSEReadyState.CLOSED) {
        if (retriesLeft > 0) {
          // Browser gave up but we have retries: schedule app-level reconnect.
          retriesLeft--;
          reconnectTimer = setTimeout(() => _open(resolvedUrl), reconnectConfig.delay ?? 3000);
        } else {
          // Terminal: no more retries — propagate through Errored boundary.
          setTerminalError(() => e);
        }
      }
    };

    const sourceFn: SSESourceFn = options.source ?? makeSSE;
    const [es, cleanup] = sourceFn(resolvedUrl, {
      withCredentials: options.withCredentials,
      onOpen: handleOpen,
      onMessage: handleMessage,
      onError: handleError,
      events: options.events,
    });

    setSource(() => es);
    setReadyState(es.readyState as SSEReadyStateValue);
    currentCleanup = cleanup;
  };

  const close = () => {
    clearReconnectTimer();
    retriesLeft = 0;
    currentCleanup?.();
    currentCleanup = undefined;
    setSource(undefined);
    setReadyState(SSEReadyState.CLOSED);
  };

  const reconnect = () => {
    const currentUrl = untrack(() => access(url));
    close();
    setRawData(NOT_SET);
    setTerminalError(undefined);
    connect(currentUrl);
  };

  connect(untrack(() => access(url)));

  // createTrackedEffect runs synchronously so the reactive subscription
  // to `url` is established immediately. The prevUrl guard prevents a
  // redundant reconnect on the first pass.
  if (typeof url === "function") {
    let prevUrl = untrack(url);
    createTrackedEffect(() => {
      const resolvedUrl = url();
      if (resolvedUrl !== prevUrl) {
        prevUrl = resolvedUrl;
        untrack(() => {
          currentCleanup?.();
          currentCleanup = undefined;
          setRawData(NOT_SET);
          setTerminalError(undefined);
          connect(resolvedUrl);
        });
      }
    });
  }

  onCleanup(() => {
    clearReconnectTimer();
    currentCleanup?.();
    currentCleanup = undefined;
  });

  return { source, data, readyState, close, reconnect };
};

/** Options for `makeSSEAsyncIterable` and `createSSEStream`. */
export type CreateSSEStreamOptions<T> = SSEOptions & {
  /** Transform raw string data from each message event. */
  transform?: (raw: string) => T;
  /** Custom source factory (defaults to `makeSSE`). */
  source?: SSESourceFn;
};

/**
 * Wraps an SSE endpoint as an `AsyncIterable<T>`. Each SSE message becomes
 * one yielded value. Terminal errors (connection CLOSED) are thrown by the
 * iterator. Cleanup (closing the `EventSource`) runs automatically when the
 * iterator is abandoned via `return()`.
 *
 * This is the non-reactive foundation primitive. Use `createSSEStream` if you
 * want Solid reactivity, or pass this directly to a `createMemo` that accepts
 * async iterables.
 *
 * ```ts
 * const iterable = makeSSEAsyncIterable<string>("https://api.example.com/events");
 * for await (const msg of iterable) {
 *   console.log(msg);
 * }
 * ```
 *
 * @param url The SSE endpoint URL
 * @param options Event handlers and transform
 */
export const makeSSEAsyncIterable = <T = string>(
  url: string | URL,
  options: CreateSSEStreamOptions<T> = {},
): AsyncIterable<T> => ({
  [Symbol.asyncIterator](): AsyncIterator<T> {
    const queue: T[] = [];
    let notify: (() => void) | undefined;
    let done = false;
    let terminalErr: Event | undefined;

    const sourceFn: SSESourceFn = options.source ?? makeSSE;
    const [, cleanup] = sourceFn(String(url), {
      withCredentials: options.withCredentials,
      onOpen: options.onOpen,
      onError: (e: Event) => {
        const es = e.target as SSESourceHandle;
        if (es.readyState === SSEReadyState.CLOSED) {
          terminalErr = e;
          done = true;
          notify?.();
          notify = undefined;
        }
        options.onError?.(e);
      },
      onMessage: (e: MessageEvent) => {
        const value = options.transform ? options.transform(e.data as string) : (e.data as T);
        queue.push(value);
        notify?.();
        notify = undefined;
      },
      events: options.events,
    });

    return {
      async next(): Promise<IteratorResult<T>> {
        while (!done && queue.length === 0) {
          await new Promise<void>(r => {
            notify = r;
          });
        }
        if (queue.length > 0) return { value: queue.shift()!, done: false };
        if (terminalErr) throw terminalErr;
        return { value: undefined as unknown as T, done: true };
      },
      return(): Promise<IteratorResult<T>> {
        done = true;
        notify?.();
        notify = undefined;
        cleanup();
        return Promise.resolve({ value: undefined as unknown as T, done: true });
      },
      throw(err?: unknown): Promise<IteratorResult<T>> {
        done = true;
        cleanup();
        return Promise.reject(err);
      },
    };
  },
});

/**
 * Creates a reactive SSE stream using Solid's async computation model.
 * Returns a single `Accessor<T>` backed by an `AsyncIterable` of SSE data values.
 *
 * Compared to `createSSE`, this is a minimal API: no `source`, `readyState`,
 * `close`, or `reconnect` — just the data stream. Use it when you only need
 * the values and want the simplest possible integration with `<Loading>`.
 *
 * - Suspends (`<Loading>`) until the first message arrives.
 * - Reactively reconnects when `url` changes (closes old iterator, starts new one).
 * - Terminal errors propagate through the accessor to `<Errored>`.
 * - Owner disposal closes the underlying `EventSource` via `onCleanup`.
 *
 * ```ts
 * const data = createSSEStream<{ msg: string }>(url, { transform: JSON.parse });
 *
 * return (
 *   <Errored fallback={err => <p>Connection failed</p>}>
 *     <Loading fallback={<p>Connecting…</p>}>
 *       <p>{data().msg}</p>
 *     </Loading>
 *   </Errored>
 * );
 * ```
 *
 * @param url Static URL string or reactive `Accessor<string>`
 * @param options Transform and event handler options
 */
export const createSSEStream = <T = string>(
  url: MaybeAccessor<string>,
  options: CreateSSEStreamOptions<T> = {},
): Accessor<T> => {
  if (isServer) {
    return () => {
      throw new NotReadyError("SSE not available on server");
    };
  }

  const [rawData, setRawData] = createSignal<T | NotSet>(NOT_SET);
  const [terminalError, setTerminalError] = createSignal<Event | undefined>(undefined);

  const [data] = createSignal<T>(() => {
    const err = terminalError();
    if (err !== undefined) throw err;
    const val = rawData();
    if (val === NOT_SET) throw new NotReadyError("SSE stream awaiting first message");
    return val;
  });

  let currentReturn: (() => void) | undefined;

  const startStream = (resolvedUrl: string) => {
    const iter = makeSSEAsyncIterable<T>(resolvedUrl, options)[Symbol.asyncIterator]();
    currentReturn = () => {
      iter.return?.();
    };

    const consume = async () => {
      try {
        let result = await iter.next();
        while (!result.done) {
          setRawData(() => result.value);
          result = await iter.next();
        }
      } catch (e) {
        setTerminalError(() => e as Event);
      }
    };
    void consume();
  };

  startStream(untrack(() => access(url)));

  if (typeof url === "function") {
    let prevUrl = untrack(url);
    createTrackedEffect(() => {
      const resolvedUrl = (url as Accessor<string>)();
      if (resolvedUrl !== prevUrl) {
        prevUrl = resolvedUrl;
        untrack(() => {
          currentReturn?.();
          currentReturn = undefined;
          setRawData(NOT_SET);
          setTerminalError(undefined);
          startStream(resolvedUrl);
        });
      }
    });
  }

  onCleanup(() => {
    currentReturn?.();
    currentReturn = undefined;
  });

  return data;
};
