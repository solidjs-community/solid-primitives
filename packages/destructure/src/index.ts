import { createMemo, Accessor } from "solid-js";
import {
  access,
  isFunction,
  keys,
  MaybeAccessor,
  MaybeAccessorValue,
  AnyObject,
  Values,
  Definite,
  NonIterable
} from "@solid-primitives/utils";
import type { MemoOptions } from "solid-js/types/reactive/signal";

type ReactiveSource = MaybeAccessor<[] | any[] | AnyObject>;
type AccessorProps<T> = {
  [K in keyof T]: Accessor<T[K]>;
};

export type SpreadOptions<T extends ReactiveSource> = MemoOptions<Values<T>> & { cache?: boolean };

export type Spread<T extends ReactiveSource> = Readonly<AccessorProps<T>>;

export type Destructure<T extends ReactiveSource> = Readonly<
  NonIterable<Definite<AccessorProps<T>>>
>;

/**
 * Cashed object getters.
 * @description When a key is accessed for the first time, the `get` function is executed, later a cached value is used instead.
 */
function createProxyCache<T extends AnyObject>(
  get: <K extends keyof T>(key: K) => T[K]
): Readonly<NonIterable<T>> {
  return new Proxy({} as NonIterable<T>, {
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
export function destructure<A extends ReactiveSource, T extends MaybeAccessorValue<A>>(
  source: A,
  options: SpreadOptions<T> = {}
): Destructure<T> {
  const cache = options.cache ?? isFunction(source);
  return createProxyCache(key => {
    const calc = isFunction(source)
      ? () => Reflect.get(source(), key)
      : () => Reflect.get(source, key);
    return cache ? createMemo(calc, options) : calc;
  });
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
  source: A,
  options: SpreadOptions<T> = {}
): Spread<T> {
  const cache = options.cache ?? isFunction(source);
  const getter = isFunction(source)
    ? (key: any) => () => source()[key]
    : (key: any) => () => source[key];
  const obj = access(source);
  const result = obj.constructor();
  for (const key of keys(obj)) {
    const calc = getter(key);
    result[key] = cache ? createMemo(calc) : calc;
  }
  return result;
}
