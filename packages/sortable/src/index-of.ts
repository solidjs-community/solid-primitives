import { type Accessor, mapArray, untrack } from "solid-js";
import { type MaybeAccessor } from "@solid-primitives/utils";
import { createSorted } from "./sort.ts";
import type { Comparator } from "./comparators.ts";

/**
 * Tracks each item's index within the sorted view of `list`, without invalidating every
 * consumer on every reorder.
 *
 * `mapArray` (the same primitive that powers `<For>`) keys by reference identity and reuses the
 * same computation — and its `index` signal — for an item across recomputes, so an item's index
 * accessor only updates when *that item's* position actually changes; unrelated moves elsewhere
 * in the list never notify it. This is Solid core's own keyed-diff algorithm, not a bespoke one.
 *
 * @returns a function that, given an item, returns a reactive accessor for its current index
 *   (`-1` if the item isn't present). Each call does an O(n) scan (untracked) to find the item's
 *   stable per-item accessor — cheap relative to the granular reactivity it buys you.
 *
 * @example
 * const indexOf = createSortedIndex(rows, by(r => r.name));
 * const rank = indexOf(row); // only updates when `row`'s own position changes
 */
export function createSortedIndex<T>(
  list: MaybeAccessor<T[]>,
  comparator?: MaybeAccessor<Comparator<T>>,
): (item: T) => Accessor<number> {
  const sorted = createSorted(list, comparator);
  const entries = mapArray(sorted, (value, index) => [value, index] as const);

  return item => () => {
    const pair = untrack(entries).find(([value]) => value === item);
    return pair ? pair[1]() : -1;
  };
}
