import {
  access,
  accessArray,
  AnyClass,
  ItemsOf,
  MaybeAccessor,
  MaybeAccessorValue,
  ofClass
} from "@solid-primitives/utils";
import * as _ from "@solid-primitives/immutable";
import { Accessor, createMemo } from "solid-js";
import type { MappingFn, Predicate, FlattenArray } from "@solid-primitives/immutable";

/**
 * signal-builder `Array.prototype.push()`
 */
export const push = <
  A extends MaybeAccessor<any[]>,
  V extends ItemsOf<MaybeAccessorValue<A>>,
  T extends MaybeAccessor<V>[]
>(
  list: A,
  ...items: T
): Accessor<(V | MaybeAccessorValue<ItemsOf<T>>)[]> =>
  createMemo(() => _.push(access(list), ...accessArray(items)));

/**
 * signal-builder that drops n items from the array start.
 */
export const drop = <T extends any[]>(list: MaybeAccessor<T>, n?: number): Accessor<T> =>
  createMemo(() => _.drop(access(list), n) as T);

/**
 * signal-builder that drops n items from the end of the array.
 */
export const dropRight = <T extends any[]>(list: MaybeAccessor<T>, n?: number): Accessor<T> =>
  createMemo(() => _.dropRight(access(list), n) as T);

/**
 *  signal-builder `Array.prototype.filter()`
 */
export const filter = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  predicate: Predicate<V>
): Accessor<V[]> => createMemo(() => _.filter(access(list), predicate));

/**
 * signal-builder `Array.prototype.filter()` that filters out passed item
 */
export const filterOut = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  item: MaybeAccessor<V>
): Accessor<V[]> => createMemo(() => _.filterOut(access(list), access(item)));

/**
 * signal-builder `Array.prototype.sort()`
 */
export const sort = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  compareFn?: (a: V, b: V) => number
): Accessor<V[]> => createMemo(() => _.sort(access(list), compareFn));

/**
 * signal-builder `Array.prototype.map()`
 */
export const map = <A extends MaybeAccessor<any[]>, T>(
  list: A,
  mapFn: MappingFn<ItemsOf<MaybeAccessorValue<A>>, T>
): Accessor<T[]> => createMemo(() => _.map(access(list), mapFn));

/**
 * signal-builder `Array.prototype.slice()`
 */
export const slice = <T extends any[]>(
  list: MaybeAccessor<T>,
  start?: number,
  end?: number
): Accessor<T> => createMemo(() => _.slice(access(list), start, end) as T);

/**
 * signal-builder `Array.prototype.splice()`
 */
export const splice = <
  A extends MaybeAccessor<any[]>,
  V extends ItemsOf<MaybeAccessorValue<A>>,
  T extends MaybeAccessor<V>[]
>(
  list: A,
  start: MaybeAccessor<number>,
  deleteCount?: MaybeAccessor<number>,
  ...items: T
): Accessor<(V | MaybeAccessorValue<ItemsOf<T>>)[]> =>
  createMemo(() =>
    _.splice(access(list), access(start), access(deleteCount), ...accessArray(items))
  );

/**
 * signal-builder removing passed item from an array (first one from the start)
 */
export const remove = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  item: MaybeAccessor<V>
): Accessor<V[]> => createMemo(() => _.remove(access(list), access(item)));

/**
 * signal-builder removing multiple items from an array
 */
export const removeItems = <T extends any[]>(
  list: MaybeAccessor<T>,
  ...items: MaybeAccessor<ItemsOf<T>>[]
): Accessor<T> => createMemo(() => _.removeItems(access(list), ...accessArray(items)) as T);

/**
 * signal-builder appending multiple arrays together
 */
export const concat = <A extends MaybeAccessor<any>[], V extends MaybeAccessorValue<ItemsOf<A>>>(
  ...a: A
): Accessor<Array<V extends any[] ? ItemsOf<V> : V>> =>
  createMemo(() => _.concat(...accessArray(a)));

/**
 * Signal builder: Flattens a nested array into a one-level array
 */
export const flatten = <T extends any[]>(list: MaybeAccessor<T>): Accessor<FlattenArray<T>> =>
  createMemo(() => _.flatten(access(list)) as FlattenArray<T>);

/**
 * Signal builder: filter list: only leave items that are instances of specified Classes
 */
export const filterInstance = <T, I extends AnyClass[]>(list: MaybeAccessor<T[]>, ...classes: I) =>
  (classes.length === 1
    ? createMemo(() => access(list).filter(item => ofClass(item, classes[0]!)))
    : createMemo(() =>
        access(list).filter(item => item && classes.some(c => ofClass(item, c)))
      )) as Accessor<Extract<T, InstanceType<ItemsOf<I>>>[]>;

/**
 * Signal builder: filter list: remove items that are instances of specified Classes
 */
export const filterOutInstance = <T, I extends AnyClass[]>(
  list: MaybeAccessor<T[]>,
  ...classes: I
) =>
  (classes.length === 1
    ? createMemo(() => access(list).filter(item => item && !ofClass(item, classes[0]!)))
    : createMemo(() =>
        access(list).filter(item => item && !classes.some(c => ofClass(item, c)))
      )) as Accessor<Exclude<T, InstanceType<ItemsOf<I>>>[]>;
