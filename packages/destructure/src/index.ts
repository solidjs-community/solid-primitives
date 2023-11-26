import { createMemo, Accessor, runWithOwner, getOwner, MemoOptions } from "solid-js";
import {
  access,
  MaybeAccessor,
  AnyObject,
  Values,
  AnyFunction,
  MaybeAccessorValue,
} from "@solid-primitives/utils";

type ReactiveSource = [] | any[] | AnyObject;

export type DestructureOptions<T extends ReactiveSource> = MemoOptions<Values<T>> & {
  memo?: boolean;
  lazy?: boolean;
  deep?: boolean;
  normalize?: boolean;
};
type FunctionWithParams<T> = T extends (...args: infer P) => infer R
  ? P extends [] // Check if the parameter list is empty
    ? never
    : (...args: P) => R
  : never;
type ReturnFunction<T> = T extends (...args: infer P) => infer R
  ? P extends [] // Check if the parameter list is empty
    ? R extends FunctionWithParams<R> //if empty check if the returned value is a function with params
      ? R //return the function with params e.g. passed prop "() => (foo) => bar" will return "(foo) => bar"
      : T //no params and no returned function with params return original prop which is already a function / Accessor
    : T // T is a funtion with params return that function e.g. "(foo) => bar" will stay "(foo) => bar"
  : () => T; // prop was static value return function "foo" will return "()=> foo"
type ReturnValue<T, N> = N extends true ? ReturnFunction<T> : Accessor<T>;

export type Spread<T extends ReactiveSource, N = false> = {
  readonly [K in keyof T]: ReturnValue<T[K], N>;
};

export type DeepSpread<T extends ReactiveSource, N = false> = {
  readonly [K in keyof T]: T[K] extends ReactiveSource
    ? T[K] extends AnyFunction
      ? ReturnValue<T[K], N>
      : DeepSpread<T[K], N>
    : ReturnValue<T[K], N>;
};
export type Destructure<T extends ReactiveSource, N = false> = {
  readonly [K in keyof T]-?: ReturnValue<T[K], N>;
};
export type DeepDestructure<T extends ReactiveSource, N = false> = {
  readonly [K in keyof T]-?: T[K] extends ReactiveSource
    ? T[K] extends AnyFunction
      ? ReturnValue<T[K], N>
      : DeepDestructure<T[K], N>
    : ReturnValue<T[K], N>;
};

const isReactiveObject = (value: any): boolean => typeof value === "object" && value !== null;

/**
 * Cashed object getters.
 * @description When a key is accessed for the first time, the `get` function is executed, later a cached value is used instead.
 */
function createProxyCache(obj: object, get: (key: any) => any): any {
  return new Proxy(
    {},
    {
      get: (target, key) => {
        if (key === Symbol.iterator || key === "length") return Reflect.get(obj, key);
        const saved = Reflect.get(target, key);
        if (saved) return saved;
        const value = get(key);
        Reflect.set(target, key, value);
        return value;
      },
      set: () => false,
    },
  );
}

/**
 * Destructures an reactive object *(e.g. store or component props)* or a signal of one into a tuple/map of signals for each object key.
 * @param source reactive object or signal returning one
 * @param options memo options + primitive configuration:
 * - `memo` - wraps accessors in `createMemo`, making each property update independently. *(enabled by default for signal source)*
 * - `normalize` - turn all static values and getters to accessors, but keep all callbacks and accessors as they are.
 * ```ts
 * { a: 1, get b() { return foo() }, c: () => bar(), d: (a: string) => {} }
 * // becomes
 * { a: () => 1, b: () => foo(), c: () => bar(), d: (a string) => {} }
 * ```
 * - `lazy` - property accessors are created on key read. enable if you want to only a subset of source properties, or use properties initially missing
 * - `deep` - destructure nested objects

 * @returns object of the same keys as the source, but with values turned into accessors.
 * @example // spread tuples
 * const [first, second, third] = destructure(() => [1,2,3])
 * first() // => 1
 * second() // => 2
 * third() // => 3
 * @example // spread objects
 * const { name, age } = destructure({ name: "John", age: 36 })
 * name() // => "John"
 * age() // => 36
 */
export function destructure<T extends ReactiveSource, O extends DestructureOptions<T>>(
  source: MaybeAccessor<T>,
  options?: O,
): O extends { lazy: true; deep: true }
  ? DeepDestructure<T, O["normalize"]>
  : O extends { lazy: true }
  ? Destructure<T, O["normalize"]>
  : O["deep"] extends true
  ? DeepSpread<T, O["normalize"]>
  : Spread<T, O["normalize"]> {
  const config: DestructureOptions<T> = options ?? {};
  const memo = config.memo ?? typeof source === "function";

  const _source = () => (typeof source === "function" ? source() : source);
  const getter = (key: any) => {
    const accessedValue = () => getNormalizedValue(_source()[key]);
    //If accessedValue() is a function with params return the original function
    if (typeof accessedValue() === "function" && hasParams(accessedValue())) return accessedValue();
    return accessedValue;
  };

  const obj = access(source);

  // lazy (use proxy)
  if (config.lazy) {
    const owner = getOwner()!;
    return createProxyCache(obj, key => {
      const calc = getter(key);
      if (config.deep && isReactiveObject(obj[key]))
        return runWithOwner(owner, () => destructure(calc, { ...config, memo }));
      return memo && (!config.normalize || hasParams(calc))
        ? runWithOwner(owner, () => createMemo(calc, undefined, options))
        : calc;
    });
  }

  // eager (loop keys)
  const result: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    const calc = getter(key);
    if (config.deep && isReactiveObject(value))
      result[key] = destructure(calc, { ...config, memo });
    else
      result[key] =
        memo && (!config.normalize || !hasParams(calc))
          ? createMemo(calc, undefined, options)
          : calc;
  }
  return result;
}

//access function plus check for variadic params
const getNormalizedValue = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
  typeof v === "function" && !hasParams(v) ? v() : v;

function hasParams(func: any) {
  // Convert the function to a string and check if it includes "arguments"
  if (typeof func !== "function") return false;
  if (func.length > 0) return true;
  const funcString = func.toString();
  const paramsPos = funcString.match(/\(.*?\)/); //get pos of first parantethes
  return funcString.includes("arguments") || /\(\s*\.\.\.\s*[^\)]+\)/.test(paramsPos[0]);
}
