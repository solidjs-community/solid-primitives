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
  K4 extends keyof T
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
  K5 extends keyof T
>(
  object: T,
  ...keys: [K1[], K2[], K3[], K4[], K5[]]
): [
  Pick<T, K1>,
  Pick<T, K2>,
  Pick<T, K3>,
  Pick<T, K4>,
  Pick<T, K5>,
  Omit<T, K1 | K2 | K3 | K4 | K5>
];
export function split<T extends object>(object: T, ...list: (keyof T)[][] | (keyof T)[]): any {
  const _list = (typeof list[0] === "string" ? [list] : list) as (keyof T)[][];
  const copy = Object.assign({}, object);
  let result: Record<keyof T, any>[] = [];
  for (let i = 0; i < _list.length; i++) {
    const keys = _list[i] as (keyof T)[];
    result.push({} as Record<keyof T, any>);
    for (const key of keys) {
      result[i][key] = copy[key];
      delete copy[key];
    }
  }
  return [...result, copy];
}
