import { compare, isArray, isFunction, ItemsOf, Many } from "@solid-primitives/utils";
import { withArrayCopy } from "./copy";
import { get } from "./object";
import { FlattenArray, MappingFn, Predicate } from "./types";

/**
 * non-mutating `Array.prototype.push()`
 * @returns changed array copy
 */
export const push = <T>(list: readonly T[], ...items: T[]): T[] =>
  withArrayCopy(list, list => list.push(...items));

/**
 * non-mutating function that drops n items from the array start.
 * @returns changed array copy
 *
 * @example
 * ```ts
 * const newList = drop([1,2,3])
 * newList // => [2,3]
 *
 * const newList = drop([1,2,3], 2)
 * newList // => [3]
 * ```
 */
export const drop = <T>(list: T[], n = 1): T[] => list.slice(n);

/**
 * non-mutating function that drops n items from the array end.
 * @returns changed array copy
 *
 * @example
 * ```ts
 * const newList = pop([1,2,3])
 * newList // => [1,2]
 *
 * const newList = pop([1,2,3], 2)
 * newList // => [1]
 * ```
 */
export const pop = <T>(list: T[], n = 1): T[] => list.slice(0, list.length - n);

/**
 * standalone `Array.prototype.filter()` that filters out passed item
 * @returns changed array copy
 */
export const filterOut = <T>(list: readonly T[], item: T): T[] & { removed: number } =>
  filter(list, i => i !== item);

/**
 * standalone `Array.prototype.filter()`
 * @returns changed array copy
 */
export function filter<T>(list: readonly T[], predicate: Predicate<T>): T[] & { removed: number } {
  const newList = list.filter(predicate) as T[] & { removed: number };
  newList.removed = list.length - newList.length;
  return newList;
}

/**
 * non-mutating `Array.prototype.sort()` as a standalone function
 * @returns changed array copy
 */
export const sort = <T>(list: T[], compareFn?: (a: T, b: T) => number): T[] =>
  list.slice().sort(compareFn);

/**
 * standalone `Array.prototype.map()` function
 */
export const map = <T, V>(list: readonly T[], mapFn: MappingFn<T, V>): V[] => list.map(mapFn);

/**
 * standalone `Array.prototype.slice()` function
 */
export const slice = <T>(list: readonly T[], start?: number, end?: number): T[] =>
  list.slice(start, end);

/**
 * non-mutating `Array.prototype.splice()` as a standalone function
 * @returns changed array copy
 */
export const splice = <T>(
  list: readonly T[],
  start: number,
  deleteCount: number = 0,
  ...items: T[]
): T[] => list.slice().splice(start, deleteCount, ...items);

/**
 * non-mutating `Array.prototype.fill()` as a standalone function
 * @returns changed array copy
 */
export const fill = <T>(list: readonly T[], value: T, start?: number, end?: number): T[] =>
  list.slice().fill(value, start, end);

/**
 * Creates a new array concatenating array with any additional arrays and/or values.
 * @param ...a values or arrays
 * @returns new concatenated array
 */
export function concat<A extends any[], V extends ItemsOf<A>>(
  ...a: A
): Array<V extends any[] ? ItemsOf<V> : V> {
  const result: any[] = [];
  for (const i in a) {
    isArray(a[i]) ? result.push(...a[i]) : result.push(a[i]);
  }
  return result;
}

/**
 * Remove item from array
 * @returns changed array copy
 */
export const remove = <T>(list: readonly T[], item: T): T[] => {
  const index = list.indexOf(item);
  return splice(list, index, 1);
};

/**
 * Remove multiple items from an array
 * @returns changed array copy
 */
export const removeItems = <T>(list: readonly T[], ...items: T[]): T[] => {
  const res = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const ii = items.indexOf(item);
    if (ii !== -1) items.splice(ii, 1);
    else res.push(item);
  }
  return res;
};

/**
 * Flattens a nested array into a one-level array
 * @returns changed array copy
 */
const flatten = <T extends any[]>(arr: T): FlattenArray<T>[] =>
  arr.reduce((flat, next) => flat.concat(isArray(next) ? flatten(next) : next), []);

/**
 * Sort an array by object key, or multiple keys
 * @returns changed array copy
 */
export const sortBy = <T>(
  arr: T[],
  ...paths: T extends object ? (Many<keyof T> | Many<(item: T) => any>)[] : Many<(item: T) => any>[]
): T[] =>
  flatten(paths).reduce(
    (source, path) =>
      sort(source, (a, b) =>
        isFunction(path)
          ? compare(path(a), path(b))
          : compare(get(a as any, path), get(b as any, path))
      ),
    arr
  );
