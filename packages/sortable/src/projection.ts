import { createProjection, type Refreshable, type Store } from "solid-js";
import { access, type MaybeAccessor } from "@solid-primitives/utils";
import { ascending, type Comparator } from "./comparators.ts";

/**
 * A store-shaped sorted view of `list`, reconciled by `key` so surviving items keep their store
 * identity across recomputes — Solid 2.0's `createProjection`'s keyed reconcile diffs the
 * previous and next sorted arrays and only touches the slots that actually changed, instead of
 * treating a reorder as "everything changed".
 *
 * Prefer this over {@link createSorted} when consumers read individual item fields through the
 * store proxy, or render with `<For each={projection} keyed={item => item[key]}>` — both get
 * move-not-recreate behavior for free from the store's own reconciliation, with no bespoke
 * tracking code in this package at all.
 *
 * @param key property name (or extractor) identifying an item across recomputes — same contract
 *   as `reconcile`'s `key` argument. Defaults to `"id"`.
 *
 * @example
 * const sortedUsers = createSortedProjection(users, by(u => u.name), "id");
 * <For each={sortedUsers} keyed={u => u.id}>{user => <Row user={user} />}</For>
 */
export function createSortedProjection<T extends object>(
  list: MaybeAccessor<T[]>,
  comparator?: MaybeAccessor<Comparator<T>>,
  key: string | ((item: T) => unknown) = "id",
): Refreshable<Store<T[]>> {
  return createProjection<T[]>(
    () => [...access(list)].sort(access(comparator) ?? ascending),
    [],
    { key },
  );
}
