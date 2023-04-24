import { createMemo, createSignal, onCleanup, type Accessor } from "solid-js";

export type WSMessage = string | ArrayBufferLike | ArrayBufferView | Blob;

export type WSExtension = {
  message: Accessor<WSMessage | undefined>
}

/**
 * opens a web socket connection with a queued send and a message signal
 * ```ts
 * const ws = makeWS("ws:localhost:5000");
 * createEffect(() => ws.send(serverMessage()));
 * createEffect(() => console.log(ws.message()));
 * onCleanup(() => ws.close());
 * ```
 * Will not throw if you attempt to send messages before the connection opened; instead, it will enqueue the message to be sent when the connection opens.
 *
 * It will not close the connection on cleanup. To do that, use `createWS`
 */
export const makeWS = (
  url: string,
  protocols?: string | string[]
): WebSocket & { message: Accessor<WSMessage | undefined> } => {
  const [message, setMessage] = createSignal<WSMessage>();
  const ws: WebSocket & { message: Accessor<WSMessage | undefined> } = Object.assign(
    new WebSocket(url, protocols),
    { message }
  );
  const _send = ws.send.bind(ws);
  const queue: WSMessage[] = [];
  ws.send = (msg: WSMessage) => 
    ws.readyState == 1 ? _send(msg) : queue.push(msg);
  ws.addEventListener('message', ({ data }) => setMessage(data));
  ws.addEventListener('open', () => {
    while (queue.length)
      _send(queue.shift()!);
  });
  return ws;
};

export const createWS = (
  url: string,
  protocols?: string | string[],
): WebSocket & WSExtension => {
  const ws = makeWS(url, protocols);
  onCleanup(() => (console.warn("test"), ws.close()));
  return ws;
}

export type WSReconnectOptions = {
  timeout?: number,
  retries?: number,
}

export const makeReconnectingWS = (
  url: string,
  protocols?: string | string[],
  options: WSReconnectOptions = {}
) => {
  let retries = options.retries || Infinity;
  let makeWrappedWS: () => WebSocket & { message: Accessor<WSMessage | undefined> };
  const [socket, setSocket] = createSignal<WebSocket & { message: Accessor<WSMessage | undefined> }>(
    (makeWrappedWS = () => {
      const ws = makeWS(url, protocols);
      const _close = ws.close.bind(ws);
      ws.close = (...args) => ((retries = 0), _close(...args));
      ws.addEventListener('close', () =>
        retries-- > 0 && 
          setTimeout(
            () => setSocket(makeWrappedWS),
            options.timeout || 2999
          )
      );
      return ws;
    })()
  );
  return socket;
}

export const createReconnectingWS = (
  url: string,
  protocols?: string | string[],
  options?: WSReconnectOptions
) => {
  const ws = makeReconnectingWS(url, protocols, options);
  onCleanup(() => ws().close());
  return ws;
}

