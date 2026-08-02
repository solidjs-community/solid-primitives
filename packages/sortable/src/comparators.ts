export type Comparator<T> = (a: T, b: T) => number;

function isMissing(value: unknown): boolean {
  return value == null || (typeof value === "number" && Number.isNaN(value));
}

/**
 * Default ascending comparator for `Array.prototype.sort` and every primitive in this package.
 * `null`, `undefined`, and `NaN` always sort to the end, regardless of direction — unlike a naive
 * `a < b ? -1 : a > b ? 1 : 0`, which silently treats them as equal to everything they're compared
 * against (their relative order then depends on sort stability rather than being well-defined).
 */
export const ascending: Comparator<any> = (a, b) => {
  const aMissing = isMissing(a);
  const bMissing = isMissing(b);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return a < b ? -1 : a > b ? 1 : 0;
};

/**
 * Descending comparator. `null`/`undefined`/`NaN` still sort to the end — reversing the order of
 * comparable values doesn't move missing values to the front.
 */
export const descending: Comparator<any> = (a, b) => {
  const aMissing = isMissing(a);
  const bMissing = isMissing(b);
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return a > b ? -1 : a < b ? 1 : 0;
};

/**
 * Builds a comparator that orders items by a derived key.
 * @example
 * const byPrice = by((item: Product) => item.price);
 * const byPriceDesc = by((item: Product) => item.price, descending);
 */
export const by = <T, K>(accessor: (item: T) => K, comparator: Comparator<K> = ascending): Comparator<T> => (a, b) => comparator(accessor(a), accessor(b));

/**
 * Composes comparators so later ones break ties left by earlier ones.
 * @example
 * const cmp = combine(by((p: Product) => p.category), by((p: Product) => p.price, descending));
 */
export const combine = <T>(...comparators: Comparator<T>[]): Comparator<T> => (a, b) => {
  for (const comparator of comparators) {
    const result = comparator(a, b);
    if (result !== 0) return result;
  }
  return 0;
};

/** Flips the order of any comparator (composes with {@link by} and {@link combine}). */
export const reverse = <T>(comparator: Comparator<T>): Comparator<T> => (a, b) => comparator(b, a);
