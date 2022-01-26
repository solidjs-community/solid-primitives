/** make shallow copy of an array */
export const shallowArrayCopy = <T>(array: readonly T[]): T[] => array.slice();
/** make shallow copy of an object */
export const shallowObjectCopy = <T extends object>(object: T): T => Object.assign({}, object);
/** make shallow copy of an array/object */
export const shallowCopy = <T extends object>(source: T): T =>
  Array.isArray(source) ? (shallowArrayCopy(source) as T) : shallowObjectCopy(source);

/**
 * apply mutations to the an array without changing the original
 * @param array original array
 * @param mutator function applying mutations to the copy of source
 * @returns changed array copy
 */
export const withArrayCopy = <T>(array: readonly T[], mutator: (copy: T[]) => void): T[] => {
  const copy = shallowArrayCopy(array);
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
  const copy = shallowObjectCopy(object);
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
