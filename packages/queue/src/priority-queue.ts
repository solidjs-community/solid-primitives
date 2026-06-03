import { createQueue, type ReactiveQueue } from "./queue.js";

type WithAddPush<T> = {
  add: (...items: T[]) => void;
  push: (comparator: (a: T, b: T) => number, ...items: T[]) => void;
};

/**
 * Turns any queue into a priority queue by overriding `add` to call
 * `push(comparator, ...)` so every insertion maintains sorted order.
 *
 * Pass pre-sorted initial values when creating the queue:
 * ```ts
 * const cmp = (a: number, b: number) => a - b;
 * const q = makePriorityQueue(makeQueue([3, 1, 2].sort(cmp)), cmp);
 * q.first; // 1
 * q.add(0);
 * q.first; // 0
 * ```
 */
export function makePriorityQueue<T, Q extends WithAddPush<T>>(
  q: Q,
  comparator: (a: T, b: T) => number,
): Q {
  q.add = (...items) => q.push(comparator, ...items);
  return q;
}

/**
 * Creates a reactive priority queue backed by Solid signals.
 *
 * All accessor properties (`queue`, `first`, `last`, `size`, `isEmpty`) are
 * reactive. Every `add` call maintains the order defined by `comparator`.
 * Call `flush()` in tests before reading reactive values.
 *
 * @param comparator - sort predicate (same contract as `Array.prototype.sort`)
 * @param initialValues - optional starting items (copied, not mutated)
 *
 * @example
 * ```ts
 * const { first, add, remove } = createPriorityQueue((a, b) => a - b, [3, 1, 2]);
 * first(); // 1
 * add(0);
 * flush();
 * first(); // 0
 * ```
 */
export function createPriorityQueue<T>(
  comparator: (a: T, b: T) => number,
  initialValues: T[] = [],
): ReactiveQueue<T> {
  return makePriorityQueue(createQueue([...initialValues].sort(comparator)), comparator);
}
