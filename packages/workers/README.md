<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Workers" alt="Solid Primitives Workers">
</p>

# @solid-primitives/workers

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/workers?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/workers)
[![size](https://img.shields.io/npm/v/@solid-primitives/workers?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/workers)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A set of primitives for working with Web Workers:

- `createWorker` — Spawns a worker from inline functions and exposes them as async RPC methods.
- `createWorkerPool` — Like `createWorker` but round-robins calls across a fixed pool of workers.
- `createWorkerQuery` — Reactive async query backed by a worker call; integrates with `<Loading>`.
- `createReactiveWorker` — Full reactive bridge between the main thread and a worker using Solid stores.
- `workerScope` — Worker-side companion to `createReactiveWorker`; provides a reactive `inputs` store and an `setOutputs` setter inside the worker.

## Installation

```bash
npm install @solid-primitives/workers
# or
pnpm add @solid-primitives/workers
```

## How to use it

### `createWorker`

Spawn a worker from one or more inline functions. Each function becomes an async RPC method on the returned worker object. The worker is automatically terminated when the reactive owner is disposed.

```ts
const [worker, start, stop, exports] = createWorker(
  function add(a: number, b: number) { return a + b; },
  function multiply(a: number, b: number) { return a * b; },
);

console.log(await (worker as any).add(1, 2));      // 3
console.log(await (worker as any).multiply(3, 4)); // 12
```

**Returns:** `[worker, start, stop, exports]`

- `worker` — the underlying `Worker` instance with callable proxy methods attached
- `start` — re-attach the message listener (called automatically on creation)
- `stop` — send a kill signal and terminate the worker
- `exports` — a `Set<string>` of the exported function names

### `createWorkerPool`

Like `createWorker`, but distributes calls across `concurrency` workers using round-robin scheduling.

```ts
const [pool, start, stop] = createWorkerPool(4,
  function add(a: number, b: number) { return a + b; },
);

// Calls are spread across 4 worker instances
const results = await Promise.all([
  (pool as any).add(1, 2),
  (pool as any).add(3, 4),
  (pool as any).add(5, 6),
]);
// [3, 7, 11]
```

**Returns:** `[proxy, start, stop]`

### `createWorkerQuery`

A reactive async query that re-runs whenever reactive inputs inside `fn` change. Built on Solid's async `createMemo`, so it integrates with `<Loading>` for suspense-aware rendering.

```ts
import { createWorkerQuery } from "@solid-primitives/workers";
import { createSignal } from "solid-js";
import { Loading } from "solid-js";

const [worker] = createWorker(function add([a, b]: [number, number]) { return a + b; });

const [input, setInput] = createSignal<[number, number]>([1, 1]);
const result = createWorkerQuery<number>(() => (worker as any).add(input()));

// In JSX:
// <Loading fallback={<span>calculating…</span>}>
//   <span>{result()}</span>
// </Loading>

setInput([3, 4]); // triggers a new worker call, result() updates when resolved
```

**Returns:** `Accessor<T>` — a reactive accessor that holds the latest resolved value.

### `createReactiveWorker` + `workerScope`

A full reactive bridge between the main thread and a module worker using Solid stores. Input changes on the main thread are automatically forwarded to the worker; output changes written inside the worker propagate back to the main thread — all reactively.

#### Main thread (`my-component.tsx`)

```ts
import { createReactiveWorker } from "@solid-primitives/workers";

const { inputs, setInputs, outputs } = createReactiveWorker(
  new URL("./my.worker.ts", import.meta.url),
  {
    inputs:  { data: [] as number[], threshold: 0.5 },
    outputs: { result: 0 },
  },
);

// Write to inputs — changes are automatically forwarded to the worker
setInputs(s => { s.threshold = 0.8; });

// Read outputs reactively (no `()` — store proxy)
createEffect(
  () => outputs.result,
  value => console.log("worker result:", value),
);
```

**Returns:** `{ inputs, setInputs, outputs }`

- `inputs` — reactive store proxy (read-only; mutate via `setInputs`)
- `setInputs` — draft-first store setter; changes deep-track and sync to the worker
- `outputs` — reactive store proxy updated whenever the worker writes new values

#### Worker module (`my.worker.ts`)

```ts
import { createEffect } from "solid-js";
import { workerScope } from "@solid-primitives/workers/worker";

workerScope<
  { data: number[]; threshold: number },
  { result: number }
>(({ inputs, setOutputs }) => {
  createEffect(
    () => ({ data: inputs.data, threshold: inputs.threshold }),
    ({ data, threshold }) => {
      const filtered = data.filter(v => v > threshold);
      setOutputs(s => { s.result = filtered.length; });
    },
  );
});
```

`workerScope` returns a `Promise<WorkerScopeResult>` that resolves after the `init` message arrives from the main thread. The `setup` callback runs inside a `createRoot`, so effects and memos created there are owned for the lifetime of the worker.

#### Bridge message protocol

Internally, `createReactiveWorker` and `workerScope` communicate over a typed message protocol:

| Direction | Message type | Purpose |
|-----------|-------------|---------|
| main → worker | `{ type: "init", inputs, outputs }` | Sent once on construction with initial store values |
| main → worker | `{ type: "input", key, value }` | Sent whenever an input key changes |
| worker → main | `{ type: "outputs", snapshot }` | Sent whenever any output changes; carries a plain serializable snapshot |

#### SSR behaviour

All primitives are SSR-safe. On the server:

- `createWorker` / `createWorkerPool` return stub tuples backed by a plain `EventTarget`.
- `createWorkerQuery` returns an accessor that always yields `undefined`.
- `createReactiveWorker` returns store proxies initialised from the schema values (no worker is spawned).
- `workerScope` is a no-op (importing it does not throw).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Inspiration

Inspired by Jason Miller's worker function. Borrows the RPC and function export method.
