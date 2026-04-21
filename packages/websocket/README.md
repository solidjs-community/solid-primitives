<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Websocket" alt="Solid Primitives Websocket">
</p>

# @solid-primitives/websocket

[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives to help establish, maintain, and operate WebSocket connections in Solid.

### Connection primitives

- [`makeWS`](#makews) — raw WebSocket with a buffered send queue (manual cleanup)
- [`createWS`](#createws) — same, but closes on owner disposal
- [`createWSState`](#createwsstate) — reactive `readyState` signal (`0`–`3`)
- [`makeReconnectingWS`](#makereconnectingws) — auto-reconnects on involuntary close (manual cleanup)
- [`createReconnectingWS`](#createreconnectingws) — same, but closes on owner disposal
- [`makeHeartbeatWS`](#makeheartbeatws) — wraps a reconnecting WS with a heartbeat/pong watchdog

### Message primitives

- [`createWSMessage`](#createwsmessage) — reactive signal for the **latest** received message
- [`wsMessageIterable`](#wsmessageiterable-planned) — buffered `AsyncIterable` over WS messages *(planned)*
- [`createWSData`](#createwsdata-planned) — async memo compatible with `<Loading>`, `isPending`, and `latest` *(planned)*
- [`createWSStore`](#createwsstore-planned) — reactive store driven by WS message patches *(planned)*

---

## Connection primitives

### `makeWS`

Sets up a WebSocket with a buffered send queue. Messages sent before the connection opens are queued and flushed on `open`. Does **not** close on cleanup — use `createWS` for that.

```ts
const ws = makeWS("ws://localhost:5000");
createEffect(
  () => serverMessage(),
  (msg) => ws.send(msg),
);
onCleanup(() => ws.close());
```

### `createWS`

Same as `makeWS`, but registers `ws.close()` with `onCleanup`.

```ts
const ws = createWS("ws://localhost:5000");
createEffect(
  () => serverMessage(),
  (msg) => ws.send(msg),
);
```

### `createWSState`

Returns a reactive `Accessor<0 | 1 | 2 | 3>` tracking the WebSocket's `readyState`.

```ts
const ws = createWS("ws://localhost:5000");
const state = createWSState(ws);
const labels = ["Connecting", "Open", "Closing", "Closed"] as const;

return <p>Status: {labels[state()]}</p>;
```

### `createWSMessage`

Returns a reactive `Accessor<T | undefined>` that holds the **most recently received** message. Starts as `undefined`.

```ts
const ws = createWS("ws://localhost:5000");
const message = createWSMessage<string>(ws);

return <p>Last message: {message()}</p>;
```

> **Note — "latest wins" semantics.** `createWSMessage` uses a signal internally. In Solid 2.0, signal writes are batched: if two messages arrive before the reactive flush, only the second is seen by effects. This is fine for "current state" displays, but if your protocol can burst messages and you need to process every one, use [`wsMessageIterable`](#wsmessageiterable-planned) or [`createWSData`](#createwsdata-planned) instead.

### `makeReconnectingWS`

Returns a `WebSocket`-shaped proxy that transparently opens a new underlying connection whenever the server closes it involuntarily.

```ts
const ws = makeReconnectingWS("ws://localhost:5000", undefined, { delay: 3000, retries: Infinity });
createEffect(
  () => serverMessage(),
  (msg) => ws.send(msg),
);
onCleanup(() => ws.close());
```

### `createReconnectingWS`

Same as `makeReconnectingWS`, but closes on owner disposal.

### `makeHeartbeatWS`

Wraps a `ReconnectingWebSocket` to send a periodic heartbeat. If no response arrives within `wait` ms the connection is force-reconnected.

```ts
const ws = makeHeartbeatWS(
  createReconnectingWS("ws://localhost:5000"),
  { message: "ping", interval: 1000, wait: 1500 },
);
```

---

## Async message primitives *(planned for next minor)*

These three primitives leverage Solid's async reactivity — `createMemo` with `AsyncIterable`, `<Loading>` boundaries, `isPending`, and `latest` — to provide a more powerful and correct model for WebSocket data.

### `wsMessageIterable` *(planned)*

The foundational building block. Returns a buffered `AsyncIterable<T>` over a WebSocket's message stream. Cleanup (`ws.removeEventListener`) happens automatically when the iterator is returned (Solid calls `it.return()` on memo disposal).

```ts
import { wsMessageIterable } from "@solid-primitives/websocket";

// Compose freely with any Solid 2.0 async primitive:
const latestQuote = createMemo(async function* () {
  for await (const raw of wsMessageIterable<string>(ws)) {
    yield JSON.parse(raw) as Quote;
  }
});
```

Works correctly with `makeReconnectingWS` — event listeners are re-attached to each new underlying connection, so the iterable survives reconnects transparently.

**Why this doesn't drop messages:** Unlike `createWSMessage`, each yielded value triggers its own `flush()` inside the Solid runtime. Messages that arrive while an earlier one is being processed are buffered and drained synchronously, so no message is skipped by reactive effects.

### `createWSData` *(planned)*

An async memo wrapping `wsMessageIterable`. Suspends the nearest `<Loading>` boundary until the first message arrives; subsequent updates work with `isPending` and `latest`.

```tsx
const price = createWSData<Quote>(ws, { transform: JSON.parse });

return (
  <Loading fallback={<p>Waiting for data…</p>}>
    {/* isPending: true while the next tick is in-flight with a stale value showing */}
    <p class={isPending(() => price()) ? "stale" : ""}>
      Bid: {price().bid} / Ask: {price().ask}
    </p>
  </Loading>
);
```

Comparison with `createWSMessage`:

| | `createWSMessage` | `createWSData` |
|---|---|---|
| Drops burst messages | Yes | No |
| Works with `<Loading>` | No | Yes |
| `isPending()` support | No | Yes |
| `latest()` support | No | Yes |
| Returns `undefined` before first message | Yes | No — throws (suspends) |
| Best for | Simple last-value display | State-source WS, real-time feeds |

### `createWSStore` *(planned)*

A reactive store driven by WebSocket messages as incremental patches. Uses Solid `createStore(fn, seed)` form — each message is applied as a draft mutation.

```tsx
const [appState] = createWSStore(ws, {
  initial: { users: [], status: "connecting" },
  patch(draft, msg) {
    Object.assign(draft, JSON.parse(msg));
  },
});

return <p>Users online: {appState.users.length}</p>;
```

---

## Composing with `action` (request/response pattern)

For protocols with correlated request/response over a shared WebSocket, Solid `action` is used:

```ts
const queryServer = action(function* (payload: RequestPayload) {
  const id = crypto.randomUUID();

  setOptimisticState(draft => { draft.loading = true; });

  ws.send(JSON.stringify({ ...payload, id }));

  const response: ResponsePayload = yield new Promise(resolve => {
    const handler = (e: MessageEvent) => {
      const msg = JSON.parse(e.data);
      if (msg.id === id) {
        ws.removeEventListener("message", handler);
        resolve(msg);
      }
    };
    ws.addEventListener("message", handler);
  });

  refresh(() => serverData());
  return response;
});
```

---

## Type reference

```ts
type WSMessage = string | ArrayBufferLike | ArrayBufferView | Blob;

type WSReconnectOptions = {
  delay?: number;   // ms between reconnect attempts — default: 3000
  retries?: number; // max reconnect attempts — default: Infinity
};

type ReconnectingWebSocket = WebSocket & {
  reconnect: () => void;
  send: ((msg: WSMessage) => void) & { before?: () => void };
};

type WSHeartbeatOptions = {
  message?: WSMessage;  // default: "ping"
  interval?: number;   // ms between heartbeats — default: 1000
  wait?: number;       // ms to wait for pong before reconnecting — default: 1500
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
