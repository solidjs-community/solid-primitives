import { createMemo, createSignal, onCleanup, type Accessor } from "solid-js";

export type WSMessage = string | ArrayBufferLike | ArrayBufferView | Blob;

/**
 * opens a web socket connection with a queued send
 * ```ts
 * const ws = makeWS("ws:localhost:5000");
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
  ws.send = (msg: WSMessage) =>
    ws.readyState == 1 ? _send(msg) : sendQueue.push(msg);
  ws.addEventListener('open', () => {
    while (sendQueue.length) _send(sendQueue.shift()!);
  });
  return ws;
}

/**
 * Extends a WebSocket with a message signal:
 * ```ts
 * const ws = createMessageWS(makeWS("ws://localhost:5000"));
 * createEffect(on(ws.message, (msg) => console.log(msg)), { defer: true });
 * ```
 */
export const createMessageWS = (
  ws: WebSocket
): WebSocket & { message: Accessor<WSMessage | undefined> } => {
  const [message, setMessage] = createSignal<WSMessage>();
  ws.addEventListener('message', (ev) => setMessage(ev.data));
  return Object.assign(ws, { message });
};

/**
 * opens a web socket connection with a queued send that closes on cleanup
 * ```ts
 * const ws = makeWS("ws:localhost:5000");
 * createEffect(() => ws.send(serverMessage()));
 * ```
 * Will not throw if you attempt to send messages before the connection opened; instead, it will enqueue the message to be sent when the connection opens.
 */
export const createWS = (
  url: string,
  protocols?: string | string[],
): WebSocket => {
  const ws = makeWS(url, protocols);
  onCleanup(() => ws.close());
  return ws;
}

export type WSReconnectOptions = {
  delay?: number,
  retries?: number,
}

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
  options: WSReconnectOptions = {}
) => {
  let retries = options.retries || Infinity;
  const queue: WSMessage[] = [];
  const events: Parameters<WebSocket["addEventListener"]>[] = [];
  let ws: WebSocket;
  const getWS = (): WebSocket => {
    let s = makeWS(url, protocols, queue);
    s.addEventListener('close', () =>
      retries-- > 0 &&
        setTimeout(() => {        
          ws = makeWS(url, protocols, queue);
          events.forEach((args) => ws.addEventListener(...args));
        }, options.delay || 3000)
    );
    return s;
  }
  ws = getWS();
  const wws = {
    close: (...args: Parameters<WebSocket["close"]>) => {    
      retries = 0;
      return ws.close(...args);
    },
    addEventListener: (...args: Parameters<WebSocket["addEventListener"]>) => { 
      events.push(args);
      return ws.addEventListener(...args);
    },
    removeEventListener: (...args: Parameters<WebSocket["removeEventListener"]>) => {
      const pos = events.findIndex((ev) => args[0] === ev[0] && args[1] == ev[1]);
      pos > -1 && events.splice(pos, 1);
      return ws.removeEventListener(...args);
    }
  }
  for (let name in ws)
    wws[name as keyof typeof wws] == null &&
    Object.defineProperty(wws, name, {
      enumerable: true,
      get: () => typeof ws[name as keyof typeof ws] === 'function'
        ? (ws[name as keyof typeof ws] as Function).bind(ws)
        : ws[name as keyof typeof ws]
    });
  return wws as WebSocket;
};

/**
 * Returns a WebSocket-like object that under the hood opens new connections on disconnect and closes on cleanup:
 * ```ts
 * const ws = makeReconnectingWS("ws:localhost:5000");
 * createEffect(() => ws.send(serverMessage()));
 * ```
 * Will not throw if you attempt to send messages before the connection opened; instead, it will enqueue the message to be sent when the connection opens.
 */
export const createReconnectingWS = (
  url: string,
  protocols?: string | string[],
  options?: WSReconnectOptions
) => {
  const ws = makeReconnectingWS(url, protocols, options);
  onCleanup(() => ws.close());
  return ws;
}

