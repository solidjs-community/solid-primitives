import { access, accessArray, MaybeAccessor, MaybeAccessorValue } from "@solid-primitives/utils";
import * as _ from "@solid-primitives/immutable";
import { Accessor, createMemo } from "solid-js";

//
// STRING
//

export const toFloat = (string: MaybeAccessor<string>): Accessor<number> =>
  createMemo(() => Number.parseFloat(access(string)));

export const toInt = (string: MaybeAccessor<string>, radix?: number): Accessor<number> =>
  createMemo(() => Number.parseInt(access(string), radix));

export const stringConcat = (...a: MaybeAccessor<any>[]): Accessor<string> =>
  createMemo(() => a.reduce((t: string, c) => t + access(c), "") as string);

//
// NUMBER
//

export * from "./number";

//
// ARRAY
//

export * from "./array";

//
// OBJECT
//

export const omit = <
  A extends MaybeAccessor<object>,
  O extends MaybeAccessorValue<A>,
  K extends keyof O
>(
  object: A,
  ...keys: MaybeAccessor<K>[]
): Accessor<Omit<O, K>> => createMemo(() => _.omit<any, any>(access(object), ...accessArray(keys)));

export const pick = <
  A extends MaybeAccessor<object>,
  O extends MaybeAccessorValue<A>,
  K extends keyof O
>(
  object: A,
  ...keys: MaybeAccessor<K>[]
): Accessor<Pick<O, K>> => createMemo(() => _.pick<any, any>(access(object), ...accessArray(keys)));

export * from "./update";
