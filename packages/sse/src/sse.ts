import { type Accessor, createComputed, createSignal, onCleanup, untrack } from "solid-js";
import { isServer } from "solid-js/web";
import { access, type MaybeAccessor } from "@solid-primitives/utils";

// ─── ReadyState ───────────────────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────────

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
  /** Called on error */
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
  /** Initial value of the `data` signal before any message arrives */
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
   * The `retries` budget is shared across both browser-level retries
   * (readyState stays CONNECTING) and app-level reconnects (readyState →
   * CLOSED). Once the budget is exhausted the connection is fully torn down,
   * stopping any further browser-driven retry loops.
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
  /** The latest message data, parsed through `transform` if provided. */
  data: Accessor<T | undefined>;
  /** The latest error event, `undefined` when no error has occurred. */
  error: Accessor<Event | undefined>;
  /**
   * The current connection state. Use `SSEReadyState` for named comparisons:
   * - `SSEReadyState.CONNECTING` (0)
   * - `SSEReadyState.OPEN` (1)
   * - `SSEReadyState.CLOSED` (2)
   */
  readyState: Accessor<SSEReadyStateValue>;
  /** Close the connection. */
  close: VoidFunction;
  /** Force-close the current connection and open a new one. */
  reconnect: VoidFunction;
};

// ─── makeSSE ─────────────────────────────────────────────────────────────────

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

// ─── createSSE ───────────────────────────────────────────────────────────────

/**
 * Creates a reactive SSE (Server-Sent Events) connection that integrates with
 * the Solid reactive system and owner lifecycle.
 *
 * - Accepts a reactive URL — reconnects automatically when the URL signal changes
 * - Closes the connection on owner disposal via `onCleanup`
 * - SSR-safe: returns static stubs on the server
 *
 * ```ts
 * const { data, readyState, error, close, reconnect } = createSSE<{ msg: string }>(
 *   "https://api.example.com/events",
 *   { transform: JSON.parse, reconnect: { retries: 3, delay: 2000 } },
 * );
 *
 * return <p>{data()?.msg}</p>;
 * ```
 *
 * @param url Static URL string or reactive `Accessor<string>`
 * @param options Configuration including handlers, transform, and reconnect policy
 */
export const createSSE = <T = string>(
  url: MaybeAccessor<string>,
  options: CreateSSEOptions<T> = {},
): SSEReturn<T> => {
  // ── SSR stub ──────────────────────────────────────────────────────────────
  if (isServer) {
    return {
      source: () => undefined,
      data: () => options.initialValue,
      error: () => undefined,
      readyState: () => SSEReadyState.CLOSED,
      close: () => void 0,
      reconnect: () => void 0,
    };
  }

  // ── Reactive state ────────────────────────────────────────────────────────
  const [source, setSource] = createSignal<SSESourceHandle | undefined>(undefined);
  const [data, setData] = createSignal<T | undefined>(options.initialValue);
  const [error, setError] = createSignal<Event | undefined>(undefined);
  const [readyState, setReadyState] = createSignal<SSEReadyStateValue>(SSEReadyState.CONNECTING);

  // ── Reconnect config ──────────────────────────────────────────────────────
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

  // ── Connection management ─────────────────────────────────────────────────
  let currentCleanup: VoidFunction | undefined;

  /** Tears down the current source without scheduling a reconnect. */
  const teardown = () => {
    currentCleanup?.();
    currentCleanup = undefined;
    setSource(undefined);
  };

  /** Open a fresh connection, resetting the retry counter. */
  const connect = (resolvedUrl: string) => {
    retriesLeft = reconnectConfig.retries ?? 0;
    _open(resolvedUrl);
  };

  /** Internal: open connection, decrement retries on terminal errors. */
  const _open = (resolvedUrl: string) => {
    clearReconnectTimer();

    const handleOpen = (e: Event) => {
      setReadyState(SSEReadyState.OPEN);
      setError(undefined);
      options.onOpen?.(e);
    };

    const handleMessage = (e: MessageEvent) => {
      const value = options.transform ? options.transform(e.data as string) : (e.data as T);
      setData(() => value);
      options.onMessage?.(e);
    };

    const handleError = (e: Event) => {
      const es = e.target as SSESourceHandle;
      setReadyState(es.readyState as SSEReadyStateValue);
      setError(() => e);
      options.onError?.(e);

      // When the browser has given up (CLOSED), perform app-level reconnects
      // against the configured budget.
      // When the browser is still retrying (CONNECTING) and a reconnect budget
      // is configured, count those attempts too so the config is always honoured
      // and the browser can never loop infinitely beyond the configured limit.
      if (es.readyState === SSEReadyState.CLOSED && retriesLeft > 0) {
        retriesLeft--;
        reconnectTimer = setTimeout(() => _open(resolvedUrl), reconnectConfig.delay ?? 3000);
      } else if (es.readyState === SSEReadyState.CLOSED) {
        // Retries exhausted — clean up fully to avoid memory/listener leaks.
        teardown();
      } else if (es.readyState === SSEReadyState.CONNECTING && options.reconnect) {
        // Browser is retrying. Consume the budget; when it's gone, abort so
        // we don't loop forever against the user's configured retry limit.
        if (retriesLeft > 0) {
          retriesLeft--;
        } else {
          teardown();
          setReadyState(SSEReadyState.CLOSED);
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

  const disconnect = () => {
    clearReconnectTimer();
    retriesLeft = 0;
    teardown();
    setReadyState(SSEReadyState.CLOSED);
  };

  const manualReconnect = () => {
    const currentUrl = untrack(() => access(url));
    disconnect();
    connect(currentUrl);
  };

  // ── Initial connection (synchronous) ─────────────────────────────────────
  // createEffect is deferred until after the current synchronous code block,
  // so we connect immediately here to ensure signals are populated as soon as
  // createSSE returns.
  connect(untrack(() => access(url)));

  // ── Reactive URL handling ─────────────────────────────────────────────────
  // Only needed when url is an accessor. `createComputed` runs synchronously
  // on creation (unlike `createEffect`, which is deferred), so the reactive
  // subscription to `url` is established immediately. The `prevUrl` guard
  // prevents a redundant reconnect on the first pass (we already connected).
  if (typeof url === "function") {
    let prevUrl = untrack(url);
    createComputed(() => {
      const resolvedUrl = url();
      if (resolvedUrl !== prevUrl) {
        prevUrl = resolvedUrl;
        untrack(() => teardown());
        connect(resolvedUrl);
      }
    });
  }

  // ── Lifecycle cleanup ─────────────────────────────────────────────────────
  onCleanup(() => {
    clearReconnectTimer();
    teardown();
  });

  return { source, data, error, readyState, close: disconnect, reconnect: manualReconnect };
};
