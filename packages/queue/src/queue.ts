import { createMemo, createSignal, type Accessor } from "solid-js";
import { INTERNAL_OPTIONS } from "@solid-primitives/utils";

export type Queue<T> = {
  readonly first: T | undefined;
  readonly last: T | undefined;
  readonly size: number;
  readonly isEmpty: boolean;
  /** Appends items to the back in insertion (FIFO) order. */
  add: (...items: T[]) => void;
  /** Inserts items maintaining the order defined by `comparator`. */
  push: (comparator: (a: T, b: T) => number, ...items: T[]) => void;
  remove: () => T | undefined;
  clear: () => void;
};

export type ReactiveQueue<T> = {
  readonly queue: Accessor<T[]>;
  readonly first: Accessor<T | undefined>;
  readonly last: Accessor<T | undefined>;
  readonly size: Accessor<number>;
  readonly isEmpty: Accessor<boolean>;
  /** Appends items to the back in insertion (FIFO) order. */
  add: (...items: T[]) => void;
  /** Inserts items maintaining the order defined by `comparator`. */
  push: (comparator: (a: T, b: T) => number, ...items: T[]) => void;
  remove: () => T | undefined;
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
    push(comparator: (a: T, b: T) => number, ...newItems: T[]) {
      items.push(...newItems);
      items.sort(comparator);
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
    push(comparator: (a: T, b: T) => number, ...newItems: T[]) {
      setItems(prev => [...prev, ...newItems].sort(comparator));
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
