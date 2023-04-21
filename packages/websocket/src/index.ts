import { createSignal, onCleanup } from "solid-js";

export type WebsocketState = 0 | 1 | 2 | 3;

export type WSExtraProps = {
  _send: (message: string) => void;
  message: () => string | undefined;
  state: number;
};

export function makeWs(url: string, options: any): WebSocket & WSExtraProps {
  const sendQueue: string[] = [];
  const ws: WebSocket & Partial<WSExtraProps> = new WebSocket(url, options);
  const [message, setMessage] = createSignal<string>();
  ws._send = ws.send;
  ws.message = message;
  ws.send = (msg: string) => (ws.readyState == 1 ? ws._send!(msg) : sendQueue.push(msg));
  ws.addEventListener("open", () => {
    while (sendQueue.length) ws._send!(sendQueue.shift() || "");
  });
  ws.addEventListener("message", ({ data }) => setMessage(data));
  return ws as WebSocket & WSExtraProps;
}

export function createWs(url: string, options: any) {
  const ws = makeWs(url, options);
  onCleanup(() => ws.state == 1 && ws.close());
  return ws;
}
