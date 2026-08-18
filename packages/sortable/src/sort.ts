import { type Accessor, createMemo } from "solid-js";
import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { sort as reactiveSort } from "@solid-primitives/signal-builders";
import { ascending, type Comparator } from "./comparators.ts";

/** Non-reactive: returns a new sorted copy of `list`, leaving the original untouched. */
export function makeSorted<T>(list: T[], comparator: Comparator<T> = ascending): T[] {
  return list.slice().sort(comparator);
}

export type CreateSortedOptions = {
  /**
   * Sort `list`'s current value in place and return that same array reference, instead of
   * allocating a new sorted copy on every recompute. Only meaningful when `list` is a mutable
   * array you own (e.g. paired with a signal set via `setList(list => (list.sort(cmp), list))`) —
   * mirrors VueUse's `useSorted`'s `dirty` option under Solid's signal model.
   * @default false
   */
  dirty?: boolean;
};

/**
 * Reactively sorts `list`, re-sorting whenever `list` or `comparator` changes. `comparator` may
 * itself be reactive (an accessor), so toggling sort direction/column doesn't require rebuilding
 * the primitive.
 *
 * The default (`dirty: false`) path delegates directly to `@solid-primitives/signal-builders`'s
 * `sort()` when the comparator is static, returning a new array each recompute. Pass
 * `{ dirty: true }` to sort in place and reuse the same array reference instead.
 *
 * @example
 * const [column, setColumn] = createSignal<"name" | "price">("name");
 * const comparator = createMemo(() => by(item => item[column()]));
 * const sorted = createSorted(items, comparator);
 */
export function createSorted<T>(
  list: MaybeAccessor<T[]>,
  comparator?: MaybeAccessor<Comparator<T>>,
  options?: CreateSortedOptions,
): Accessor<T[]> {
  if (options?.dirty) {
    return createMemo(() => {
      const arr = access(list);
      arr.sort(access(comparator) ?? ascending);
      return arr;
    });
  }

  // `access()` only invokes zero-arg functions — a real comparator has arity 2, so this branch
  // correctly treats it (and `undefined`) as static, delegating to signal-builders' `sort`.
  if (comparator === undefined || (typeof comparator === "function" && comparator.length !== 0)) {
    return reactiveSort(list, (comparator as Comparator<T> | undefined) ?? ascending);
  }

  // reactive comparator (a zero-arg accessor) — signal-builders' `sort` doesn't track this, so
  // read it ourselves inside the memo.
  return createMemo(() => access(list).slice().sort(access(comparator) ?? ascending));
}
