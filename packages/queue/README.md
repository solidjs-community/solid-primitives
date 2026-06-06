<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=queue" alt="Solid Primitives queue">
</p>

# @solid-primitives/queue

[![docs](https://img.shields.io/badge/-docs%20%26%20demos-blue?style=for-the-badge)](https://primitives.solidjs.community/package/queue)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/queue?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/queue)
[![version](https://img.shields.io/npm/v/@solid-primitives/queue?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/queue)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Queue primitives for Solid.js.

- **`makeQueue`** — non-reactive FIFO queue backed by a plain array. No Solid lifecycle hooks; suitable for non-reactive contexts.
- **`createQueue`** — reactive FIFO queue backed by Solid signals. All accessor properties (`queue`, `first`, `last`, `size`, `isEmpty`) track reactively.
- **`makePriorityQueue`** — non-reactive priority queue. Items are dequeued by comparator order rather than insertion order.
- **`createPriorityQueue`** — reactive priority queue backed by Solid signals.
- **`createTaskQueue`** — reactive queue of async tasks that execute one at a time in FIFO order. Each `enqueue` call returns a Promise.
- **`createConcurrentTaskQueue`** — like `createTaskQueue` but runs up to `concurrency` tasks simultaneously.

## Installation

```bash
npm install @solid-primitives/queue
# or
yarn add @solid-primitives/queue
# or
pnpm add @solid-primitives/queue
```

## `makeQueue`

Creates a plain, non-reactive FIFO queue.

```ts
import { makeQueue } from "@solid-primitives/queue";

const q = makeQueue([1, 2, 3]);

q.first; // 1
q.last; // 3
q.size; // 3
q.isEmpty; // false

q.add(4, 5);
q.remove(); // 1
q.first; // 2

q.clear();
q.isEmpty; // true
```

### Type

```ts
type Queue<T> = {
  readonly first: T | undefined;
  readonly last: T | undefined;
  readonly size: number;
  readonly isEmpty: boolean;
  add: (...items: T[]) => void;
  push: (comparator: (a: T, b: T) => number, ...items: T[]) => void;
  remove: () => T | undefined;
  clear: () => void;
};

function makeQueue<T>(initialValues?: T[]): Queue<T>;
```

## `createQueue`

Creates a reactive FIFO queue. All accessor properties establish reactive dependencies when read inside a tracking scope (JSX, `createMemo`, `createEffect`, etc.).

Mutations (`add`, `remove`, `clear`) are batched by Solid's scheduler and applied on the next microtask. In tests, call `flush()` after mutations before reading reactive values.

```ts
import { createQueue } from "@solid-primitives/queue";

const { queue, first, last, size, isEmpty, add, remove, clear } = createQueue(["a", "b", "c"]);

// Read reactive state
size();    // 3
first();   // "a"
isEmpty(); // false

// Mutate
add("d", "e");
remove(); // "a" — returned synchronously

// In JSX — updates automatically
<For each={queue()}>{item => <li>{item}</li>}</For>
<p>Next: {first()}</p>
<p>Remaining: {size()}</p>
```

### Type

```ts
type ReactiveQueue<T> = {
  readonly queue: Accessor<T[]>;
  readonly first: Accessor<T | undefined>;
  readonly last: Accessor<T | undefined>;
  readonly size: Accessor<number>;
  readonly isEmpty: Accessor<boolean>;
  add: (...items: T[]) => void;
  push: (comparator: (a: T, b: T) => number, ...items: T[]) => void;
  remove: () => T | undefined;
  clear: () => void;
};

function createQueue<T>(initialValues?: T[]): ReactiveQueue<T>;
```

### Notes

- `remove()` returns the dequeued item **synchronously**, even though the reactive signal update is batched.
- Initial values are **copied** — the source array is never mutated.
- Calling `add` or `remove` inside a Solid reactive computation (memo, effect compute phase) will throw in development. Call mutations from event handlers or effect **apply** phases.

## `makePriorityQueue`

Modifies an existing queue in place so that every `add` call maintains comparator-sorted order. Returns the same queue object with its `add` method patched; `remove()` always returns the highest-priority item (smallest by the comparator).

```ts
import { makeQueue, makePriorityQueue } from "@solid-primitives/queue";

const cmp = (a: number, b: number) => a - b;
const q = makePriorityQueue(makeQueue([3, 1, 2].sort(cmp)), cmp);

q.first;    // 1
q.last;     // 3
q.remove(); // 1
q.first;    // 2

q.add(0);
q.first;    // 0
```

### Type

```ts
function makePriorityQueue<T, Q extends Queue<T>>(
  q: Q,
  comparator: (a: T, b: T) => number,
): Q;
```

## `createPriorityQueue`

Creates a reactive priority queue. All accessor properties establish reactive dependencies. Mutations are batched; call `flush()` in tests before reading reactive values.

```ts
import { createPriorityQueue } from "@solid-primitives/queue";

const { queue, first, size, add, remove } = createPriorityQueue(
  (a, b) => a.priority - b.priority,
  initialItems,
);

first(); // highest-priority item

add({ priority: 0, label: "urgent" });
// In JSX
<For each={queue()}>{item => <Task item={item} />}</For>
```

### Type

```ts
function createPriorityQueue<T>(
  comparator: (a: T, b: T) => number,
  initialValues?: T[],
): ReactiveQueue<T>;
```

### Notes

- `remove()` returns the dequeued item **synchronously**, even though the reactive signal update is batched.
- Initial values are **copied** — the source array is never mutated.
- `queue()` returns items in priority order (lowest comparator value first).

## `createTaskQueue`

Creates a reactive queue that runs async tasks one at a time in FIFO order.

Each task is a zero-argument function returning a plain value or a Promise. Tasks execute sequentially: the next task starts only after the current one resolves or rejects. `enqueue` returns a `Promise<T>` that settles with the task's result.

`size` counts tasks **waiting** (not including the one currently executing).
`active` is `true` while any task is running.

```ts
import { createTaskQueue } from "@solid-primitives/queue";

const { enqueue, size, active } = createTaskQueue<User>();

// Each call runs after the previous one finishes
const [alice, bob] = await Promise.all([
  enqueue(() => fetchUser("alice")),
  enqueue(() => fetchUser("bob")),
]);

// In JSX
<Show when={active()}>
  <p>Processing… ({size()} remaining)</p>
</Show>
```

### Type

```ts
type Task<T> = () => Promise<T> | T;

type ReactiveTaskQueue<T> = {
  /** Number of tasks waiting to start (excludes the task currently executing). */
  readonly size: Accessor<number>;
  /** `true` while a task is executing. */
  readonly active: Accessor<boolean>;
  /** Adds a task to the back of the queue; resolves/rejects with its result. */
  enqueue: (task: Task<T>) => Promise<T>;
  /**
   * Removes all waiting tasks and rejects their Promises with `"Queue cleared"`.
   * The currently-executing task (if any) runs to completion unaffected.
   */
  clear: () => void;
};

function createTaskQueue<T>(): ReactiveTaskQueue<T>;
```

### Notes

- Tasks added while the queue is draining are picked up automatically — `enqueue` never restarts the drain.
- `clear()` does **not** cancel the active task; only unstarted tasks are rejected.
- All tasks share the same return type `T`. For heterogeneous task types use `createTaskQueue<unknown>()`.

## `createConcurrentTaskQueue`

Creates a reactive task queue that runs up to `concurrency` tasks at a time. Tasks beyond the limit wait until a slot opens.

`size` counts tasks **waiting** (not including those executing).
`active` is the **number** of tasks currently executing (0 when idle).

```ts
import { createConcurrentTaskQueue } from "@solid-primitives/queue";

const { enqueue, active, size } = createConcurrentTaskQueue<Response>(3);

// Up to 3 fetches run at once; the rest wait
urls.forEach(url => enqueue(() => fetch(url)));

// In JSX
<Show when={active() > 0}>
  <p>Fetching… ({active()} active, {size()} waiting)</p>
</Show>
```

### Type

```ts
type ReactiveConcurrentTaskQueue<T> = {
  /** Number of tasks waiting to start (excludes tasks currently executing). */
  readonly size: Accessor<number>;
  /** Number of tasks currently executing (0 when idle). */
  readonly active: Accessor<number>;
  enqueue: (task: Task<T>) => Promise<T>;
  clear: () => void;
};

function createConcurrentTaskQueue<T>(concurrency: number): ReactiveConcurrentTaskQueue<T>;
```

### Notes

- `active` is a **count** (`Accessor<number>`), unlike `createTaskQueue` where it is a boolean.
- `clear()` rejects all **waiting** tasks; tasks currently executing run to completion.
- For heterogeneous task types use `createConcurrentTaskQueue<unknown>()`.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
