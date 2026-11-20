/** Experimental ephemeron leaf: holding this token does not retain its key/value. */
export interface WeakCollectionToken<K extends WeakKey, V> {
  readonly $weak: true;
  readonly ref: WeakRef<K> | undefined;
  readonly values: WeakMap<K, V>;
}

export function createWeakCollectionToken<K extends WeakKey, V>(
  key: K,
  value: V,
): WeakCollectionToken<K, V> {
  return Object.freeze({
    $weak: true as const,
    ref: new WeakRef(key),
    values: new WeakMap([[key, value]]),
  });
}

export function readWeakCollectionToken<K extends WeakKey, V>(
  token: WeakCollectionToken<K, V>,
  key: K,
): V | undefined {
  return token.values.get(key);
}

export function isWeakCollectionToken(
  value: unknown,
): value is WeakCollectionToken<WeakKey, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as WeakCollectionToken<WeakKey, unknown>).$weak === true &&
    ((value as WeakCollectionToken<WeakKey, unknown>).ref === undefined ||
      (value as WeakCollectionToken<WeakKey, unknown>).ref instanceof WeakRef) &&
    (value as WeakCollectionToken<WeakKey, unknown>).values instanceof WeakMap
  );
}
