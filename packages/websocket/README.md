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
- `makeHeartbeatWS` - wraps a reconnecting web socket to send a heart beat and reconnect if the answer fails

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

const socket = makeHeartbeatWS(makeReconnectingWS(
  `ws://${location.hostName}/api/ws`,
  undefined,
  { timeout: 500 }
), { message: '👍'});
// with the primitives starting with `make...`, one needs to manually clean up:
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
type ReconnectingWebSocket = WebSocket & {
  reconnect: () => void,
  // ws.send.before is meant to be used by heartbeat
  send: ((msg: WSMessage) => void) & { before: () => void }
}
type WSHeartbeatOptions = {
  /**
   * Heartbeat message being sent to the server in order to validate the connection 
   * @default "ping"
   */
  message?: WSMessage,
  /**
   * The time between messages being sent in milliseconds
   * @default 1000
   */
  interval?: number,
  /**
   * The time after the heartbeat message being sent to wait for the next message in milliseconds
   * @default 1500
   */
  wait?: number,
}
```

## Demo

You may view a working example here:
https://solidjs-community.github.io/solid-primitives/websocket/

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

