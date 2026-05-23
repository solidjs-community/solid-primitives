import { createMemo, createSignal, type Accessor } from "solid-js";
import { INTERNAL_OPTIONS } from "@solid-primitives/utils";

export type Queue<T> = {
  readonly first: T | undefined;
  readonly last: T | undefined;
  readonly size: number;
  readonly isEmpty: boolean;
  add: (...items: T[]) => void;
  remove: () => T | undefined;
  clear: () => void;
};

export type ReactiveQueue<T> = {
  readonly queue: Accessor<T[]>;
  readonly first: Accessor<T | undefined>;
  readonly last: Accessor<T | undefined>;
  readonly size: Accessor<number>;
  readonly isEmpty: Accessor<boolean>;
  add: (...items: T[]) => void;
  remove: () => T | undefined;
  clear: () => void;
};

/**
 * A unit of async work submitted to a {@link ReactiveTaskQueue}.
 * May return a plain value or a Promise.
 */
export type Task<T> = () => Promise<T> | T;

export type ReactiveTaskQueue<T> = {
  /** Number of tasks waiting to start (does not count the task currently executing). */
  readonly size: Accessor<number>;
  /** `true` while a task is executing. */
  readonly active: Accessor<boolean>;
  /**
   * Adds a task to the back of the queue and returns a Promise that resolves
   * (or rejects) with that task's result.
   *
   * Tasks execute one at a time in the order they were enqueued.
   * Calling `enqueue` while a task is running will not start a second drain —
   * the new task is picked up automatically by the in-progress drain loop.
   */
  enqueue: (task: Task<T>) => Promise<T>;
  /**
   * Removes all waiting tasks from the queue and rejects their Promises.
   * The currently-executing task (if any) runs to completion unaffected.
   */
  clear: () => void;
};

/**
 * Creates a plain (non-reactive) FIFO queue.
 *
 * No Solid lifecycle hooks are used, so cleanup is not automatic.
 * Useful for non-reactive contexts or as the base of a larger primitive.
 *
 * @param initialValues - optional starting items (copied, not mutated)
 * @returns a {@link Queue} object with imperative add/remove/clear methods and
 * synchronous getter properties
 */
export function makeQueue<T>(initialValues: T[] = []): Queue<T> {
  const items = [...initialValues];

  return {
    get first() {
      return items[0];
    },
    get last() {
      return items[items.length - 1];
    },
    get size() {
      return items.length;
    },
    get isEmpty() {
      return items.length === 0;
    },
    add(...newItems: T[]) {
      items.push(...newItems);
    },
    remove() {
      return items.shift();
    },
    clear() {
      items.length = 0;
    },
  };
}

/**
 * Creates a reactive FIFO queue backed by Solid signals.
 *
 * All accessor properties (`queue`, `first`, `last`, `size`, `isEmpty`) are
 * reactive — reading them inside a tracking scope establishes a dependency.
 * Mutations (`add`, `remove`, `clear`) are batched and applied on the next
 * microtask flush; call `flush()` in tests to observe values synchronously.
 *
 * @param initialValues - optional starting items (copied, not mutated)
 * @returns a {@link ReactiveQueue} object
 *
 * @example
 * ```ts
 * const { queue, first, size, isEmpty, add, remove, clear } = createQueue([1, 2, 3]);
 *
 * size();   // 3
 * first();  // 1
 *
 * add(4, 5);
 * remove(); // 1 — removed synchronously; reactive accessors update after flush
 * ```
 */
export function createQueue<T>(initialValues: T[] = []): ReactiveQueue<T> {
  const [items, setItems] = createSignal<T[]>([...initialValues], INTERNAL_OPTIONS);

  const first = createMemo(() => items()[0]);
  const last = createMemo(() => {
    const arr = items();
    return arr[arr.length - 1];
  });
  const size = createMemo(() => items().length);
  const isEmpty = createMemo(() => items().length === 0);

  return {
    queue: items,
    first,
    last,
    size,
    isEmpty,
    add(...newItems: T[]) {
      setItems(prev => [...prev, ...newItems]);
    },
    remove() {
      let removed: T | undefined;
      setItems(prev => {
        if (prev.length === 0) return prev;
        removed = prev[0]!;
        return prev.slice(1);
      });
      return removed;
    },
    clear() {
      setItems([]);
    },
  };
}

type TaskEntry<T> = {
  fn: Task<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

/**
 * Creates a reactive task queue that executes async tasks one at a time in
 * FIFO order using Solid's `action` primitive.
 *
 * Each task is a zero-argument function returning a value or Promise. Tasks
 * are drained sequentially: the next task starts only after the current one
 * resolves or rejects. Signal writes within the drain loop are batched
 * atomically per task step.
 *
 * `size` counts tasks *waiting* (not including the one currently executing).
 * `active` is `true` while any task is running.
 *
 * @example
 * ```ts
 * const { enqueue, size, active } = createTaskQueue<User>();
 *
 * const user = await enqueue(() => fetchUser(id));
 *
 * // Enqueue several — they run serially, not concurrently
 * const [a, b] = await Promise.all([
 *   enqueue(() => fetchUser(1)),
 *   enqueue(() => fetchUser(2)),
 * ]);
 * ```
 */
export function createTaskQueue<T>(): ReactiveTaskQueue<T> {
  // Plain array for synchronous access inside the drain loop — avoids the need
  // to read a signal and deal with batching when deciding what to execute next.
  const tasks: TaskEntry<T>[] = [];
  const [size, setSize] = createSignal(0, INTERNAL_OPTIONS);
  const [isActive, setIsActive] = createSignal(false, INTERNAL_OPTIONS);
  let draining = false;

  // Runs tasks one at a time. A plain async function (not Solid's `action`)
  // so signal writes are committed on the normal microtask schedule and are
  // immediately visible via `flush()` in tests — the `action` transition system
  // would hold all writes until each yield resolves, making live state unobservable.
  const drain = async (): Promise<void> => {
    while (tasks.length > 0) {
      const entry = tasks.shift()!;
      setSize(tasks.length);
      try {
        entry.resolve((await entry.fn()) as T);
      } catch (err) {
        entry.reject(err);
      }
    }
    setIsActive(false);
    draining = false;
  };

  return {
    size,
    active: isActive,
    enqueue(task) {
      return new Promise<T>((resolve, reject) => {
        tasks.push({ fn: task, resolve, reject });
        setSize(tasks.length);
        if (!draining) {
          draining = true;
          setIsActive(true);
          drain();
        }
      });
    },
    clear() {
      const removed = tasks.splice(0);
      setSize(0);
      for (const entry of removed) {
        entry.reject(new Error("Queue cleared"));
      }
    },
  };
}
