import { createMemo, Accessor, getOwner, runWithOwner } from "solid-js";
import {
  access,
  isFunction,
  keys,
  MaybeAccessor,
  MaybeAccessorValue
} from "@solid-primitives/utils";

type ReactiveObject = [] | any[] | Record<string | symbol, any>;

export type Spread<T extends ReactiveObject> = Readonly<{
  [Key in keyof T]: Accessor<T[Key]>;
}>;

/**
 * Cashed object getters.
 * @description When a key is accessed for the first time, the `get` function is executed, later a cached value is used instead.
 */
function createProxyCache<T extends object>(get: <K extends keyof T>(key: K) => T[K]): Readonly<T> {
  return new Proxy({} as Readonly<T>, {
    get(target, key) {
      const saved = Reflect.get(target, key);
      if (saved) return saved;
      const value = get(key as keyof T);
      Reflect.set(target, key, value);
      return value;
    }
  });
}

export function destructure<
  A extends MaybeAccessor<ReactiveObject>,
  T extends MaybeAccessorValue<A>
>(source: A): Spread<T> {
  // make keys fine-grained for accessors
  if (!isFunction(source)) return createProxyCache(key => () => Reflect.get(source, key));
  // reactive objects should be already fine-grained
  const owner = getOwner()!;
  return createProxyCache(key =>
    runWithOwner(owner, () => createMemo(() => Reflect.get(source(), key)))
  );
}

/**
 * Turn your signal into a tuple of signals, or map of signals. **(input needs to have static keys)**
 * @example // spread tuples
 * const [first, second, third] = spread(() => [1,2,3])
 * first() // => 1
 * second() // => 2
 * third() // => 3
 * @example // spread objects
 * const { name, age } = spread({ name: "John", age: 36 })
 * name() // => "John"
 * age() // => 36
 */
export function spread<A extends MaybeAccessor<ReactiveObject>, T extends MaybeAccessorValue<A>>(
  source: A
): Spread<T> {
  const obj = access(source);
  const result = obj.constructor();
  // make keys fine-grained for accessors
  if (isFunction(source))
    for (const key of keys(obj)) result[key] = createMemo(() => (source() as T)[key]);
  // reactive objects should be already fine-grained
  else for (const key of keys(obj)) result[key] = () => obj[key];
  return result;
}
