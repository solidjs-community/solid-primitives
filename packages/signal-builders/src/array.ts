import {
  access,
  accessArray,
  type AnyClass,
  type ItemsOf,
  type MaybeAccessor,
  type MaybeAccessorValue,
  ofClass,
} from "@solid-primitives/utils";
import * as _ from "@solid-primitives/utils/immutable";
import { type Accessor, createMemo } from "solid-js";
import type { MappingFn, Predicate, FlattenArray } from "@solid-primitives/utils/immutable";

/** Reactively appends items to an array, returning a new array without mutating the original. */
export const push = <
  A extends MaybeAccessor<any[]>,
  V extends ItemsOf<MaybeAccessorValue<A>>,
  T extends MaybeAccessor<V>[],
>(
  list: A,
  ...items: T
): Accessor<(V | MaybeAccessorValue<ItemsOf<T>>)[]> =>
  createMemo(() => _.push(access(list), ...accessArray(items)));

/**
 * Reactively drops the first `n` elements from an array (default: 1).
 * @example
 * const [list, setList] = createSignal([1, 2, 3, 4]);
 * drop(list, 2)(); // => [3, 4]
 */
export const drop = <T extends any[]>(list: MaybeAccessor<T>, n?: number): Accessor<T> =>
  createMemo(() => _.drop(access(list), n) as T);

/**
 * Reactively drops the last `n` elements from an array (default: 1).
 * @example
 * const [list, setList] = createSignal([1, 2, 3, 4]);
 * dropRight(list, 2)(); // => [1, 2]
 */
export const dropRight = <T extends any[]>(list: MaybeAccessor<T>, n?: number): Accessor<T> =>
  createMemo(() => _.dropRight(access(list), n) as T);

/** Reactively filters array items by a predicate function. */
export const filter = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  predicate: Predicate<V>,
): Accessor<V[]> => createMemo(() => _.filter(access(list), predicate));

/** Reactively filters out all occurrences of `item` from the array. */
export const filterOut = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  item: MaybeAccessor<V>,
): Accessor<V[]> => createMemo(() => _.filterOut(access(list), access(item)));

/**
 * Reactively sorts an array, returning a new sorted copy without mutating the original.
 * Without a `compareFn`, items are sorted lexicographically (coerced to strings).
 */
export const sort = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  compareFn?: (a: V, b: V) => number,
): Accessor<V[]> => createMemo(() => _.sort(access(list), compareFn));

/** Reactively maps array items to a new value via `mapFn`. */
export const map = <A extends MaybeAccessor<any[]>, T>(
  list: A,
  mapFn: MappingFn<ItemsOf<MaybeAccessorValue<A>>, T>,
): Accessor<T[]> => createMemo(() => _.map(access(list), mapFn));

/** Reactive `Array.prototype.slice()` — extracts a portion of the array without mutating it. */
export const slice = <T extends any[]>(
  list: MaybeAccessor<T>,
  start?: number,
  end?: number,
): Accessor<T> => createMemo(() => _.slice(access(list), start, end) as T);

/**
 * Reactively removes/replaces elements and optionally inserts new ones, returning a new array.
 * Immutable equivalent of `Array.prototype.splice()`.
 */
export const splice = <
  A extends MaybeAccessor<any[]>,
  V extends ItemsOf<MaybeAccessorValue<A>>,
  T extends MaybeAccessor<V>[],
>(
  list: A,
  start: MaybeAccessor<number>,
  deleteCount?: MaybeAccessor<number>,
  ...items: T
): Accessor<(V | MaybeAccessorValue<ItemsOf<T>>)[]> =>
  createMemo(() =>
    _.splice(access(list), access(start), access(deleteCount), ...accessArray(items)),
  );

/** Reactively removes the first occurrence of `item` from the array. */
export const remove = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  item: MaybeAccessor<V>,
): Accessor<V[]> => createMemo(() => _.remove(access(list), access(item)));

/**
 * Reactively removes all provided items from the array (every occurrence of each).
 * @example
 * const [list, setList] = createSignal([1, 2, 3, 2, 1]);
 * removeItems(list, 1, 2)(); // => [3]
 */
export const removeItems = <T extends any[]>(
  list: MaybeAccessor<T>,
  ...items: MaybeAccessor<ItemsOf<T>>[]
): Accessor<T> => createMemo(() => _.removeItems(access(list), ...accessArray(items)) as T);

/**
 * Reactively concatenates multiple arrays or values into a single flat array.
 * @example
 * const [a, setA] = createSignal([1, 2]);
 * const [b, setB] = createSignal([3, 4]);
 * concat(a, b)(); // => [1, 2, 3, 4]
 */
export const concat = <A extends MaybeAccessor<any>[], V extends MaybeAccessorValue<ItemsOf<A>>>(
  ...a: A
): Accessor<Array<V extends any[] ? ItemsOf<V> : V>> =>
  createMemo(() => _.concat(...accessArray(a)));

/** Reactively flattens a nested array by one level. */
export const flatten = <T extends any[]>(list: MaybeAccessor<T>): Accessor<FlattenArray<T>> =>
  createMemo(() => _.flatten(access(list)) as FlattenArray<T>);

/**
 * Reactively keeps only items that are instances of any of the provided classes.
 * @example
 * const [nodes, setNodes] = createSignal([new Text("hi"), new Comment("x"), new Text("bye")]);
 * filterInstance(nodes, Text)(); // => [Text("hi"), Text("bye")]
 */
export const filterInstance = <T, I extends AnyClass[]>(list: MaybeAccessor<T[]>, ...classes: I) =>
  (classes.length === 1
    ? createMemo(() => access(list).filter(item => ofClass(item, classes[0]!)))
    : createMemo(() =>
        access(list).filter(item => item && classes.some(c => ofClass(item, c))),
      )) as Accessor<Extract<T, InstanceType<ItemsOf<I>>>[]>;

/**
 * Reactively removes items that are instances of any of the provided classes.
 * @example
 * const [nodes, setNodes] = createSignal([new Text("hi"), new Comment("x"), new Text("bye")]);
 * filterOutInstance(nodes, Comment)(); // => [Text("hi"), Text("bye")]
 */
export const filterOutInstance = <T, I extends AnyClass[]>(
  list: MaybeAccessor<T[]>,
  ...classes: I
) =>
  (classes.length === 1
    ? createMemo(() => access(list).filter(item => item && !ofClass(item, classes[0]!)))
    : createMemo(() =>
        access(list).filter(item => item && !classes.some(c => ofClass(item, c))),
      )) as Accessor<Exclude<T, InstanceType<ItemsOf<I>>>[]>;
