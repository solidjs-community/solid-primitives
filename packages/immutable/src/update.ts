import { isFunction } from "@solid-primitives/utils";
import { withCopy } from "./copy";
import { ModifyValue } from "./types";

export type UpdateSetter<O, K extends keyof O, V> = V | ((prev: O[K]) => V);

export type Update = {
  <
    O extends object,
    K0 extends keyof O,
    K1 extends keyof O[K0],
    K2 extends keyof O[K0][K1],
    K3 extends keyof O[K0][K1][K2],
    K4 extends keyof O[K0][K1][K2][K3],
    V
  >(
    object: O,
    k0: K0,
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    setter: UpdateSetter<O[K0][K1][K2][K3], K4, V>
  ): ModifyValue<
    O,
    K0,
    ModifyValue<
      O[K0],
      K1,
      ModifyValue<
        O[K0][K1],
        K2,
        ModifyValue<O[K0][K1][K2], K3, ModifyValue<O[K0][K1][K2][K3], K4, V>>
      >
    >
  >;
  <
    O extends object,
    K0 extends keyof O,
    K1 extends keyof O[K0],
    K2 extends keyof O[K0][K1],
    K3 extends keyof O[K0][K1][K2],
    V
  >(
    object: O,
    k0: K0,
    k1: K1,
    k2: K2,
    k3: K3,
    setter: UpdateSetter<O[K0][K1][K2], K3, V>
  ): ModifyValue<
    O,
    K0,
    ModifyValue<O[K0], K1, ModifyValue<O[K0][K1], K2, ModifyValue<O[K0][K1][K2], K3, V>>>
  >;
  <O extends object, K0 extends keyof O, K1 extends keyof O[K0], K2 extends keyof O[K0][K1], V>(
    object: O,
    k0: K0,
    k1: K1,
    k2: K2,
    setter: UpdateSetter<O[K0][K1], K2, V>
  ): ModifyValue<O, K0, ModifyValue<O[K0], K1, ModifyValue<O[K0][K1], K2, V>>>;
  <O extends object, K0 extends keyof O, K1 extends keyof O[K0], V>(
    object: O,
    k0: K0,
    k1: K1,
    setter: UpdateSetter<O[K0], K1, V>
  ): ModifyValue<O, K0, ModifyValue<O[K0], K1, V>>;
  <O extends object, K extends keyof O, V>(
    object: O,
    key: K,
    setter: UpdateSetter<O, K, V>
  ): ModifyValue<O, K, V>;
};

/**
 * Change single value in an object by key. Allows accessign nested objects by passing multiple keys.
 *
 * Performs a shallow copy of each accessed object.
 *
 * @param object original source
 * @param ...keys keys of sequential accessed objects
 * @param value a value to set in place of a previous one, or a setter function.
 * ```ts
 * V | ((prev: O[K]) => V)
 * ```
 * a new value doesn't have to have the same type as the original
 * @returns changed copy of the original object
 *
 * @example
 * const original = { foo: { bar: { baz: 123 }}};
 * const newObj = update(original, "foo", "bar", "baz", prev => prev + 1)
 * original // { foo: { bar: { baz: 123 }}}
 * newObj // { foo: { bar: { baz: 124 }}}
 */
export const update: Update = (...args: any[]) =>
  withCopy(args[0], obj => {
    if (args.length > 3) obj[args[1]] = update(obj[args[1]], ...(args.slice(2) as [any, any]));
    else if (isFunction(args[2])) obj[args[1]] = args[2](obj[args[1]]);
    else obj[args[1]] = args[2];
  });
