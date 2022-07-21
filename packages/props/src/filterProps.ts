import { createMemo } from "solid-js";
import { propTraps } from "./propTraps";

export function filterProps<T>(props: T, predicate: (key: keyof T) => boolean): T {
  return new Proxy(
    {
      get(property: string | number | symbol) {
        return predicate(property as keyof T) ? props[property as keyof T] : undefined;
      },
      has(property: string | number | symbol) {
        return predicate(property as keyof T) ? property in props : false;
      },
      keys() {
        return Object.keys(props).filter(predicate as (key: string) => boolean);
      }
    },
    propTraps
  ) as unknown as T;
}

export function createPropsPredicate<T>(
  props: T,
  predicate: (key: keyof T) => boolean
): (key: keyof T) => boolean {
  const cache = createMemo(
    (): Partial<Record<keyof T, boolean>> => {
      // track prop names — adding/removing keys to dynamic props will trigger this
      Object.keys(props);
      return {};
    },
    undefined,
    { equals: false }
  );
  return key => {
    const _cache = cache();
    const cached = _cache[key];
    if (cached !== undefined) return cached;
    const v = predicate(key);
    _cache[key] = v;
    return v;
  };
}
