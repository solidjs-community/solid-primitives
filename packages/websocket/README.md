<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Websocket" alt="Solid Primitives Websocket">
</p>

# @solid-primitives/websocket

[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives to help establish, maintain, and operate a WebSocket connection.

- `makeWS` - sets up a WebSocket connection with a buffered send (manual cleanup)
- `createWS` - sets up a WebSocket connection that closes on owner disposal
- `createWSState` - reactive signal for the WebSocket's `readyState`
- `createWSMessage` - reactive signal containing the latest received message
- `makeReconnectingWS` - WebSocket that reconnects automatically on involuntary close (manual cleanup)
- `createReconnectingWS` - reconnecting WebSocket that closes on owner disposal
- `makeHeartbeatWS` - wraps a reconnecting WebSocket with a heartbeat/pong watchdog

## How to use it

### Basic connection with reactive state and messages

```ts
const ws = createWS("ws://localhost:5000");
const state = createWSState(ws);
const message = createWSMessage<string>(ws);

const states = ["Connecting", "Open", "Closing", "Closed"] as const;

ws.send("it works");

// Solid 2.0: createEffect takes separate compute and effect callbacks
createEffect(
  () => message(),
  (msg) => msg !== undefined && console.log("received:", msg),
);

return <p>Connection: {states[state()]}</p>;
```

### Heartbeat + reconnecting WebSocket

```ts
const ws = makeHeartbeatWS(
  makeReconnectingWS(`ws://${location.hostname}/api/ws`, undefined, { delay: 500 }),
  { message: "ping" },
);

createEffect(
  () => serverMessage(),
  (msg) => ws.send(msg),
);

// Primitives starting with `make` require manual cleanup:
onCleanup(() => ws.close());
```

### Reacting to each new message

```ts
const ws = createWS("ws://localhost:5000");
const message = createWSMessage<{ type: string; payload: unknown }>(ws);

// Split-effect form: compute phase tracks the signal, effect phase does the work
createEffect(
  () => message(),
  (msg) => {
    if (msg?.type === "update") handleUpdate(msg.payload);
  },
);
```

### Accumulating messages into a store

```ts
import { createStore } from "solid-js/store";
import { createReconnectingWS, type WSMessage } from "@solid-primitives/websocket";

const ws = createReconnectingWS("ws://localhost:5000");
const [messages, setMessages] = createStore<WSMessage[]>([]);

ws.addEventListener("message", (ev) => setMessages(prev => [...prev, ev.data]));

return (
  <For each={messages}>
    {(msg) => <p>{String(msg)}</p>}
  </For>
);
```

## Definitions

```ts
type WSMessage = string | ArrayBufferLike | ArrayBufferView | Blob;

type WSReconnectOptions = {
  delay?: number;   // ms between reconnect attempts (default: 3000)
  retries?: number; // max reconnect attempts (default: Infinity)
};

type ReconnectingWebSocket = WebSocket & {
  reconnect: () => void;
  // ws.send.before is used internally by makeHeartbeatWS
  send: ((msg: WSMessage) => void) & { before?: () => void };
};

type WSHeartbeatOptions = {
  /** Heartbeat message sent to validate the connection. Default: "ping" */
  message?: WSMessage;
  /** Interval between heartbeat messages in ms. Default: 1000 */
  interval?: number;
  /** Time to wait for a response before reconnecting in ms. Default: 1500 */
  wait?: number;
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
