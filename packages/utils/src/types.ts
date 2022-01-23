import type { Accessor } from "solid-js";

/**
 * A function
 */
export type Fn<R = void> = () => R;
export type Get<T> = (v: T) => void;

/**
 * Can be single or in an array
 */
export type Many<T> = T | T[];

export type Keys<O extends Object> = keyof O;
export type Values<O extends Object> = O[Keys<O>];

export type Noop = (...a: any[]) => void;

/**
 * Infers the type of the array elements
 */
export type ItemsOf<T> = T extends (infer E)[] ? E : never;

export type Predicate<T> = (item: T, index: number, array: readonly T[]) => boolean;
export type MappingFn<T, V> = (item: T, index: number, array: readonly T[]) => V;

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
export type MaybeAccessorValue<T extends MaybeAccessor<any>> = T extends Fn ? ReturnType<T> : T;

export type OnAccessEffectFunction<S, Prev, Next extends Prev = Prev> = (
  input: AccessReturnTypes<S>,
  prevInput: AccessReturnTypes<S>,
  v: Prev
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

export type AnyObject = Record<string, any>;
export type AnyFunction = (...args: any[]) => any;

export type PrimitiveValue = string | boolean | number | bigint | symbol | null | undefined;

export type FalsyValue = false | 0 | "" | null | undefined;
export type Truthy<T> = T extends FalsyValue ? never : T;
export type Falsy<T> = T extends FalsyValue ? T : never;

/**
 * Destructible store object, with values changed to accessors
 */
export type Destore<T extends Object> = {
  [K in keyof T]: T[K] extends Function ? T[K] : Accessor<T[K]>;
};
