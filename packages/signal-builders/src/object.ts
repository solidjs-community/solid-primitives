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
 * Signal Builder: Create a new subset object without the provided keys
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
 * Signal Builder: Create a new subset object with only the provided keys
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
 * Signal Builder: Get a single property value of an object by specifying a path to it.
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
  return _.get(access(obj), ...(accessArray(keys) as [any, any]));
}

/**
 * Signal Builder: Merges multiple objects into a single one. Only the first level of properties is merged.
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
  return _.merge(...(accessArray(objects) as [object, object]));
}
