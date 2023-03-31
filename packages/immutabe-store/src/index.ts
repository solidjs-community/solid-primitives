import { createRoot, getListener } from "solid-js";
import { createLazyMemo } from "@solid-primitives/memo";

const createNextMemo: typeof createLazyMemo = (a: any, b: any, c: any) =>
  createRoot(() => createLazyMemo(a, b, c));

function wrap<T extends object>(source: T, memo: () => T): T {
  const cache = new Map<keyof T, () => T[keyof T]>();
  return new Proxy(source.constructor() as T, {
    get(_, key) {
      if (typeof key === "symbol") return Reflect.get(source, key);

      if (cache.has(key as keyof T)) return cache.get(key as keyof T)!();

      const value = memo()[key as keyof T];

      if (!getListener()) {
        if (value && typeof value === "object") {
          return wrap(value, () => memo()[key as keyof T]!);
        }
        return value;
      }

      const keyMemo = createNextMemo(() => memo()[key as keyof T]);
      cache.set(key as keyof T, keyMemo);
      return keyMemo();
    },
    set: () => false,
  });
}

export function createImmutable<T extends object>(source: (prev: T) => T): T {}
