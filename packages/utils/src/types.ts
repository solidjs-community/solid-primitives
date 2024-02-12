import type { Accessor, Setter } from "solid-js";

export type { EffectOptions, OnOptions } from "solid-js";

/**
 * Can be single or in an array
 */
export type Many<T> = T | T[];
export type Values<O extends Object> = O[keyof O];

export type Noop = (...a: any[]) => void;

export type Directive<P = true> = (el: Element, props: Accessor<P>) => void;

/**
 * Infers the type of the array elements
 */
export type ItemsOf<T> = T extends (infer E)[] ? E : never;
export type ItemsOfMany<T> = T extends any[] ? ItemsOf<T> : T;

export type SetterParam<T> = Parameters<Setter<T>>[0];

/**
 * T or a reactive/non-reactive function returning T
 */
export type MaybeAccessor<T> = T | Accessor<T>;
/**
 * Accessed value of a MaybeAccessor
 * @example
 * ```ts
 * MaybeAccessorValue<MaybeAccessor<string>>
 * // => string
 * MaybeAccessorValue<MaybeAccessor<() => string>>
 * // => string | (() => string)
 * MaybeAccessorValue<MaybeAccessor<string> | Function>
 * // => string | void
 * ```
 */
export type MaybeAccessorValue<T extends MaybeAccessor<any>> = T extends () => any
  ? ReturnType<T>
  : T;

export type OnAccessEffectFunction<S, Prev, Next extends Prev = Prev> = (
  input: AccessReturnTypes<S>,
  prevInput: AccessReturnTypes<S>,
  v: Prev,
) => Next;

export type AccessReturnTypes<S> = S extends MaybeAccessor<any>[]
  ? {
      [I in keyof S]: AccessReturnTypes<S[I]>;
    }
  : MaybeAccessorValue<S>;

/** Allows to make shallow overwrites to an interface */
export type Modify<T, R> = Omit<T, keyof R> & R;

/** Allows to make nested overwrites to an interface */
export type ModifyDeep<A extends AnyObject, B extends DeepPartialAny<A>> = {
  [K in keyof A]: B[K] extends never
    ? A[K]
    : B[K] extends AnyObject
      ? ModifyDeep<A[K], B[K]>
      : B[K];
} & (A extends AnyObject ? Omit<B, keyof A> : A);

/** Makes each property optional and turns each leaf property into any, allowing for type overrides by narrowing any. */
export type DeepPartialAny<T> = {
  [P in keyof T]?: T[P] extends AnyObject ? DeepPartialAny<T[P]> : any;
};

/** Removes the `[...list]` functionality */
export type NonIterable<T> = T & {
  [Symbol.iterator]: never;
};

/** Get the required keys of an object */
export type RequiredKeys<T> = keyof {
  [K in keyof T as T extends { [_ in K]: unknown } ? K : never]: 0;
};

/** Remove the first item of a tuple [1, 2, 3, 4] => [2, 3, 4] */
export type Tail<T extends any[]> = ((...t: T) => void) extends (x: any, ...u: infer U) => void
  ? U
  : never;

/** `A | B => A & B` */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type ExtractIfPossible<T, U> = Extract<T, U> extends never ? U : Extract<T, U>;

export type AnyObject = Record<PropertyKey, any>;
export type AnyStatic = [] | any[] | AnyObject;
export type AnyFunction = (...args: any[]) => any;
export type AnyClass = abstract new (...args: any) => any;

export type PrimitiveValue = PropertyKey | boolean | bigint | null | undefined;

export type FalsyValue = false | 0 | "" | null | undefined;
export type Truthy<T> = Exclude<T, FalsyValue>;
export type Falsy<T> = Extract<T, FalsyValue>;

export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

/** Unwraps the type definition of an object, making it more readable */
export type Simplify<T> = T extends object ? { [K in keyof T]: T[K] } : T;
/** Unboxes type definition, making it more readable */
export type UnboxLazy<T> = T extends () => infer U ? U : T;

type RawNarrow<T> =
  | (T extends [] ? [] : never)
  | (T extends string | number | bigint | boolean ? T : never)
  | { [K in keyof T]: T[K] extends Function ? T[K] : RawNarrow<T[K]> };

export type Narrow<T> = T extends [] ? T : RawNarrow<T>;

// Magic type that when used at sites where generic types are inferred from, will prevent those sites from being involved in the inference.
// https://github.com/microsoft/TypeScript/issues/14829
// TypeScript Discord conversation: https://discord.com/channels/508357248330760243/508357248330760249/911266491024949328
export type NoInfer<T> = [T][T extends any ? 0 : never];
