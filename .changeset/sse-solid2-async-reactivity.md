---
"@solid-primitives/sse": minor
---

Align `createSSE` with Solid 2.0 async reactivity patterns

### Breaking changes

**`pending` removed from `SSEReturn`**

Use `<Loading>` for initial load UI and `isPending(() => data())` for stale-while-revalidating. Both are re-exported from this package.

```tsx
// Before
const { data, pending } = createSSE(url);
<Show when={!pending()}><p>{data()}</p></Show>

// After — declarative initial load
<Loading fallback={<p>Connecting…</p>}>
  <p>{data()}</p>
</Loading>

// After — stale-while-revalidating (only true once a value exists and new data is pending)
<Show when={isPending(() => data())}><p>Refreshing…</p></Show>
```

**`error` removed from `SSEReturn`**

Terminal errors (connection CLOSED with no retries left) now propagate through `data()` to `<Errored>`. Non-terminal errors (browser reconnecting) are still surfaced via `onError` callback.

```tsx
// Before
const { data, error } = createSSE(url);
<Show when={error()}><p>Error: {error()?.type}</p></Show>

// After — single error path via Errored boundary
<Errored fallback={err => <p>Connection failed</p>}>
  <Loading fallback={<p>Connecting…</p>}>
    <p>{data()}</p>
  </Loading>
</Errored>
```

**`data` type narrowed from `Accessor<T | undefined>` to `Accessor<T>`**

The `| undefined` loading hole is removed. When `data()` is not ready it throws `NotReadyError` (caught by `<Loading>`) or the terminal error (caught by `<Errored>`); it never returns `undefined` due to pending state.

**SSR stub**: `data()` now throws `NotReadyError` on the server when no `initialValue` is provided (consistent with browser behaviour). Provide `initialValue` for a non-throwing SSR default.

### New primitives

**`makeSSEAsyncIterable<T>(url, options?)`**

Wraps an SSE endpoint as a standard `AsyncIterable<T>`. Each message is one yielded value; terminal errors are thrown. Cleanup runs automatically when the iterator is abandoned.

```ts
for await (const msg of makeSSEAsyncIterable<string>(url)) {
  console.log(msg);
}
```

**`createSSEStream<T>(url, options?)`**

Minimal reactive alternative to `createSSE` — returns only a `data: Accessor<T>` backed by an async iterable. Same `<Loading>` / `<Errored>` integration, no `source` / `readyState` / `close` / `reconnect`.

```ts
const data = createSSEStream<{ msg: string }>(url, { transform: JSON.parse });
```
