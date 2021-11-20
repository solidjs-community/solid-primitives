---
Name: websocket
Stage: 0
Package: "@solid-primitives/websocket"
Primitives: createWebsocket
Category: Network
---

# @solid-primitives/websocket

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Primitive to help establish, maintain and operate a websocket connection.

`createWebsocket` - Core primitive that setups up a basic outbound connection.

## How to use it

```ts
const [connect, disconnect] = createWebsocket("http://localhost", "", 3, 5000);
```

## Demo

You may find a semi-functional example here: https://codesandbox.io/s/solid-websocket-65ynu?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial version. Proposed and waiting for feedback.

</details>
