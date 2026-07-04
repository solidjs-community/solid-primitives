# @solid-primitives/queue

## 1.0.0-next.0

### Major Changes

- e4c9991: Initial release of `@solid-primitives/queue`

  Six primitives for managing queues:

  - **`makeQueue<T>(initialValues?)`** — non-reactive FIFO queue backed by a plain array.
  - **`createQueue<T>(initialValues?)`** — reactive FIFO queue backed by Solid signals. Exposes reactive accessors (`queue`, `first`, `last`, `size`, `isEmpty`) and imperative methods (`add`, `remove`, `clear`).
  - **`makePriorityQueue<T, Q>(q, comparator)`** — queue modifier that turns any existing queue into a priority queue by overriding its `add` method to maintain comparator-sorted order. Returns the same queue object with `add` patched in place.
  - **`createPriorityQueue<T>(comparator, initialValues?)`** — reactive priority queue; same interface as `createQueue`.
  - **`createTaskQueue<T>()`** — reactive async task queue. Tasks execute one at a time in FIFO order. `enqueue(task)` returns a `Promise<T>`. Exposes reactive `size` (pending count) and `active` (`boolean`).
  - **`createConcurrentTaskQueue<T>(concurrency)`** — reactive async task queue running up to `concurrency` tasks simultaneously. `active` is a count (`Accessor<number>`).

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.1.0

### Initial release

- `makeQueue<T>(initialValues?)` — non-reactive FIFO queue backed by a plain array
- `createQueue<T>(initialValues?)` — reactive FIFO queue backed by Solid signals; exposes `queue`, `first`, `last`, `size`, `isEmpty`, `add`, `remove`, `clear`
- `makePriorityQueue<T>(q, comparator)` — queue modifier; patches an existing queue's `add` method to maintain comparator-sorted order; returns the same queue
- `createPriorityQueue<T>(comparator, initialValues?)` — reactive priority queue; same interface as `createQueue`
- `createTaskQueue<T>()` — reactive async task queue; tasks execute one at a time in FIFO order; `enqueue(task)` returns a Promise for the task's result; exposes reactive `size` and `active`
- `createConcurrentTaskQueue<T>(concurrency)` — reactive async task queue running up to `concurrency` tasks simultaneously; `active` is a count (`Accessor<number>`)
