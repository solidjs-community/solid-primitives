import { MappingFn, Predicate } from ".";

/**
 * apply mutations to the an array without changing the original
 * @param array original array
 * @param mutator function applying mutations to the copy of source
 * @returns changed array copy
 */
export const withArrayCopy = <T>(array: readonly T[], mutator: (copy: T[]) => void): T[] => {
  const copy = array.slice();
  mutator(copy);
  return copy;
};

/**
 * apply mutations to the an object without changing the original
 * @param object original object
 * @param mutator function applying mutations to the copy of source
 * @returns changed object copy
 */
export const withObjectCopy = <T extends object>(object: T, mutator: (copy: T) => void): T => {
  const copy = Object.assign({}, object);
  mutator(copy);
  return copy;
};

/**
 * apply mutations to the an object/array without changing the original
 * @param source original object
 * @param mutator function applying mutations to the copy of source
 * @returns changed object copy
 */
export const withCopy = <T extends object>(source: T, mutator: (copy: T) => void): T =>
  Array.isArray(source)
    ? (withArrayCopy(source, mutator as any) as any)
    : withObjectCopy(source, mutator);

/**
 * non-mutating `Array.prototype.push()`
 * @returns changed array copy
 */
export const push = <T>(list: T[], item: T): T[] => withArrayCopy(list, list => list.push(item));

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
 * non-mutating `Array.prototype.filter()` that filters out passed item
 * @returns changed array copy
 */
export const filterOut = <T>(list: readonly T[], item: T): T[] & { removed: number } =>
  filter(list, i => i !== item);

/**
 * non-mutating `Array.prototype.filter()` as a standalone function
 * @returns changed array copy
 */
export function filter<T>(list: readonly T[], predicate: Predicate<T>): T[] & { removed: number } {
  const newList = list.filter(predicate) as T[] & { removed: number };
  newList.removed = list.length - newList.length;
  return newList;
}

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
export const splice = <T>(list: readonly T[], start: number, deleteCount: number, ...items: T[]) =>
  withArrayCopy(list, list => list.splice(start, deleteCount, ...items));

/**
 * Create a new subset object without the provided keys
 *
 * @example
 * ```ts
 * const newObject = omit({ a:"foo", b:"bar", c: "baz" }, 'a', 'b')
 * newObject // => { c: "baz" }
 * ```
 */
export const omit = <O extends object, K extends keyof O>(object: O, ...keys: K[]): Omit<O, K> =>
  withObjectCopy(object, object => keys.forEach(key => delete object[key]));

/**
 * Create a new subset object with only the provided keys
 *
 * @example
 * ```ts
 * const newObject = pick({ a:"foo", b:"bar", c: "baz" }, 'a', 'b')
 * newObject // => { a:"foo", b:"bar" }
 * ```
 */
export const pick = <O extends object, K extends keyof O>(object: O, ...keys: K[]): Pick<O, K> =>
  keys.reduce((n, k) => {
    if (k in object) n[k] = object[k];
    return n;
  }, {} as Pick<O, K>);
