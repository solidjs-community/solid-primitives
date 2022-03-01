import { createMemo, Accessor } from "solid-js";
import {
  access,
  isFunction,
  keys,
  MaybeAccessor,
  MaybeAccessorValue
} from "@solid-primitives/utils";

type ReactiveSource = MaybeAccessor<[] | any[] | Record<string | symbol, any>>;

export type Spread<T extends ReactiveSource> = Readonly<{
  [Key in keyof T]: Accessor<T[Key]>;
}>;

export type Destructure<T extends object> = Readonly<{
  [Key in keyof T]-?: Accessor<T[Key]>;
}>;

/**
 * Cashed object getters.
 * @description When a key is accessed for the first time, the `get` function is executed, later a cached value is used instead.
 */
function createProxyCache<T extends object>(get: <K extends keyof T>(key: K) => T[K]): Readonly<T> {
  return new Proxy({} as T, {
    get: (target, key) => {
      const saved = Reflect.get(target, key);
      if (saved) return saved;
      const value = get(key as keyof T);
      Reflect.set(target, key, value);
      return value;
    }
  });
}

/**
 * Access properties of an reactive object as if they were signals. For destructuring props, stores, or signals returning reactive objects.
 * @description result keys are created lazily, so looping over the keys is discouraged.
 * @param source reactive object or signal returning one
 * @returns object of the same keys as the source, but with values turned into accessors.
 * @example // destructure objects
 * const { name, age } = destructure({ name: "John", age: 36 })
 * name() // => "John"
 * age() // => 36
 */
export function destructure<A extends Record<string | symbol, any>>(
  source: A
): Destructure<MaybeAccessorValue<A>> {
  // reactive objects should be already fine-grained
  if (!isFunction(source)) return createProxyCache(key => () => Reflect.get(source, key));
  // make keys fine-grained for accessors
  return createProxyCache(key => createMemo(() => Reflect.get(source(), key)));
}

/**
 * Spreads an reactive object *(store or props)* or a reactive object signal into a tuple/map of signals for each object key. **(source object needs to have static keys – all the keys are eagerly spread)**
 * @param source reactive object or signal returning one
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
export function spread<A extends ReactiveSource, T extends MaybeAccessorValue<A>>(
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
