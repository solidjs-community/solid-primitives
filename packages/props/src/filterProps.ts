import { createMemo } from "solid-js";
import { propTraps } from "./propTraps.js";

/**
 * An alternative primitive to Solid's [splitProps](https://www.solidjs.com/docs/latest/api#splitprops) allowing you to create a new props object with only the property names that match the predicate.
 *
 * The predicate is run for every property read lazily, instead of calculated eagerly like the original splitProps. Any signal accessed within the `predicate` will be tracked, and `predicate` re-executed if changed.
 *
 * @param props The props object to filter.
 * @param predicate A function that returns `true` if the property should be included in the filtered object.
 * @returns A new props object with only the properties that match the predicate.
 *
 * @example
 * ```tsx
 * const dataProps = filterProps(props, key => key.startsWith("data-"));
 * <div {...dataProps} />
 * ```
 */
export function filterProps<T extends object>(props: T, predicate: (key: keyof T) => boolean): T {
  return new Proxy(
    {
      get(property: string | number | symbol) {
        return property in props && predicate(property as keyof T)
          ? props[property as keyof T]
          : undefined;
      },
      has(property: string | number | symbol) {
        return property in props && predicate(property as keyof T);
      },
      keys() {
        return Object.keys(props).filter(predicate as (key: string) => boolean);
      },
    },
    propTraps,
  ) as unknown as T;
}

/**
 * Creates a predicate function that can be used to filter props by the prop name dynamically.
 *
 * The provided {@link predicate} function get's wrapped with a cache layer to prevent unnecessary re-evaluation. If one property is requested multiple times, the predicate function will only be evaluated once.
 *
 * The cache is only cleared when the keys of the props object change. *(when spreading props from a singal)*
 *
 * @param props The props object to filter.
 * @param predicate A function that returns `true` if the property should be included in the filtered object.
 * @returns A cached predicate function that filters the props object.
 *
 * @example
 * ```tsx
 * const predicate = createPropsPredicate(props, key => key.startsWith("data-"));
 * const dataProps = filterProps(props, predicate);
 * <div {...dataProps} />
 * ```
 */
export function createPropsPredicate<T extends object>(
  props: T,
  predicate: (key: keyof T) => boolean,
): (key: keyof T) => boolean {
  const cache = createMemo(
    (): Partial<Record<keyof T, boolean>> => {
      // track prop names — adding/removing keys to dynamic props will trigger this
      Object.keys(props);
      return {};
    },
    undefined,
    { equals: false },
  );
  return key => {
    const cacheRef = cache();
    const cached = cacheRef[key];
    if (cached !== undefined) return cached;
    const v = predicate(key);
    cacheRef[key] = v;
    return v;
  };
}
