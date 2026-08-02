import { ascending, by, type Comparator } from "./comparators.ts";

/**
 * Binary search for the leftmost index at which `value` could be inserted into `list` while
 * keeping it sorted per `comparator`. `list` is assumed to already be sorted by that comparator —
 * behavior is undefined otherwise.
 */
export function sortedIndex<T>(list: readonly T[], value: T, comparator: Comparator<T> = ascending): number {
  let low = 0;
  let high = list.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (comparator(list[mid]!, value) < 0) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** Like {@link sortedIndex}, but comparing by a derived key instead of the items themselves. */
export function sortedIndexBy<T, K>(
  list: readonly T[],
  value: T,
  accessor: (item: T) => K,
  comparator: Comparator<K> = ascending,
): number {
  return sortedIndex(list, value, by(accessor, comparator));
}

/**
 * Immutably inserts `value` into an already-sorted `list` at the position `comparator` dictates —
 * an O(log n) search plus an O(n) copy, versus an O(n log n) full re-sort for a single insertion.
 */
export function insertSorted<T>(list: readonly T[], value: T, comparator: Comparator<T> = ascending): T[] {
  const index = sortedIndex(list, value, comparator);
  const result = list.slice();
  result.splice(index, 0, value);
  return result;
}
