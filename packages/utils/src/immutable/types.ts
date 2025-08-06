import { type ItemsOf } from "../index.js";

export type Predicate<T> = (item: T, index: number, array: readonly T[]) => boolean;
export type MappingFn<T, V> = (item: T, index: number, array: readonly T[]) => V;

export type FlattenArray<T> = T extends any[] ? FlattenArray<ItemsOf<T>> : T;

export type ModifyValue<O, K extends keyof O, V> = Omit<O, K> & { [key in K]: V };
