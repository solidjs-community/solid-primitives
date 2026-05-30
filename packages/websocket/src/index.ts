import { type Accessor, onCleanup, createSignal, createMemo, createStore, runWithOwner } from "solid-js";

export type WSMessage = string | ArrayBufferLike | ArrayBufferView | Blob;

/**
 * Opens a web socket connection with a queued send.
 * ```ts
 * const ws = makeWS("ws://localhost:5000");
 * createEffect(serverMessage, (msg) => ws.send(msg));
 * onCleanup(() => ws.close());
 * ```
 * Will not throw if you attempt to send messages before the connection opened; instead, it will enqueue the message to be sent when the connection opens.
 *
 * It will not close the connection on cleanup. To do that, use `createWS`.
 */
export const makeWS = (
  url: string,
  protocols?: string | string[],
  sendQueue: WSMessage[] = [],
): WebSocket => {
  const ws: WebSocket = new WebSocket(url, protocols);
  const _send = ws.send.bind(ws);
  ws.send = (msg: WSMessage) => (ws.readyState == 1 ? _send(msg) : sendQueue.push(msg));
  ws.addEventListener("open", () => {
    while (sendQueue.length) _send(sendQueue.shift()!);
  });
  return ws;
};

/**
 * Opens a web socket connection with a queued send that closes on cleanup.
 * ```ts
 * const ws = createWS("ws://localhost:5000");
 * createEffect(serverMessage, (msg) => ws.send(msg));
 * ```
 * Will not throw if you attempt to send messages before the connection opened; instead, it will enqueue the message to be sent when the connection opens.
 */
export const createWS = (url: string, protocols?: string | string[]): WebSocket => {
  const ws = makeWS(url, protocols);
  onCleanup(() => ws.close());
  return ws;
};

/**
 * Returns a reactive signal for the WebSocket's `readyState`:
 *
 * - `0` — CONNECTING
 * - `1` — OPEN
 * - `2` — CLOSING
 * - `3` — CLOSED
 *
 * ```ts
 * const ws = createWS('ws://localhost:5000');
 * const state = createWSState(ws);
 * const states = ["Connecting", "Open", "Closing", "Closed"] as const;
 * return <div>{states[state()]}</div>
 * ```
 */
export const createWSState = (ws: WebSocket): Accessor<0 | 1 | 2 | 3> => {
  // ownedWrite: true — setState may be called from ws.close(), which the user
  // could invoke inside a component or effect. This suppresses the dev-mode
  // owned-scope write warning for this intentionally internal signal.
  const [state, setState] = createSignal(ws.readyState as 0 | 1 | 2 | 3, { ownedWrite: true });
  const _close = ws.close.bind(ws);
  ws.addEventListener("open", () => setState(1));
  ws.close = (...args) => {
    _close(...args);
    setState(2);
  };
  ws.addEventListener("close", () => setState(3));
  return state;
};

/**
 * Returns a reactive signal containing the latest message received from the WebSocket.
 * Starts as `undefined` until the first message arrives.
 *
 * ```ts
 * const ws = createWS("ws://localhost:5000");
 * const message = createWSMessage<string>(ws);
 * return <p>Last message: {message()}</p>;
 * ```
 *
 * The signal updates on every incoming message. Pair it with `createEffect` to
 * react to each new value:
 * ```ts
 * createEffect(message, (msg) => msg !== undefined && console.log("received:", msg));
 * ```
 */
export const createWSMessage = <T = string>(ws: WebSocket): Accessor<T | undefined> => {
  const [message, setMessage] = createSignal<T | undefined>(undefined, { ownedWrite: true });
  const handler = (e: MessageEvent) => setMessage(() => e.data as T);
  ws.addEventListener("message", handler);
  onCleanup(() => ws.removeEventListener("message", handler));
  return message;
};

export type WSReconnectOptions = {
  delay?: number;
  retries?: number;
};

export type ReconnectingWebSocket = WebSocket & {
  reconnect: () => void;
  /** required for the heartbeat implementation; do not overwrite if you want to use this with heartbeat */
  send: WebSocket["send"] & { before?: () => void };
};

/**
 * Returns a WebSocket-like object that under the hood opens new connections on disconnect:
 * ```ts
 * const ws = makeReconnectingWS("ws:localhost:5000");
 * createEffect(serverMessage, (msg) => ws.send(msg));
 * onCleanup(() => ws.close());
 * ```
 * Will not throw if you attempt to send messages before the connection opened; instead, it will enqueue the message to be sent when the connection opens.
 *
 * It will not close the connection on cleanup. To do that, use `createReconnectingWS`.
 */
export const makeReconnectingWS = (
  url: string,
  protocols?: string | string[],
  options: WSReconnectOptions = {},
) => {
  let retries = options.retries || Infinity;
  let ws: ReconnectingWebSocket;
  const queue: WSMessage[] = [];
  let events: Parameters<WebSocket["addEventListener"]>[] = [
    [
      "close",
      () => {
        retries-- > 0 && setTimeout(getWS, options.delay || 3000);
      },
    ],
  ];
  const getWS = () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ws && ws.readyState < 2) ws.close();
    ws = Object.assign(makeWS(url, protocols, queue), {
      reconnect: getWS,
    });
    events.forEach(args => ws.addEventListener(...args));
  };
  getWS();
  const wws: Partial<ReconnectingWebSocket> = {
    close: (...args: Parameters<WebSocket["close"]>) => {
      retries = 0;
      return ws.close(...args);
    },
    addEventListener: (...args: Parameters<WebSocket["addEventListener"]>) => {
      events.push(args);
      return ws.addEventListener(...args);
    },
    removeEventListener: (...args: Parameters<WebSocket["removeEventListener"]>) => {
      events = events.filter(ev => args[0] !== ev[0] || args[1] !== ev[1]);
      return ws.removeEventListener(...args);
    },
    send: (msg: WSMessage) => {
      wws.send!.before?.();
      return ws.send(msg);
    },
  };
  for (const name in ws!)
    wws[name as keyof typeof wws] == null &&
      Object.defineProperty(wws, name, {
        enumerable: true,
        get: () =>
          typeof ws[name as keyof typeof ws] === "function"
            ? (ws[name as keyof typeof ws] as Function).bind(ws)
            : ws[name as keyof typeof ws],
      });
  return wws as ReconnectingWebSocket;
};

/**
 * Returns a WebSocket-like object that under the hood opens new connections on disconnect and closes on cleanup:
 * ```ts
 * const ws = createReconnectingWS("ws:localhost:5000");
 * createEffect(serverMessage, (msg) => ws.send(msg));
 * ```
 * Will not throw if you attempt to send messages before the connection opened; instead, it will enqueue the message to be sent when the connection opens.
 */
export const createReconnectingWS: typeof makeReconnectingWS = (url, protocols, options) => {
  const ws = makeReconnectingWS(url, protocols, options);
  onCleanup(() => ws.close());
  return ws;
};

export type WSHeartbeatOptions = {
  /**
   * Heartbeat message being sent to the server in order to validate the connection
   * @default "ping"
   */
  message?: WSMessage;
  /**
   * The time between messages being sent in milliseconds
   * @default 1000
   */
  interval?: number;
  /**
   * The time after the heartbeat message being sent to wait for the next message in milliseconds
   * @default 1500
   */
  wait?: number;
};

/**
 * Wraps a reconnecting WebSocket to send a heartbeat to check the connection.
 * ```ts
 * const ws = makeHeartbeatWS(createReconnectingWS('ws://localhost:5000'))
 * ```
 * Dispatches a close event to initiate the reconnection of the defunct web socket.
 */
export const makeHeartbeatWS = (
  ws: ReconnectingWebSocket,
  options: WSHeartbeatOptions = {},
): WebSocket & { reconnect: () => void } => {
  let pingtimer: ReturnType<typeof setTimeout> | undefined;
  let pongtimer: ReturnType<typeof setTimeout> | undefined;
  const clearTimers = () => (clearTimeout(pingtimer), clearTimeout(pongtimer));
  ws.send.before = () => {
    clearTimers();
    pongtimer = setTimeout(ws.reconnect, options.wait || 1500);
  };
  const receiveMessage = () => {
    clearTimers();
    pingtimer = setTimeout(() => ws.send(options.message || "ping"), options.interval || 1000);
  };
  ws.addEventListener("close", clearTimers);
  ws.addEventListener("message", receiveMessage);
  ws.addEventListener("open", () => setTimeout(receiveMessage, options.interval || 1000));
  return ws;
};

/**
 * Returns a buffered `AsyncIterable<T>` over the WebSocket's message stream.
 * Each message triggers its own reactive flush, so no message is dropped under burst conditions.
 * Calling `return()` on the iterator removes the event listener automatically.
 *
 * Compatible with `makeReconnectingWS` — listeners are re-attached to each new underlying connection.
 *
 * ```ts
 * const latestQuote = createMemo(async function* () {
 *   for await (const raw of wsMessageIterable<string>(ws)) {
 *     yield JSON.parse(raw) as Quote;
 *   }
 * });
 * ```
 */
export const wsMessageIterable = <T = string>(ws: WebSocket): AsyncIterable<T> => ({
  [Symbol.asyncIterator]() {
    const queue: T[] = [];
    let wakeup: (() => void) | null = null;
    let done = false;

    const handler = (e: MessageEvent) => {
      queue.push(e.data as T);
      const w = wakeup;
      wakeup = null;
      w?.();
    };

    ws.addEventListener("message", handler);

    return {
      async next() {
        if (done) return { value: undefined as unknown as T, done: true as const };
        if (queue.length > 0) return { value: queue.shift()!, done: false as const };
        await new Promise<void>(resolve => {
          wakeup = resolve;
        });
        // `done` may have been set to true by return() while we were awaiting
        if (done as boolean) return { value: undefined as unknown as T, done: true as const };
        return { value: queue.shift()!, done: false as const };
      },
      return() {
        done = true;
        ws.removeEventListener("message", handler);
        const w = wakeup;
        wakeup = null;
        w?.();
        return Promise.resolve({ value: undefined as unknown as T, done: true as const });
      },
    };
  },
});

export type WSDataOptions<T, U = T> = {
  /** Transform each raw message before it is yielded to subscribers. */
  transform?: (msg: T) => U;
};

/**
 * An async memo that wraps `wsMessageIterable`. Suspends the nearest `<Loading>` boundary
 * until the first message arrives; subsequent updates work with `isPending` and `latest`.
 *
 * ```tsx
 * const price = createWSData<Quote>(ws, { transform: JSON.parse });
 *
 * return (
 *   <Loading fallback={<p>Waiting for data…</p>}>
 *     <p>Bid: {price().bid} / Ask: {price().ask}</p>
 *   </Loading>
 * );
 * ```
 */
export const createWSData = <T = string, U = T>(
  ws: WebSocket,
  options?: WSDataOptions<T, U>,
): Accessor<U> => {
  const transform = options?.transform;
  return createMemo(async function* () {
    for await (const msg of wsMessageIterable<T>(ws)) {
      yield (transform ? transform(msg) : (msg as unknown as U));
    }
  }) as Accessor<U>;
};

export type WSStoreOptions<S, T = string> = {
  /** Initial store state before any messages arrive. */
  initial: S;
  /** Called for each incoming message with a draft of the store and the raw message. */
  patch: (draft: S, msg: T) => void;
};

/**
 * A reactive store driven by WebSocket messages as incremental patches.
 * Each incoming message is passed to `options.patch` as a draft mutation.
 *
 * ```tsx
 * const [appState] = createWSStore(ws, {
 *   initial: { users: [], status: "connecting" },
 *   patch(draft, msg) { Object.assign(draft, JSON.parse(msg)); },
 * });
 *
 * return <p>Users online: {appState.users.length}</p>;
 * ```
 */
export const createWSStore = <S extends object, T = string>(
  ws: WebSocket,
  options: WSStoreOptions<S, T>,
) => {
  const [store, setStore] = createStore(options.initial as any);
  const handler = (e: MessageEvent) => {
    runWithOwner(null, () => setStore((draft: S) => void options.patch(draft, e.data as T)));
  };
  ws.addEventListener("message", handler);
  onCleanup(() => ws.removeEventListener("message", handler));
  return [store, setStore] as ReturnType<typeof createStore<S>>;
};
