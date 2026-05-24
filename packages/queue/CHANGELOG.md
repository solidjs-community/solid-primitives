# @solid-primitives/queue

## 0.1.0

### Initial release

- `makeQueue<T>(initialValues?)` — non-reactive FIFO queue backed by a plain array
- `createQueue<T>(initialValues?)` — reactive FIFO queue backed by Solid signals; exposes `queue`, `first`, `last`, `size`, `isEmpty`, `add`, `remove`, `clear`
- `makePriorityQueue<T>(q, comparator)` — queue modifier; patches an existing queue's `add` method to maintain comparator-sorted order; returns the same queue
- `createPriorityQueue<T>(comparator, initialValues?)` — reactive priority queue; same interface as `createQueue`
- `createTaskQueue<T>()` — reactive async task queue; tasks execute one at a time in FIFO order; `enqueue(task)` returns a Promise for the task's result; exposes reactive `size` and `active`
- `createConcurrentTaskQueue<T>(concurrency)` — reactive async task queue running up to `concurrency` tasks simultaneously; `active` is a count (`Accessor<number>`)
