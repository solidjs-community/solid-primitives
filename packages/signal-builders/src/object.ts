import {
  access,
  accessArray,
  type MaybeAccessor,
  type MaybeAccessorValue,
  type Modify,
} from "@solid-primitives/utils";
import { type Accessor, createMemo } from "solid-js";
import * as _ from "@solid-primitives/utils/immutable";

/**
 * Reactively creates a new object with the specified keys omitted.
 * @example
 * const [obj, setObj] = createSignal({ a: 1, b: 2, c: 3 });
 * omit(obj, "b")(); // => { a: 1, c: 3 }
 */
export const omit = <
  A extends MaybeAccessor<object>,
  O extends MaybeAccessorValue<A>,
  K extends keyof O,
>(
  object: A,
  ...keys: MaybeAccessor<K>[]
): Accessor<Omit<O, K>> => createMemo(() => _.omit<any, any>(access(object), ...accessArray(keys)));

/**
 * Reactively creates a new object containing only the specified keys.
 * @example
 * const [obj, setObj] = createSignal({ a: 1, b: 2, c: 3 });
 * pick(obj, "a", "c")(); // => { a: 1, c: 3 }
 */
export const pick = <
  A extends MaybeAccessor<object>,
  O extends MaybeAccessorValue<A>,
  K extends keyof O,
>(
  object: A,
  ...keys: MaybeAccessor<K>[]
): Accessor<Pick<O, K>> => createMemo(() => _.pick<any, any>(access(object), ...accessArray(keys)));

/**
 * Reactively reads a property at a key path. Supports up to 6 levels deep with full type inference.
 * Any argument can be a signal or a plain value.
 * @example
 * const [user, setUser] = createSignal({ profile: { name: "Alice" } });
 * get(user, "profile", "name")(); // => "Alice"
 */
export function get<O extends object, K extends keyof O>(
  obj: MaybeAccessor<O>,
  key: MaybeAccessor<K>,
): Accessor<O[K]>;
export function get<O extends object, K1 extends keyof O, K2 extends keyof O[K1]>(
  obj: MaybeAccessor<O>,
  k1: MaybeAccessor<K1>,
  k2: MaybeAccessor<K2>,
): Accessor<O[K1][K2]>;
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
>(
  obj: MaybeAccessor<O>,
  k1: MaybeAccessor<K1>,
  k2: MaybeAccessor<K2>,
  k3: MaybeAccessor<K3>,
): Accessor<O[K1][K2][K3]>;
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3],
>(
  obj: MaybeAccessor<O>,
  k1: MaybeAccessor<K1>,
  k2: MaybeAccessor<K2>,
  k3: MaybeAccessor<K3>,
  k4: MaybeAccessor<K4>,
): Accessor<O[K1][K2][K3][K4]>;
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3],
  K5 extends keyof O[K1][K2][K3][K4],
>(
  obj: MaybeAccessor<O>,
  k1: MaybeAccessor<K1>,
  k2: MaybeAccessor<K2>,
  k3: MaybeAccessor<K3>,
  k4: MaybeAccessor<K4>,
  k5: MaybeAccessor<K5>,
): Accessor<O[K1][K2][K3][K4][K5]>;
export function get<
  O extends object,
  K1 extends keyof O,
  K2 extends keyof O[K1],
  K3 extends keyof O[K1][K2],
  K4 extends keyof O[K1][K2][K3],
  K5 extends keyof O[K1][K2][K3][K4],
  K6 extends keyof O[K1][K2][K3][K4][K5],
>(
  obj: MaybeAccessor<O>,
  k1: MaybeAccessor<K1>,
  k2: MaybeAccessor<K2>,
  k3: MaybeAccessor<K3>,
  k4: MaybeAccessor<K4>,
  k5: MaybeAccessor<K5>,
  k6: MaybeAccessor<K6>,
): Accessor<O[K1][K2][K3][K4][K5][K6]>;
export function get(obj: any, ...keys: any[]) {
  return createMemo(() => _.get(access(obj), ...(accessArray(keys) as [any, any])));
}

/**
 * Reactively shallow-merges objects — later arguments override earlier ones for matching keys.
 * Only top-level properties are combined; nested objects are replaced, not merged.
 * @example
 * const [defaults, setDefaults] = createSignal({ color: "blue", size: 12 });
 * const [overrides, setOverrides] = createSignal({ size: 16 });
 * merge(defaults, overrides)(); // => { color: "blue", size: 16 }
 */
export function merge<A extends object, B extends object>(
  a: MaybeAccessor<A>,
  b: MaybeAccessor<B>,
): Accessor<Modify<A, B>>;
export function merge<A extends object, B extends object, C extends object>(
  a: MaybeAccessor<A>,
  b: MaybeAccessor<B>,
  c: MaybeAccessor<C>,
): Accessor<Modify<Modify<A, B>, C>>;
export function merge<A extends object, B extends object, C extends object, D extends object>(
  a: MaybeAccessor<A>,
  b: MaybeAccessor<B>,
  c: MaybeAccessor<C>,
  d: MaybeAccessor<D>,
): Accessor<Modify<Modify<Modify<A, B>, C>, D>>;
export function merge<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
>(
  a: MaybeAccessor<A>,
  b: MaybeAccessor<B>,
  c: MaybeAccessor<C>,
  d: MaybeAccessor<D>,
  e: MaybeAccessor<E>,
): Accessor<Modify<Modify<Modify<Modify<A, B>, C>, D>, E>>;
export function merge<
  A extends object,
  B extends object,
  C extends object,
  D extends object,
  E extends object,
  F extends object,
>(
  a: MaybeAccessor<A>,
  b: MaybeAccessor<B>,
  c: MaybeAccessor<C>,
  d: MaybeAccessor<D>,
  e: MaybeAccessor<E>,
  f: MaybeAccessor<F>,
): Accessor<Modify<Modify<Modify<Modify<Modify<A, B>, C>, D>, E>, F>>;
export function merge(...objects: object[]) {
  return createMemo(() => _.merge(...(accessArray(objects) as [object, object])));
}
