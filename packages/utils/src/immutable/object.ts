import { withObjectCopy, shallowObjectCopy } from "./copy";
import { Modify } from "..";

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
  keys.reduce(
    (n, k) => {
      if (k in object) n[k] = object[k];
      return n;
    },
    {} as Pick<O, K>,
  );

/**
 * Get a single property value of an object by specifying a path to it.
 */
export function get<O extends object, K extends keyof O>(obj: O, key: K): O[K];
export function get<O extends object, K1 extends keyof O, K2 extends keyof O[K1]>(
  obj: O,
  k1: K1,
  k2: K2,
): O[K1][K2];
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
>(obj: O, k1: K1, k2: K2, k3: K3): O[K1][K2][K3];
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3],
>(obj: O, k1: K1, k2: K2, k3: K3, k4: K4): O[K1][K2][K3][K4];
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3],
  K5 extends keyof O[K1][K2][K3][K4],
>(obj: O, k1: K1, k2: K2, k3: K3, k4: K4, k5: K5): O[K1][K2][K3][K4][K5];
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3],
  K5 extends keyof O[K1][K2][K3][K4],
  K6 extends keyof O[K1][K2][K3][K4][K5],
>(obj: O, k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6): O[K1][K2][K3][K4][K5][K6];
export function get(obj: any, ...keys: (string | number | symbol)[]) {
  let res = obj;
  for (const key of keys) {
    res = res[key];
  }
  return res;
}

/**
 * Split object properties by keys into multiple object copies with a subset of selected properties.
 *
 * @param object original object
 * @param ...keys keys to pick from the source, or multiple arrays of keys *(for splitting into more than 2 objects)*
 * ```ts
 * (keyof object)[][] | (keyof object)[]
 * ```
 * @returns array of subset objects
 */

export function split<T extends object, K extends keyof T>(
  object: T,
  ...keys: K[]
): [Pick<T, K>, Omit<T, K>];
export function split<T extends object, K1 extends keyof T, K2 extends keyof T>(
  object: T,
  ...keys: [K1[], K2[]]
): [Pick<T, K1>, Pick<T, K2>, Omit<T, K1 | K2>];
export function split<T extends object, K1 extends keyof T, K2 extends keyof T, K3 extends keyof T>(
  object: T,
  ...keys: [K1[], K2[], K3[]]
): [Pick<T, K1>, Pick<T, K2>, Pick<T, K3>, Omit<T, K1 | K2 | K3>];
export function split<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T,
  K3 extends keyof T,
  K4 extends keyof T,
>(
  object: T,
  ...keys: [K1[], K2[], K3[], K4[]]
): [Pick<T, K1>, Pick<T, K2>, Pick<T, K3>, Pick<T, K4>, Omit<T, K1 | K2 | K3 | K4>];
export function split<
  T extends object,
  K1 extends keyof T,
  K2 extends keyof T,
  K3 extends keyof T,
  K4 extends keyof T,
  K5 extends keyof T,
>(
  object: T,
  ...keys: [K1[], K2[], K3[], K4[], K5[]]
): [
  Pick<T, K1>,
  Pick<T, K2>,
  Pick<T, K3>,
  Pick<T, K4>,
  Pick<T, K5>,
  Omit<T, K1 | K2 | K3 | K4 | K5>,
];
export function split<T extends object>(object: T, ...list: (keyof T)[][] | (keyof T)[]): any {
  const _list = (typeof list[0] === "string" ? [list] : list) as (keyof T)[][];
  const copy = shallowObjectCopy(object);
  const result: Record<keyof T, any>[] = [];
  for (let i = 0; i < _list.length; i++) {
    const keys = _list[i] as (keyof T)[];
    result.push({} as Record<keyof T, any>);
    for (const key of keys) {
      result[i]![key] = copy[key];
      delete copy[key];
    }
  }
  return [...result, copy];
}

/**
 * Merges multiple objects into a single one. Only the first level of properties is merged. An alternative to `{ ...a, ...b, ...c }`.
 * @param ...objects objects to merge
 * @example
 * const d = merge(a, b, c)
 */
export function merge<A extends object, B extends object>(a: A, b: B): Modify<A, B>;
export function merge<A extends object, B extends object, C extends object>(
  a: A,
  b: B,
  c: C,
): Modify<Modify<A, B>, C>;
export function merge<A extends object, B extends object, C extends object, D extends object>(
  a: A,
  b: B,
  c: C,
  d: D,
): Modify<Modify<Modify<A, B>, C>, D>;
export function merge<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
>(a: A, b: B, c: C, d: D, e: E): Modify<Modify<Modify<Modify<A, B>, C>, D>, E>;
export function merge<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
>(a: A, b: B, c: C, d: D, e: E, f: F): Modify<Modify<Modify<Modify<Modify<A, B>, C>, D>, E>, F>;
export function merge(...objects: object[]) {
  const result = {};
  for (const obj of objects) {
    Object.assign(result, obj);
  }
  return result;
}
