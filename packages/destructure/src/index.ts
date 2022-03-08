import { createMemo, Accessor, runWithOwner, getOwner, onCleanup, createRoot } from "solid-js";
import {
  access,
  isFunction,
  MaybeAccessor,
  AnyObject,
  Values,
  isObject,
  isArray,
  AnyFunction,
  Fn
} from "@solid-primitives/utils";
import type { MemoOptions } from "solid-js/types/reactive/signal";
import { Store } from "solid-js/store";

type ReactiveSource = [] | any[] | AnyObject;

export type DestructureOptions<T extends ReactiveSource> = MemoOptions<Values<T>> & {
  cache?: boolean;
  lazy?: boolean;
  deep?: boolean;
};
export type GettersOptions = MemoOptions<any> & {
  deep?: boolean;
};

export type Spread<T extends ReactiveSource> = {
  readonly [K in keyof T]: Accessor<T[K]>;
};
export type DeepSpread<T extends ReactiveSource> = {
  readonly [K in keyof T]: T[K] extends ReactiveSource
    ? T[K] extends AnyFunction
      ? Accessor<T[K]>
      : DeepSpread<T[K]>
    : Accessor<T[K]>;
};
export type Destructure<T extends ReactiveSource> = {
  readonly [K in keyof T]-?: Accessor<T[K]>;
};
export type DeepDestructure<T extends ReactiveSource> = {
  readonly [K in keyof T]-?: T[K] extends ReactiveSource
    ? T[K] extends AnyFunction
      ? Accessor<T[K]>
      : DeepDestructure<T[K]>
    : Accessor<T[K]>;
};

const isReactiveObject = (value: any): boolean => isObject(value) || isArray(value);

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
      set: () => false
    }
  );
}

/**
 * Destructures an reactive object *(e.g. store or component props)* or a signal of one into a tuple/map of signals for each object key.
 * @param source reactive object or signal returning one
 * @param options memo options + primitive configuration:
 * - `cache` - wraps accessors in `createMemo`, making each property update independently. *(enabled by default for signal source)*
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
  options?: O
): O extends { lazy: true; deep: true }
  ? DeepDestructure<T>
  : O["lazy"] extends true
  ? Destructure<T>
  : O["deep"] extends true
  ? DeepSpread<T>
  : Spread<T> {
  const config: DestructureOptions<T> = options ?? {};
  const cache = config.cache ?? isFunction(source);
  const getter = isFunction(source)
    ? (key: any) => () => source()[key]
    : (key: any) => () => source[key];
  const obj = access(source);

  // lazy (use proxy)
  if (config.lazy) {
    const owner = getOwner()!;
    return createProxyCache(obj, key => {
      const calc = getter(key);
      if (config.deep && isReactiveObject(obj[key]))
        return runWithOwner(owner, () => destructure(calc, { ...config, cache }));
      return cache ? runWithOwner(owner, () => createMemo(calc, undefined, options)) : calc;
    });
  }

  // eager (loop keys)
  const result = obj.constructor();
  for (const [key, value] of Object.entries(obj)) {
    const calc = getter(key);
    if (config.deep && isReactiveObject(value))
      result[key] = destructure(calc, { ...config, cache });
    else result[key] = cache ? createMemo(calc, undefined, options) : calc;
  }
  return result;
}

function createProxyCacheGet<T extends ReactiveSource>(
  get: (key: keyof T) => Values<T>,
  options?: MemoOptions<Values<T>>
): [proxy: Readonly<T>, dispose: Fn] {
  const [root, dispose] = createRoot(dispose => [getOwner()!, dispose]);
  const getMemo = (key: keyof T) =>
    runWithOwner(root, () => createMemo(() => get(key), undefined, options));

  const proxy = new Proxy(
    {},
    {
      get(obj, key) {
        const saved = Reflect.get(obj, key);
        if (saved) saved();
        const memo = getMemo(key as keyof T);
        Reflect.set(obj, key, memo);
        return memo();
      },
      set: () => false
    }
  ) as T;
  return [proxy, dispose];
}

/**
 * Wraps object/array signal with getters for every key, making accessing properties similar to component props/store. Properties are cached with memos on access, so th primitive needs to be used in a reactive context.
 * @param signal signal source of the object to wrap
 * @param options memo options object + `deep` for wrapping nested objects as well (by default source object is wrapped shallowly)
 * @returns wrapped readonly object with reactive getters
 * @example
 * const [getUser, setUser] = createSignal({
 *    name: "John",
 *    age: 35,
 *    weaponOfChoice: "Machete"
 * })
 * const user = wrapGetters(getUser)
 * user.age // => 35 (reactive on updates to that property)
 */
export function wrapGetters<T extends ReactiveSource, O extends GettersOptions>(
  signal: Accessor<T>,
  options?: O
): O["deep"] extends true ? Store<T> : Readonly<T> {
  const proxies = new Map<object, { proxy: object; dispose: Fn }>();
  let trash: Set<object> | undefined;
  onCleanup(() => proxies.forEach(({ dispose }) => dispose()));
  return wrap(signal(), signal);

  function wrap<T extends ReactiveSource>(obj: T, signal: Accessor<T>): T {
    if (!trash) {
      // dispose and remove saved objects that weren't used from previous iteration
      trash = new Set(proxies.keys());
      queueMicrotask(() => {
        trash?.forEach(obj => {
          proxies.get(obj)!.dispose();
          proxies.delete(obj);
        });
        trash = undefined;
      });
    }
    if (proxies.has(obj)) {
      trash.delete(obj);
      return proxies.get(obj)!.proxy as T;
    }

    const [proxy, dispose] = createProxyCacheGet<T>(key => {
      const value = signal()[key];
      return options?.deep && isReactiveObject(value) ? wrap(value, () => signal()[key]) : value;
    }, options);

    proxies.set(obj, { proxy, dispose });
    return proxy;
  }
}
