# @solid-primitives/sse

## 1.0.0-next.0

### Major Changes

- ce9b27a: Align `createSSE` with Solid 2.0 async reactivity patterns

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

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.0.102

### Patch Changes

- 326d05f: Fix memory leak when app-level retries are exhausted in `createSSE`. Previously, when all reconnect attempts were used up and the `EventSource` was permanently closed, `currentCleanup` was never called — leaving the `EventSource` instance and its event listeners alive in memory, and the `source` signal pointing to a stale handle. Now an `else if` branch explicitly calls `currentCleanup()`, clears the reference, and sets the `source` signal to `undefined`.

## 0.0.101

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.0.100

### Initial release

- `makeSSE` — base non-reactive primitive wrapping the browser `EventSource` API
- `createSSE` — reactive primitive with signals for `data`, `error`, and `readyState`, reactive URL support, SSR safety, and configurable app-level reconnection
