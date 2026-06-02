---
"@solid-primitives/queue": minor
---

Initial release of `@solid-primitives/queue`

Six primitives for managing queues:

- **`makeQueue<T>(initialValues?)`** — non-reactive FIFO queue backed by a plain array.
- **`createQueue<T>(initialValues?)`** — reactive FIFO queue backed by Solid signals. Exposes reactive accessors (`queue`, `first`, `last`, `size`, `isEmpty`) and imperative methods (`add`, `remove`, `clear`).
- **`makePriorityQueue<T, Q>(q, comparator)`** — queue modifier that turns any existing queue into a priority queue by overriding its `add` method to maintain comparator-sorted order. Returns the same queue object with `add` patched in place.
- **`createPriorityQueue<T>(comparator, initialValues?)`** — reactive priority queue; same interface as `createQueue`.
- **`createTaskQueue<T>()`** — reactive async task queue. Tasks execute one at a time in FIFO order. `enqueue(task)` returns a `Promise<T>`. Exposes reactive `size` (pending count) and `active` (`boolean`).
- **`createConcurrentTaskQueue<T>(concurrency)`** — reactive async task queue running up to `concurrency` tasks simultaneously. `active` is a count (`Accessor<number>`).
