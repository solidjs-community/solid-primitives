import { type Accessor, onCleanup, createSignal } from "solid-js";

export type WSMessage = string | ArrayBufferLike | ArrayBufferView | Blob;

/**
 * opens a web socket connection with a queued send
 * ```ts
 * const ws = makeWS("ws://localhost:5000");
 * createEffect(() => ws.send(serverMessage()));
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
 * opens a web socket connection with a queued send that closes on cleanup
 * ```ts
 * const ws = makeWS("ws://localhost:5000");
 * createEffect(() => ws.send(serverMessage()));
 * ```
 * Will not throw if you attempt to send messages before the connection opened; instead, it will enqueue the message to be sent when the connection opens.
 */
export const createWS = (url: string, protocols?: string | string[]): WebSocket => {
  const ws = makeWS(url, protocols);
  onCleanup(() => ws.close());
  return ws;
};

/**
 * Returns a reactive state signal for the web socket's readyState:
 *
 * WebSocket.CONNECTING = 0
 * WebSocket.OPEN = 1
 * WebSocket.CLOSING = 2
 * WebSocket.CLOSED = 3
 *
 * ```ts
 * const ws = createWS('ws://localhost:5000');
 * const state = createWSState(ws);
 * const states = ["Connecting", "Open", "Closing", "Closed"] as const;
 * return <div>{states[state()]}</div>
 * ```
 */
export const createWSState = (ws: WebSocket): Accessor<0 | 1 | 2 | 3> => {
  const [state, setState] = createSignal(ws.readyState as 0 | 1 | 2 | 3);
  const _close = ws.close.bind(ws);
  ws.addEventListener("open", () => setState(1));
  ws.close = (...args) => {
    _close(...args);
    setState(2);
  };
  ws.addEventListener("close", () => setState(3));
  return state;
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
 * createEffect(() => ws.send(serverMessage()));
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
 * const ws = makeReconnectingWS("ws:localhost:5000");
 * createEffect(() => ws.send(serverMessage()));
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
 * Wraps a reconnecting WebSocket to send a heartbeat to check the connection
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
  ws.addEventListener("close", clearTimers);
  const receiveMessage = () => {
    clearTimers();
    pingtimer = setTimeout(() => ws.send(options.message || "ping"), options.interval || 1000);
  };
  ws.addEventListener("message", receiveMessage);
  setTimeout(receiveMessage, options.interval || 1000);
  return ws;
};
