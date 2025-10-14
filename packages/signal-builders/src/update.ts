import {
  type ModifyValue,
  type UpdateSetter,
  update as _update,
} from "@solid-primitives/utils/immutable";
import { accessArray, type MaybeAccessor, type MaybeAccessorValue } from "@solid-primitives/utils";
import { type Accessor, createMemo } from "solid-js";

export type Update = {
  <
    A extends MaybeAccessor<object>,
    O extends MaybeAccessorValue<A>,
    K0 extends keyof O,
    K1 extends keyof O[K0],
    K2 extends keyof O[K0][K1],
    K3 extends keyof O[K0][K1][K2],
    K4 extends keyof O[K0][K1][K2][K3],
    V,
  >(
    object: A,
    k0: MaybeAccessor<K0>,
    k1: MaybeAccessor<K1>,
    k2: MaybeAccessor<K2>,
    k3: MaybeAccessor<K3>,
    k4: MaybeAccessor<K4>,
    setter: UpdateSetter<O[K0][K1][K2][K3], K4, V>,
  ): Accessor<
    ModifyValue<
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
    >
  >;
  <
    A extends MaybeAccessor<object>,
    O extends MaybeAccessorValue<A>,
    K0 extends keyof O,
    K1 extends keyof O[K0],
    K2 extends keyof O[K0][K1],
    K3 extends keyof O[K0][K1][K2],
    V,
  >(
    object: A,
    k0: MaybeAccessor<K0>,
    k1: MaybeAccessor<K1>,
    k2: MaybeAccessor<K2>,
    k3: MaybeAccessor<K3>,
    setter: UpdateSetter<O[K0][K1][K2], K3, V>,
  ): Accessor<
    ModifyValue<
      O,
      K0,
      ModifyValue<O[K0], K1, ModifyValue<O[K0][K1], K2, ModifyValue<O[K0][K1][K2], K3, V>>>
    >
  >;
  <
    A extends MaybeAccessor<object>,
    O extends MaybeAccessorValue<A>,
    K0 extends keyof O,
    K1 extends keyof O[K0],
    K2 extends keyof O[K0][K1],
    V,
  >(
    object: A,
    k0: MaybeAccessor<K0>,
    k1: MaybeAccessor<K1>,
    k2: MaybeAccessor<K2>,
    setter: UpdateSetter<O[K0][K1], K2, V>,
  ): Accessor<ModifyValue<O, K0, ModifyValue<O[K0], K1, ModifyValue<O[K0][K1], K2, V>>>>;
  <
    A extends MaybeAccessor<object>,
    O extends MaybeAccessorValue<A>,
    K0 extends keyof O,
    K1 extends keyof O[K0],
    V,
  >(
    object: A,
    k0: MaybeAccessor<K0>,
    k1: MaybeAccessor<K1>,
    setter: UpdateSetter<O[K0], K1, V>,
  ): Accessor<ModifyValue<O, K0, ModifyValue<O[K0], K1, V>>>;
  <A extends MaybeAccessor<object>, O extends MaybeAccessorValue<A>, K extends keyof O, V>(
    object: A,
    key: MaybeAccessor<K>,
    setter: UpdateSetter<O, K, V>,
  ): Accessor<ModifyValue<O, K, V>>;
};

/**
 * Signal Builder: Change single value in an object by key. Allows accessign nested objects by passing multiple keys.
 */
export const update: Update = (...args: any[]) =>
  createMemo(() => _update(...(accessArray(args) as [any, any, any])));
