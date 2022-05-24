import { Accessor, createSignal, onCleanup } from "solid-js";
import { SocketModifier } from "./modifiers";

export type SocketContext = {
  url: string;
  socket: WebSocket;
  connect?: VoidFunction;
  disconnect?: VoidFunction;
  disconnecting?: Function;
};

type SocketReturn = [
  connect: VoidFunction,
  disconnect: VoidFunction,
  send: (message: string) => void,
  state: Accessor<number>,
  socket: Accessor<WebSocket>
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
export function makeWebsocket(
  url: string,
  onData: (message: MessageEvent) => void,
  onError: (message: Event) => void,
  protocols?: string | Array<string> | undefined,
  ...modifiers: SocketModifier[]
): SocketReturn {
  let socket: WebSocket;
  let disconnecting: Function;
  const [state, setState] = createSignal(WebSocket.CLOSED);
  const send = (data: string | ArrayBuffer) => socket.send(data);
  const disconnect = () => {
    if (disconnecting) disconnecting();
    if (socket) {
      socket.close();
    }
  };
  // Connect the socket to the server
  const connect = () => {
    if (disconnecting) disconnecting();
    setState(WebSocket.CONNECTING);
    socket = new WebSocket(url, protocols);
    socket.onopen = () => setState(WebSocket.OPEN);
    socket.onclose = () => setState(WebSocket.CLOSED);
    socket.onerror = onError;
    socket.onmessage = onData;
  };
  const ctx = {
    url,
    disconnect,
    get socket() {
      return socket;
    },
    get disconnecting() {
      if (disconnecting) disconnecting;
      return () => {};
    },
    connect
  } as SocketContext;
  (modifiers || []).map((modifier) => modifier(ctx));
  onCleanup(() => disconnect);
  return [connect, disconnect, send, state, () => socket];
};
