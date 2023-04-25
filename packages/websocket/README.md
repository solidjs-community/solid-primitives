<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Websocket" alt="Solid Primitives Websocket">
</p>

# @solid-primitives/websocket

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive to help establish, maintain and operate a websocket connection.

- `makeWS` - sets up a web socket connection with a buffered send
- `createWS` - sets up a web socket connection that disconnects on cleanup
- `makeReconnectingWS` - sets up a web socket connection that reconnects if involuntarily closed
- `createReconnectingWS` - sets up a reconnecting web socket connection that disconnects on cleanup

All of them return a WebSocket instance extended with a `message` prop containing an accessor for the last received message for convenience and the ability to receive messages to send before the connection is opened.
## How to use it

```ts
const ws = createWS("ws://localhost:5000");
ws.send("it works");
createEffect(on(
  ws.message,
  (msg) => console.log(msg),
  { defer: true }
));

const socket = makeReconnectingWS(`ws://${location.hostName}/api/ws`, undefined, { timeout: 500 });
// with the primitives starting with `make...`, one needs to manually clean up:
onCleanup(() => socket.close());
socket.send("this will reconnect if connection fails");
```

### Definitions

```ts
/** Arguments of the primitives */
type WSProps = [url: string, protocols?: string | string[]];
type WSMessage = string | ArrayBufferLike | ArrayBufferView | Blob;
type WSReadyState = 0/* Connecting */ | 1/* Connected */ | 2/* Closing */ | 3/* Closed */;
type WSEventMap = {
  close: CloseEvent,
  error: Event,
  message: MessageEvent,
  open: Event
};
interface ExtendedWebSocket extends EventTarget {
  send(message: WSMessage) => void;
  close(code?: number, reason?: string/* max 123bytes */) => void;
  message() => WSMessage;
  readonly readyState: WSReadyState;
  readonly binaryType: "blob" | "arraybuffer"/* depending on what binary type is received */;
  readonly bufferedAmount: number;
  readonly extensions: string;
  readonly protocol: string;
  readonly url: string;
}
```

## Demo

You may view a working example here:
https://solidjs-community.github.io/solid-primitives/websocket/

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
