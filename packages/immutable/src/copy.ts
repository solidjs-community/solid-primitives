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
