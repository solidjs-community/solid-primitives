import { createSignal, type Accessor } from "solid-js";
import { INTERNAL_OPTIONS } from "@solid-primitives/utils";

/**
 * A unit of async work submitted to a task queue.
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

export type ReactiveConcurrentTaskQueue<T> = {
  /** Number of tasks waiting to start (excludes tasks currently executing). */
  readonly size: Accessor<number>;
  /** Number of tasks currently executing (0 when idle). */
  readonly active: Accessor<number>;
  /**
   * Adds a task to the back of the queue; resolves/rejects with its result.
   * Up to `concurrency` tasks run simultaneously; additional tasks wait until
   * a running slot opens.
   */
  enqueue: (task: Task<T>) => Promise<T>;
  /**
   * Removes all waiting tasks and rejects their Promises with `"Queue cleared"`.
   * Tasks currently executing run to completion unaffected.
   */
  clear: () => void;
};

type TaskEntry<T> = {
  fn: Task<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

/**
 * Creates a reactive task queue that executes async tasks one at a time in
 * FIFO order.
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

/**
 * Creates a reactive task queue that executes up to `concurrency` tasks at a
 * time. Tasks beyond the limit queue and start as slots open.
 *
 * `size` counts tasks *waiting* (not including those executing).
 * `active` is the number of tasks currently executing (0 when idle).
 *
 * @param concurrency - maximum number of tasks to run simultaneously
 *
 * @example
 * ```ts
 * const { enqueue, active, size } = createConcurrentTaskQueue<Response>(3);
 *
 * urls.forEach(url => enqueue(() => fetch(url)));
 *
 * // In JSX
 * <Show when={active() > 0}>Fetching ({active()} active, {size()} waiting)</Show>
 * ```
 */
export function createConcurrentTaskQueue<T>(concurrency: number): ReactiveConcurrentTaskQueue<T> {
  const pending: TaskEntry<T>[] = [];
  const [size, setSize] = createSignal(0, INTERNAL_OPTIONS);
  const [activeCount, setActiveCount] = createSignal(0, INTERNAL_OPTIONS);
  let running = 0;

  const runNext = () => {
    while (running < concurrency && pending.length > 0) {
      const entry = pending.shift()!;
      running++;
      setSize(pending.length);
      setActiveCount(running);

      (async () => {
        try {
          entry.resolve((await entry.fn()) as T);
        } catch (err) {
          entry.reject(err);
        } finally {
          running--;
          setActiveCount(running);
          runNext();
        }
      })();
    }
  };

  return {
    size,
    active: activeCount,
    enqueue(task) {
      return new Promise<T>((resolve, reject) => {
        pending.push({ fn: task, resolve, reject });
        setSize(pending.length);
        runNext();
      });
    },
    clear() {
      const removed = pending.splice(0);
      setSize(0);
      for (const entry of removed) {
        entry.reject(new Error("Queue cleared"));
      }
    },
  };
}
