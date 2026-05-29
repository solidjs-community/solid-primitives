---
"@solid-primitives/websocket": major
---

Upgrade to Solid.js 2.0 (`^2.0.0-beta.7`) and add async-reactive message primitives.

**Breaking changes**

- Peer dependency is now `solid-js@^2.0.0-beta.7`. All `createEffect` examples in docs now use the Solid 2.0 split form: `createEffect(compute, effect)`.

**New: `createWSMessage<T>`**

Reactive `Accessor<T | undefined>` for the most recently received WebSocket message. Cleans up its event listener on owner disposal via `onCleanup`.

```ts
const message = createWSMessage<string>(ws);
return <p>{message()}</p>;
```

> Note: uses a signal internally, so under burst conditions only the final message before a flush is tracked by effects. For every-message processing, use the planned `wsMessageIterable` / `createWSData` primitives.

**`createWSState` signal fix**

Internal signal now uses `{ ownedWrite: true }` to suppress the Solid 2.0 dev-mode `SIGNAL_WRITE_IN_OWNED_SCOPE` diagnostic, which would fire if `ws.close()` is called from inside a component body or reactive computation.

**Planned for next minor: async message primitives**

The following are designed and documented but not yet implemented, based on Solid 2.0's `createMemo(AsyncIterable)` model:

- `wsMessageIterable<T>` — buffered `AsyncIterable` that never drops burst messages; works with `makeReconnectingWS`
- `createWSData<T>` — async memo over `wsMessageIterable`; suspends `<Loading>` until first message; integrates with `isPending` and `latest`
- `createWSStore<T>` — reactive store driven by WS messages as draft-mutation patches via `createStore(fn, seed)`
