import {
  access,
  accessArray,
  ItemsOf,
  MaybeAccessor,
  MaybeAccessorValue
} from "@solid-primitives/utils";
import * as fp from "@solid-primitives/immutable";
import { Accessor, createMemo } from "solid-js";
import type { MappingFn, Predicate } from "@solid-primitives/immutable";

export const toFloat = (string: MaybeAccessor<string>): Accessor<number> =>
  createMemo(() => Number.parseFloat(access(string)));

export const toInt = (string: MaybeAccessor<string>, radix?: number): Accessor<number> =>
  createMemo(() => Number.parseInt(access(string), radix));

export const stringConcat = (...a: MaybeAccessor<any>[]): Accessor<string> =>
  createMemo(() => a.reduce((t: string, c) => t + access(c), "") as string);

export const push = <
  A extends MaybeAccessor<any[]>,
  V extends ItemsOf<MaybeAccessorValue<A>>,
  T extends MaybeAccessor<V>[]
>(
  list: A,
  ...items: T
): Accessor<(V | MaybeAccessorValue<ItemsOf<T>>)[]> =>
  createMemo(() => fp.push(access(list), ...accessArray(items)));

export const drop = <T extends any[]>(list: MaybeAccessor<T>, n?: number): Accessor<T> =>
  createMemo(() => fp.drop(access(list), n) as T);

export const dropRight = <T extends any[]>(list: MaybeAccessor<T>, n?: number): Accessor<T> =>
  createMemo(() => fp.dropRight(access(list), n) as T);

export const filterOut = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  item: MaybeAccessor<V>
): Accessor<V[]> => createMemo(() => fp.filterOut(access(list), access(item)));

export const filter = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  predicate: Predicate<V>
): Accessor<V[]> => createMemo(() => fp.filter(access(list), predicate));

export const sort = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  compareFn?: (a: V, b: V) => number
): Accessor<V[]> => createMemo(() => fp.sort(access(list), compareFn));

export const map = <A extends MaybeAccessor<any[]>, T>(
  list: A,
  mapFn: MappingFn<ItemsOf<MaybeAccessorValue<A>>, T>
): Accessor<T[]> => createMemo(() => fp.map(access(list), mapFn));

export const slice = <T extends any[]>(
  list: MaybeAccessor<T>,
  start?: number,
  end?: number
): Accessor<T> => createMemo(() => fp.slice(access(list), start, end) as T);

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
    fp.splice(access(list), access(start), access(deleteCount), ...accessArray(items))
  );

export const remove = <A extends MaybeAccessor<any[]>, V extends ItemsOf<MaybeAccessorValue<A>>>(
  list: A,
  item: MaybeAccessor<V>
): Accessor<V[]> => createMemo(() => fp.remove(access(list), access(item)));

export const concat = <A extends MaybeAccessor<any>[], V = MaybeAccessorValue<ItemsOf<A>>>(
  ...a: A
): Accessor<Array<V extends any[] ? ItemsOf<V> : V>> =>
  createMemo(() => fp.concat(...accessArray(a)));
