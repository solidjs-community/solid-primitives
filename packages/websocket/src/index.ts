import { createSignal, onCleanup } from "solid-js";

/**
 * Handles opening managing and reconnecting to a Websocket.
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
 * const [ connect, disconnect ] = createWebsocket('http://localhost', '', 3, 5000);
 * ```
 */
const createWebsocket = (
  url: string,
  onData: (message: MessageEvent) => void,
  onError: (message: Event) => void,
  protocols?: string | Array<string>,
  reconnectLimit?: number,
  reconnectInterval?: number
): [
  connect: () => void,
  disconnect: () => void,
  send: (message: string) => void,
  state: () => number,
  socket: () => WebSocket
] => {
  let socket: WebSocket;
  let reconnections = 0;
  let reconnectId: ReturnType<typeof setTimeout>;
  const [state, setState] = createSignal(WebSocket.CLOSED);
  const send = (data: string | ArrayBuffer) => socket.send(data);
  const cancelReconnect = () => {
    if (reconnectId) {
      clearTimeout(reconnectId);
    }
  };
  const disconnect = () => {
    cancelReconnect();
    reconnectLimit = Number.NEGATIVE_INFINITY;
    if (socket) {
      socket.close();
    }
  };
  // Connect the socket to the server
  const connect = () => {
    cancelReconnect();
    setState(WebSocket.CONNECTING);
    socket = new WebSocket(url, protocols);
    socket.onopen = () => setState(WebSocket.OPEN);
    socket.onclose = () => {
      setState(WebSocket.CLOSED);
      if (reconnectLimit && reconnectLimit > reconnections) {
        reconnections += 1;
        reconnectId = setTimeout(connect, reconnectInterval);
      }
    };
    socket.onerror = onError;
    socket.onmessage = onData;
  };
  onCleanup(() => disconnect);
  return [connect, disconnect, send, state, () => socket];
};

export default createWebsocket;
