---
"@solid-primitives/queue": minor
---

Initial release of `@solid-primitives/queue`

Three new primitives for managing FIFO queues:

- **`makeQueue<T>(initialValues?)`** — non-reactive base primitive backed by a plain array. No Solid lifecycle hooks, suitable for imperative contexts.
- **`createQueue<T>(initialValues?)`** — reactive queue backed by Solid signals. Exposes reactive accessors (`queue`, `first`, `last`, `size`, `isEmpty`) and imperative methods (`add`, `remove`, `clear`).
- **`createTaskQueue<T>()`** — reactive async task queue. Tasks are zero-argument functions (`() => Promise<T> | T`) executed one at a time in FIFO order. `enqueue(task)` returns a `Promise<T>` that settles with the task's result. Exposes reactive `size` (pending count) and `active` (currently executing). Built for Solid.js v2.0 (`beta.14`).
