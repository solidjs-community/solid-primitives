import { Accessor, createSignal, onCleanup } from "solid-js";
import { RequestModifier } from "./modifiers";

export type RequestContext<T> = {
  urlAccessor: Accessor<[info: RequestInfo, init?: RequestInit] | undefined>;
  response?: Response;
  abortController?: AbortController;
  responseHandler?: (response: Response) => T;
  [key: string]: any;
};

type SocketReturn = [
  connect: () => void,
  disconnect: () => void,
  send: (message: string) => void,
  state: Accessor<number>,
  socket: () => WebSocket
];

/**
 * Basic primitive for creating a websocket.
 *
 * @param url - Path to the websocket server
 * @param onData - A function supplied that messages will be reported to
 * @param onError - A function supplied that errors will be reported to
 * @param procotols - List of protocols to support
 * @param reconnectLimit - Amount of reconnection attempts
 * @param reconnectInterval - Time in between connection attempts
 * @return Returns an array containing websocket management options
 *
 * @example
 * ```ts
 * const [ connect, disconnect ] = makeWebsocket('http://localhost', '', 3, 5000);
 * ```
 */
 export function makeWebsocket<T, I = undefined>(
  url: string,
  onData: (message: MessageEvent) => void,
  onError: (message: Event) => void,
  protocols?: string | Array<string> | undefined,
): SocketReturn;
export function makeWebsocket(
  url: string,
  onData: (message: MessageEvent) => void,
  onError: (message: Event) => void,
  protocols?: string | Array<string> | undefined,
): SocketReturn {
  let socket: WebSocket;
  const [state, setState] = createSignal(WebSocket.CLOSED);
  const send = (data: string | ArrayBuffer) => socket.send(data);
  const disconnect = () => {
    // cancelReconnect();
    // reconnectLimit = Number.POSITIVE_INFINITY;
    if (socket) {
      socket.close();
    }
  };
  // Connect the socket to the server
  const connect = () => {
    // cancelReconnect();
    setState(WebSocket.CONNECTING);
    socket = new WebSocket(url, protocols);
    socket.onopen = () => setState(WebSocket.OPEN);
    socket.onclose = () => {
      setState(WebSocket.CLOSED);
    //   if (reconnectLimit && reconnectLimit > reconnections) {
    //     reconnections += 1;
    //     reconnectId = setTimeout(connect, reconnectInterval);
    //   }
    };
    socket.onerror = onError;
    socket.onmessage = onData;
  };
  const modifiers = args.slice(1).find(Array.isArray) || [];
  onCleanup(() => disconnect);
  return [connect, disconnect, send, state, () => socket];
};
