<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Workers" alt="Solid Primitives Workers">
</p>

# @solid-primitives/workers

[![size](https://img.shields.io/badge/size-2.0_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/workers)
[![version](https://img.shields.io/npm/v/@solid-primitives/workers?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/workers)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

A set of primitives for working with Web Workers:

- `createWorker` — Spawns a worker from an object of named functions; each method becomes a **typed** async RPC call.
- `createWorkerPool` — Like `createWorker` but round-robins calls across a fixed pool of workers.
- `createWorkerQuery` — Reactive async query backed by a worker call; integrates with `<Loading>`.
- `createReactiveWorker` — Full reactive bridge between the main thread and a worker using Solid stores.
- `workerScope` — Worker-side companion to `createReactiveWorker`; provides a reactive `inputs` store and a `setOutputs` setter inside the worker.

## Installation

```bash
npm install @solid-primitives/workers
# or
yarn add @solid-primitives/workers
# or
pnpm add @solid-primitives/workers
```

---

## How to use it

### `createWorker`

Spawn a worker from an object of self-contained functions. Each method becomes a typed async RPC call on the returned worker object. The worker is automatically terminated when the reactive owner is disposed.

```ts
const [worker] = createWorker({
  add(a: number, b: number) {
    return a + b;
  },
  multiply(a: number, b: number) {
    return a * b;
  },
});

console.log(await worker.add(1, 2)); // 3  — fully typed, no cast required
console.log(await worker.multiply(3, 4)); // 12
```

**Returns:** `[worker, start, stop, exports]`

- `worker` — the underlying `Worker` instance with typed async methods attached. Each method returns a `CancellablePromise<T>` — a standard Promise extended with an `.abort()` method.
- `start` — re-attaches the RPC message listener; called automatically on creation. Safe to call again (replaces the old listener rather than stacking).
- `stop` — removes the listener and terminates the worker. Idempotent — subsequent calls (e.g. from `onCleanup`) are no-ops.
- `exports` — `Set<string>` of the exported function names

**Signature:**

```ts
function createWorker<T extends Record<string, Function>>(
  fns: T,
  options?: WorkerOptions,
): CreateWorkerResult<T>;
```

#### Cancellation

Every RPC call returns a `CancellablePromise` with an `.abort()` method. Calling it immediately rejects the promise with an `AbortError` and notifies the worker to stop:

```ts
const [worker] = createWorker({ wait });

const call = worker.wait(5000);
call.catch(e => console.log(e.name)); // "AbortError"

setTimeout(() => call.abort(), 500); // cancel after 500 ms
```

Worker functions receive an `AbortSignal` as their **last argument** automatically. Self-contained async functions can use it to terminate early:

```ts
const [worker] = createWorker({
  async wait(ms: number, signal?: AbortSignal): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(resolve, ms);
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(t);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  },
});
```

#### ⚠️ Functions must be self-contained

Worker functions are serialized via `Function.prototype.toString` and run in a separate thread. They have **no access to the surrounding scope** — closures over outer variables and `import` statements are silently unavailable at runtime.

```ts
// ❌ broken — `multiplier` is not in the worker's scope
const multiplier = 2;
const [w] = createWorker({
  double(n: number) {
    return n * multiplier;
  }, // ReferenceError at runtime
});

// ✅ correct — self-contained
const [w] = createWorker({
  double(n: number) {
    return n * 2;
  },
});
```

---

### `createWorkerPool`

Like `createWorker`, but distributes calls across `concurrency` workers using round-robin scheduling. The round-robin index is captured at method-access time, so storing a reference to a method and calling it later dispatches to the expected worker.

```ts
const [pool] = createWorkerPool(4, {
  add(a: number, b: number) {
    return a + b;
  },
});

// Calls are spread across 4 worker instances
const results = await Promise.all([pool.add(1, 2), pool.add(3, 4), pool.add(5, 6)]);
// [3, 7, 11]
```

**Returns:** `[proxy, start, stop]`

- `start` — spawns the worker pool. Called automatically on creation; subsequent calls while the pool is running are no-ops. After `stop()`, calling `start()` again respawns all workers.
- `stop` — terminates all workers and resets the pool.

**Signature:**

```ts
function createWorkerPool<T extends Record<string, Function>>(
  concurrency: number,
  fns: T,
  options?: WorkerOptions,
): CreateWorkerPoolResult<T>;
```

> The same self-contained function constraint from `createWorker` applies.

---

### `createWorkerQuery`

A reactive async query that re-runs whenever reactive inputs inside `fn` change. Built on Solid's async `createMemo`, so it integrates with `<Loading>` for suspense-aware rendering. Returns `undefined` until the first resolution (on the server, always `undefined`).

When inputs change before a previous call resolves, the previous call is **automatically aborted** if it returned a `CancellablePromise` — no stale results reach the accessor.

```ts
import { createWorker, createWorkerQuery } from "@solid-primitives/workers";
import { createSignal, Loading } from "solid-js";

const [worker] = createWorker({
  add([a, b]: [number, number]) {
    return a + b;
  },
});
const [input, setInput] = createSignal<[number, number]>([1, 1]);
const result = createWorkerQuery<number>(() => worker.add(input()));

// In JSX:
// <Loading fallback={<span>calculating…</span>}>
//   <span>{result()}</span>
// </Loading>

setInput([3, 4]); // aborts the previous call and dispatches a new one
```

**Returns:** `Accessor<T | undefined>`

Errors thrown by the worker promise propagate to the nearest `<Errored>` boundary. There is no inline error option — wrap with `<Errored>` to handle them.

---

### `createReactiveWorker` + `workerScope`

A full reactive bridge between the main thread and a **module worker** using Solid stores. Input changes on the main thread are automatically forwarded to the worker; output changes written inside the worker propagate back — all reactively.

#### Main thread

```ts
import { createReactiveWorker } from "@solid-primitives/workers";

const { inputs, setInputs, outputs, error } = createReactiveWorker(
  new URL("./my.worker.ts", import.meta.url),
  {
    inputs: { data: [] as number[], threshold: 0.5 },
    outputs: { result: 0 },
  },
);

// Write to inputs — changes are deep-tracked and forwarded to the worker
setInputs(s => {
  s.threshold = 0.8;
});

// Read outputs reactively (store proxy — no `()`)
createEffect(
  () => outputs.result,
  value => console.log("worker result:", value),
);

// Surface worker errors
createEffect(
  () => error(),
  ev => {
    if (ev) console.error("worker crashed:", ev.message);
  },
);
```

**Returns:** `{ inputs, setInputs, outputs, error }`

| Field       | Type                           | Description                                                         |
| ----------- | ------------------------------ | ------------------------------------------------------------------- |
| `inputs`    | `I` (store proxy)              | Read-only on main thread; mutate via `setInputs`                    |
| `setInputs` | `StoreSetter<I>`               | Draft-first store setter; changes deep-track and sync to the worker |
| `outputs`   | `Readonly<O>` (store proxy)    | Updated whenever the worker writes new values                       |
| `error`     | `Accessor<ErrorEvent \| null>` | Last unhandled worker error, or `null`                              |

> **Large data:** each input key change serializes the full value of that key. For large arrays or deeply nested objects, prefer `Transferable` objects (e.g. `ArrayBuffer`) or chunked updates to avoid serialization overhead.

#### Worker module (`my.worker.ts`)

Import from the `/worker` sub-entry so the bundle only includes worker-side code:

```ts
import { createEffect } from "solid-js";
import { workerScope } from "@solid-primitives/workers/worker";

workerScope<{ data: number[]; threshold: number }, { result: number }>(({ inputs, setOutputs }) => {
  createEffect(
    () => ({ data: inputs.data, threshold: inputs.threshold }),
    ({ data, threshold }) => {
      const filtered = data.filter(v => v > threshold);
      setOutputs(s => {
        s.result = filtered.length;
      });
    },
  );
});
```

The `setup` callback runs inside a `createRoot`, so all reactive primitives created there (`createEffect`, `createMemo`, etc.) are owned for the worker's lifetime.

> **Do not** use `await workerScope()` and then create reactive primitives after the await — they will have no reactive owner and produce `NO_OWNER_EFFECT` warnings. Always put reactive code inside the callback.

> **SSR:** `workerScope` must not be called on the server. Guard with `isServer` if your worker module is imported in an SSR context.

#### Worker TypeScript configuration

Add `"WebWorker"` to `lib` in the worker file's `tsconfig.json` so TypeScript recognises `self`, `postMessage`, etc.:

```json
{
  "compilerOptions": {
    "lib": ["ESNext", "WebWorker"]
  }
}
```

#### Bridge message protocol

| Direction     | Message type                        | Purpose                                                                |
| ------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| main → worker | `{ type: "init", inputs, outputs }` | Sent once on construction with initial store values                    |
| main → worker | `{ type: "input", key, value }`     | Sent whenever an input key changes (full key value, not a diff)        |
| worker → main | `{ type: "outputs", snapshot }`     | Sent whenever any output changes; carries a full plain-object snapshot |

---

## SSR behaviour

All primitives are SSR-safe. On the server (`isServer === true`):

| Primitive              | SSR stub                                                            |
| ---------------------- | ------------------------------------------------------------------- |
| `createWorker`         | Returns `[EventTarget, noop, noop, Set()]` — no worker spawned      |
| `createWorkerPool`     | Returns `[EventTarget, noop, noop]` — no workers spawned            |
| `createWorkerQuery`    | Returns `() => undefined`                                           |
| `createReactiveWorker` | Returns stores initialised from schema values + `error: () => null` |
| `workerScope`          | Safe to import; do not call on the server                           |

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Inspiration

Inspired by Jason Miller's worker function. Borrows the RPC and function-export approach.
