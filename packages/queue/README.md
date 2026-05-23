<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=queue" alt="Solid Primitives queue">
</p>

# @solid-primitives/queue

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/queue?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/queue)
[![version](https://img.shields.io/npm/v/@solid-primitives/queue?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/queue)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

FIFO (first-in, first-out) queue primitives for Solid.js.

- **`makeQueue`** — non-reactive base primitive backed by a plain array. No Solid lifecycle hooks; suitable for non-reactive contexts or when you need a self-contained imperative queue.
- **`createQueue`** — reactive queue backed by Solid signals. All accessor properties (`queue`, `first`, `last`, `size`, `isEmpty`) track reactively so any derived computation or JSX expression that reads them updates automatically.
- **`createTaskQueue`** — reactive queue of async tasks. Tasks are zero-argument functions that return a value or Promise; they execute one at a time in FIFO order. Each `enqueue` call returns a Promise that resolves with its task's result.

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
  remove: () => T | undefined;
  clear: () => void;
};

function createQueue<T>(initialValues?: T[]): ReactiveQueue<T>;
```

### Notes

- `remove()` returns the dequeued item **synchronously**, even though the reactive signal update is batched.
- Initial values are **copied** — the source array is never mutated.
- Calling `add` or `remove` inside a Solid reactive computation (memo, effect compute phase) will throw in development. Call mutations from event handlers or effect **apply** phases.

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

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
