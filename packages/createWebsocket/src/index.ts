import { onMount, createMemo, createSignal, onCleanup } from 'solid-js';

enum WebsocketState {
  CONNECTED = 'connected',
  CLOSED = 'closed',
  OPEN = 'open',
  CLOSING = 'closing',
};

/**
 * Handles managing a workers input and output.
 * Ported from: https://github.com/alibaba/hooks/blob/master/packages/hooks/src/useWebSocket/index.ts
 *
 * @param path - String to the worker
 * @param options - Optiions to supply the worker
 * @param input - Input to supply thee worker
 * @return Returned statate from the worker
 * 
 * @example
 * ```ts
 * const output = createWorker('./worker.js', { hello: 'world' });
 * ```
 */
const createWebsocket = (
  url: string,
  protocols?: string|Array<string>,
  options: {
    reconnectLimit: number;
    reconnectInterval: number;
    manual: boolean;
    events: {}
  }
) => {
  const [state, setState] = createSignal(WebsocketState.CLOSED);

  const handleConnected = () => setState(WebsocketState.CONNECTED);
  const handleDisconnected = () => setState(WebsocketState.CLOSED);
  const handleMessage = createMemo(() => new WebSocket(url, protocols));
  
  const socket = createMemo(() => new WebSocket(url, protocols));

  const send = () => {};
  const disconnect = () => {};

  const events = [
    ...options.events,

  ];

  onMount(() => {
    socket().addEventListener('open', handleConnected);
    socket().addEventListener('close', handleDisconnected);
    socket().addEventListener('message', handleMessage);
  });
  onCleanup(() => {
    socket().addEventListener('open', handleConnected);
    socket().addEventListener('close', handleDisconnected);
    socket().addEventListener('message', handleMessage);
  });
  return { state, send, disconnect };
};

export default createWebsocket;
