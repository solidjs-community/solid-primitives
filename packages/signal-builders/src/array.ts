import {
  access,
  accessArray,
  ItemsOf,
  MaybeAccessor,
  MaybeAccessorValue
} from "@solid-primitives/utils";
import * as _ from "@solid-primitives/immutable";
import { Accessor, createMemo } from "solid-js";
import type { MappingFn, Predicate, FlattenArray } from "@solid-primitives/immutable";

export const push = <
  A extends MaybeAccessor<any[]>,
  V extends ItemsOf<MaybeAccessorValue<A>>,
  T extends MaybeAccessor<V>[]
>(
  list: A,
  ...items: T
): Accessor<(V | MaybeAccessorValue<ItemsOf<T>>)[]> =>
  createMemo(() => _.push(access(list), ...accessArray(items)));

export const drop = <T extends any[]>(list: MaybeAccessor<T>, n?: number): Accessor<T> =>
  createMemo(() => _.drop(access(list), n) as T);

export const dropRight = <T extends any[]>(list: MaybeAccessor<T>, n?: number): Accessor<T> =>
  createMemo(() => _.dropRight(access(list), n) as T);

export const filterOut = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  item: MaybeAccessor<V>
): Accessor<V[]> => createMemo(() => _.filterOut(access(list), access(item)));

export const filter = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  predicate: Predicate<V>
): Accessor<V[]> => createMemo(() => _.filter(access(list), predicate));

export const sort = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  compareFn?: (a: V, b: V) => number
): Accessor<V[]> => createMemo(() => _.sort(access(list), compareFn));

export const map = <A extends MaybeAccessor<any[]>, T>(
  list: A,
  mapFn: MappingFn<ItemsOf<MaybeAccessorValue<A>>, T>
): Accessor<T[]> => createMemo(() => _.map(access(list), mapFn));

export const slice = <T extends any[]>(
  list: MaybeAccessor<T>,
  start?: number,
  end?: number
): Accessor<T> => createMemo(() => _.slice(access(list), start, end) as T);

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

export const remove = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  item: MaybeAccessor<V>
): Accessor<V[]> => createMemo(() => _.remove(access(list), access(item)));

export const removeItems = <T extends any[]>(
  list: MaybeAccessor<T>,
  ...items: MaybeAccessor<ItemsOf<T>>[]
): Accessor<T> => createMemo(() => _.removeItems(access(list), ...accessArray(items)) as T);

export const concat = <A extends MaybeAccessor<any>[], V extends MaybeAccessorValue<ItemsOf<A>>>(
  ...a: A
): Accessor<Array<V extends any[] ? ItemsOf<V> : V>> =>
  createMemo(() => _.concat(...accessArray(a)));

export const flatten = <T extends any[]>(list: MaybeAccessor<T>): Accessor<FlattenArray<T>> =>
  createMemo(() => _.flatten(access(list)) as FlattenArray<T>);
