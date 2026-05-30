<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Websocket" alt="Solid Primitives Websocket">
</p>

# @solid-primitives/websocket

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/websocket?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/websocket)
[![version](https://img.shields.io/npm/v/@solid-primitives/websocket?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/websocket)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

- [**Docs**](https://primitives.solidjs.community/docs/websocket)

Primitives to help establish, maintain, and operate WebSocket connections in Solid.

## Connection primitives

- [`makeWS`](#makews) — raw WebSocket with a buffered send queue (manual cleanup)
- [`createWS`](#createws) — same, but closes on owner disposal
- [`createWSState`](#createwsstate) — reactive `readyState` signal (`0`–`3`)
- [`makeReconnectingWS`](#makereconnectingws) — auto-reconnects on involuntary close (manual cleanup)
- [`createReconnectingWS`](#createreconnectingws) — same, but closes on owner disposal
- [`makeHeartbeatWS`](#makeheartbeatws) — wraps a reconnecting WS with a heartbeat/pong watchdog

### Message primitives

- [`createWSMessage`](#createwsmessage) — reactive signal for the **latest** received message
- [`wsMessageIterable`](#wsmessageiterable) — buffered `AsyncIterable` over WS messages
- [`createWSData`](#createwsdata) — async memo compatible with `<Loading>`, `isPending`, and `latest`
- [`createWSStore`](#createwsstore) — reactive store driven by WS message patches

---

## Connection primitives

### `makeWS`

Sets up a WebSocket with a buffered send queue. Messages sent before the connection opens are queued and flushed on `open`. Does **not** close on cleanup — use `createWS` for that.

```ts
const ws = makeWS("ws://localhost:5000");
createEffect(
  () => serverMessage(),
  msg => ws.send(msg),
);
onCleanup(() => ws.close());
```

### `createWS`

Same as `makeWS`, but registers `ws.close()` with `onCleanup`.

```ts
const ws = createWS("ws://localhost:5000");
createEffect(
  () => serverMessage(),
  msg => ws.send(msg),
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

> **Note — "latest wins" semantics.** `createWSMessage` uses a signal internally. In Solid 2.0, signal writes are batched: if two messages arrive before the reactive flush, only the second is seen by effects. This is fine for "current state" displays, but if your protocol can burst messages and you need to process every one, use [`wsMessageIterable`](#wsmessageiterable) or [`createWSData`](#createwsdata) instead.

### `makeReconnectingWS`

Returns a `WebSocket`-shaped proxy that transparently opens a new underlying connection whenever the server closes it involuntarily.

```ts
const ws = makeReconnectingWS("ws://localhost:5000", undefined, { delay: 3000, retries: Infinity });
createEffect(
  () => serverMessage(),
  msg => ws.send(msg),
);
onCleanup(() => ws.close());
```

### `createReconnectingWS`

Same as `makeReconnectingWS`, but closes on owner disposal.

### `makeHeartbeatWS`

Wraps a `ReconnectingWebSocket` to send a periodic heartbeat. If no response arrives within `wait` ms the connection is force-reconnected.

```ts
const ws = makeHeartbeatWS(createReconnectingWS("ws://localhost:5000"), {
  message: "ping",
  interval: 1000,
  wait: 1500,
});
```

---

## Async message primitives

These three primitives leverage Solid's async reactivity — `createMemo` with `AsyncIterable`, `<Loading>` boundaries, `isPending`, and `latest` — to provide a more powerful and correct model for WebSocket data.

### `wsMessageIterable`

```ts
function wsMessageIterable<T = string>(ws: WebSocket): AsyncIterable<T>
```

The foundational building block. Returns a buffered `AsyncIterable<T>` over a WebSocket's message stream. Messages that arrive while a consumer is busy are queued; none are dropped. The event listener is removed automatically when the iterator's `return()` method is called (Solid does this on memo disposal).

```ts
// Compose freely with any Solid 2.0 async primitive:
const latestQuote = createMemo(async function* () {
  for await (const raw of wsMessageIterable<string>(ws)) {
    yield JSON.parse(raw) as Quote;
  }
});
```

Works correctly with `makeReconnectingWS` — event listeners are re-attached to each new underlying connection, so the iterable survives reconnects transparently.

**Why this doesn't drop messages:** Unlike `createWSMessage`, each yielded value triggers its own reactive flush. Messages that arrive while an earlier one is being processed are buffered and drained in order, so no message is skipped.

### `createWSData`

```ts
function createWSData<T = string, U = T>(
  ws: WebSocket,
  options?: { transform?: (msg: T) => U },
): Accessor<U>
```

An async memo wrapping `wsMessageIterable`. Suspends the nearest `<Loading>` boundary until the first message arrives; subsequent updates work with `isPending` and `latest`. The optional `transform` is applied to each raw message before the memo value is updated.

```tsx
const ws = createReconnectingWS("wss://prices.example.com");
const price = createWSData<Quote>(ws, { transform: JSON.parse });

return (
  <Loading fallback={<p>Waiting for first quote…</p>}>
    <p class={isPending(() => price()) ? "stale" : ""}>
      Bid: {price().bid} / Ask: {price().ask}
    </p>
  </Loading>
);
```

Comparison with `createWSMessage`:

|                                          | `createWSMessage`         | `createWSData`                   |
| ---------------------------------------- | ------------------------- | -------------------------------- |
| Drops burst messages                     | Yes                       | No                               |
| Works with `<Loading>`                   | No                        | Yes                              |
| `isPending()` support                    | No                        | Yes                              |
| `latest()` support                       | No                        | Yes                              |
| Returns `undefined` before first message | Yes                       | No — throws (suspends)           |
| Best for                                 | Simple last-value display | State-source WS, real-time feeds |

### `createWSStore`

```ts
function createWSStore<S extends object, T = string>(
  ws: WebSocket,
  options: {
    initial: S;
    patch: (draft: S, msg: T) => void;
  },
): [store: Store<S>, setStore: StoreSetter<S>]
```

A reactive store driven by WebSocket messages as incremental patches. `patch` is called for each incoming message with a mutable draft of the store — mutate it directly, no return value needed. The event listener is removed on owner disposal.

```tsx
interface AppState {
  users: string[];
  status: "connecting" | "online" | "offline";
}

const ws = createReconnectingWS("wss://app.example.com");
const [state] = createWSStore<AppState, string>(ws, {
  initial: { users: [], status: "connecting" },
  patch(draft, msg) {
    Object.assign(draft, JSON.parse(msg));
  },
});

return <p>Users online: {state.users.length}</p>;
```

You can also use the returned setter to apply local updates:

```ts
const [state, setState] = createWSStore(ws, { initial: { count: 0 }, patch });

// imperative write from a button click, etc.
setState(s => { s.count = 0; });
```

---

## Composing with `action` (request/response pattern)

For protocols with correlated request/response over a shared WebSocket, Solid `action` is used:

```ts
const queryServer = action(function* (payload: RequestPayload) {
  const id = crypto.randomUUID();

  setOptimisticState(draft => {
    draft.loading = true;
  });

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
  message?: WSMessage; // default: "ping"
  interval?: number;   // ms between heartbeats — default: 1000
  wait?: number;       // ms to wait for pong before reconnecting — default: 1500
};

type WSDataOptions<T, U = T> = {
  transform?: (msg: T) => U; // map each raw message before the memo value updates
};

type WSStoreOptions<S, T = string> = {
  initial: S;                        // starting store state
  patch: (draft: S, msg: T) => void; // mutate the draft for each incoming message
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
