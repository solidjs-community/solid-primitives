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
  /**
   * Initial value of the `data` signal before any message arrives.
   *
   * When provided, `data()` returns this value immediately (no pending state).
   * When omitted, `data()` throws `NotReadyError` until the first message
   * arrives, integrating with Solid's `<Suspense>` for a loading fallback.
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
   * Reading this inside a component wrapped with `<Suspense>` will show the
   * fallback while the connection is establishing. After the first message the
   * signal updates reactively on every subsequent message.
   *
   * Use `pending()` to check the pending state imperatively, and
   * `onSettled(() => ...)` to react when the first value arrives.
   */
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
  /**
   * `true` until the first message arrives (or after `reconnect()` / URL
   * change until the next message). Use this for imperative pending checks;
   * use `<Suspense>` for declarative loading UI (it catches the `NotReadyError`
   * that `data()` throws while pending).
   */
  pending: Accessor<boolean>;
  /** Close the connection. Resets `data` to pending on the next `reconnect()`. */
  close: VoidFunction;
  /**
   * Force-close the current connection and open a new one.
   * Resets `data` to pending until the next message arrives.
   */
  reconnect: VoidFunction;
};

// Internal sentinel marking "no message received yet". When rawData holds this
// value, the data accessor throws NotReadyError so Solid's Suspense boundary
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
 * Solid async reactivity system and owner lifecycle.
 *
 * - `data` is **pending** (throws `NotReadyError`) until the first message
 *   arrives, enabling `<Suspense>` to show a loading fallback. Provide
 *   `initialValue` to start with a settled value instead.
 * - Accepts a reactive URL — reconnects automatically when the URL signal
 *   changes, resetting `data` to pending.
 * - Closes the connection on owner disposal via `onCleanup`.
 * - SSR-safe: returns static stubs on the server.
 *
 * ```ts
 * const { data, readyState, error, close, reconnect } = createSSE<{ msg: string }>(
 *   "https://api.example.com/events",
 *   { transform: JSON.parse, reconnect: { retries: 3, delay: 2000 } },
 * );
 *
 * // In JSX — Suspense shows fallback while connecting:
 * return (
 *   <Suspense fallback={<p>Connecting…</p>}>
 *     <p>{data()?.msg}</p>
 *   </Suspense>
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
  // ── SSR stub ──────────────────────────────────────────────────────────────
  if (isServer) {
    return {
      source: () => undefined,
      data: () => options.initialValue,
      error: () => undefined,
      readyState: () => SSEReadyState.CLOSED,
      pending: () => options.initialValue === undefined,
      close: () => void 0,
      reconnect: () => void 0,
    };
  }

  // ── Reactive state ────────────────────────────────────────────────────────
  const [source, setSource] = createSignal<SSESourceHandle | undefined>(undefined);

  // rawData holds either the latest message value or the NOT_SET sentinel.
  // The cast to `Exclude<T, Function> | typeof NOT_SET` selects overload 2 of
  // createSignal (plain value, not compute function). NOT_SET is a unique symbol
  // so it's never a Function; for initialValue, SSE data types are never functions.
  const [rawData, setRawData] = createSignal<T | NotSet>(
    (options.initialValue !== undefined ? options.initialValue : NOT_SET) as
      | Exclude<T, Function>
      | typeof NOT_SET,
  );

  // A computed signal: throws NotReadyError when rawData is NOT_SET so that
  // <Suspense> shows a fallback while awaiting the first message. After the
  // first message it updates reactively on every subsequent message.
  const [data] = createSignal<T | undefined>(() => {
    const val = rawData();
    if (val === NOT_SET) throw new NotReadyError("SSE awaiting first message");
    return val as T | undefined;
  });

  const [error, setError] = createSignal<Event | undefined>(undefined);
  const [readyState, setReadyState] = createSignal<SSEReadyStateValue>(SSEReadyState.CONNECTING);

  // Explicit pending flag — true until the first message arrives (or after
  // reconnect). The `data` computed throws NotReadyError for <Suspense>, but
  // Solid isPending() can't detect the initial STATUS_UNINITIALIZED
  // state, so we expose this for imperative checks.
  const [pending, setPending] = createSignal(options.initialValue === undefined);

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
      setRawData(() => value);
      setPending(false);
      options.onMessage?.(e);
    };

    const handleError = (e: Event) => {
      const es = e.target as SSESourceHandle;
      setReadyState(es.readyState as SSEReadyStateValue);
      setError(() => e);
      options.onError?.(e);

      // Only app-level reconnect when the browser has given up (CLOSED).
      // When readyState is still CONNECTING the browser is handling retries.
      if (es.readyState === SSEReadyState.CLOSED && retriesLeft > 0) {
        retriesLeft--;
        reconnectTimer = setTimeout(() => _open(resolvedUrl), reconnectConfig.delay ?? 3000);
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
    // Reset to pending so Suspense shows a fallback during reconnect.
    setRawData(NOT_SET);
    setPending(true);
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
          // Reset to pending — new connection, new loading state.
          setRawData(NOT_SET);
          setPending(true);
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

  return { source, data, error, readyState, pending, close, reconnect };
};
