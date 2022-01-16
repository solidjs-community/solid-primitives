import {
  access,
  accessArray,
  ItemsOf,
  MaybeAccessor,
  MaybeAccessorValue
} from "@solid-primitives/utils";
import * as _ from "@solid-primitives/immutable";
import { Accessor, createMemo } from "solid-js";
import type { MappingFn, Predicate } from "@solid-primitives/immutable";

//
// PARSERS
//

export const toFloat = (string: MaybeAccessor<string>): Accessor<number> =>
  createMemo(() => Number.parseFloat(access(string)));

export const toInt = (string: MaybeAccessor<string>, radix?: number): Accessor<number> =>
  createMemo(() => Number.parseInt(access(string), radix));

//
// STRING
//

export const stringConcat = (...a: MaybeAccessor<any>[]): Accessor<string> =>
  createMemo(() => a.reduce((t: string, c) => t + access(c), "") as string);

//
// ARRAY
//

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

export const concat = <A extends MaybeAccessor<any>[], V extends MaybeAccessorValue<ItemsOf<A>>>(
  ...a: A
): Accessor<Array<V extends any[] ? ItemsOf<V> : V>> =>
  createMemo(() => _.concat(...accessArray(a)));

export const join = <T extends any[]>(
  list: MaybeAccessor<T>,
  separator?: MaybeAccessor<string>
): Accessor<string> => createMemo(() => access(list).join(access(separator)));

//
// OBJECT
//

export const omit = <
  A extends MaybeAccessor<object>,
  O extends MaybeAccessorValue<A>,
  K extends keyof O
>(
  object: A,
  ...keys: MaybeAccessor<K>[]
): Accessor<Omit<O, K>> => createMemo(() => _.omit<any, any>(access(object), ...accessArray(keys)));

export const pick = <
  A extends MaybeAccessor<object>,
  O extends MaybeAccessorValue<A>,
  K extends keyof O
>(
  object: A,
  ...keys: MaybeAccessor<K>[]
): Accessor<Pick<O, K>> => createMemo(() => _.pick<any, any>(access(object), ...accessArray(keys)));

export * from "./update";
