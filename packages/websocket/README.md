<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Websocket" alt="Solid Primitives Websocket">
</p>

## Warning: This package is under active development and will change.

# @solid-primitives/websocket

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive to help establish, maintain and operate a websocket connection.

- `makeWS` - sets up a web socket connection with a buffered send
- `createWS` - sets up a web socket connection that disconnects on cleanup
- `makeReconnectingWS` - sets up a web socket connection that reconnects if involuntarily closed
- `createReconnectingWS` - sets up a reconnecting web socket connection that disconnects on cleanup

## How to use it

```ts
const ws = createWS("ws://localhost:5000");
ws.send("it works");
createEffect(on(
  ws.message,
  (msg) => console.log(msg),
  { defer: true }
));

const socket = makeReconnectingWS(`ws://${location.hostName}/api/ws`);
onCleanup(() => socket.close());
socket.send("this will reconnect if connection fails");
```

## Demo

TODO

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
