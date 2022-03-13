import type { Accessor } from "solid-js";

/**
 * A function
 */
export type Fn<R = void> = () => R;
export type Get<T> = (v: T) => void;
export type Clear = () => void;

/**
 * Can be single or in an array
 */
export type Many<T> = T | T[];

export type Keys<O extends Object> = keyof O;
export type Values<O extends Object> = O[Keys<O>];

export type Noop = (...a: any[]) => void;

export type Directive<P = true> = (el: Element, props: Accessor<P>) => void;

/**
 * Infers the type of the array elements
 */
export type ItemsOf<T> = T extends (infer E)[] ? E : never;
export type ItemsOfMany<T> = T extends any[] ? ItemsOf<T> : T;

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

/** Removes the `[...list]` functionality */
export type NonIterable<T> = T & {
  [Symbol.iterator]: never;
};

/** An opposite of `Partial`. Makes all the keys required. */
export type Definite<T> = {
  [K in keyof T]-?: T[K];
};

/** `A | B => A & B` */
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type ExtractIfPossible<T, U> = Extract<T, U> extends never ? U : Extract<T, U>;

export type AnyObject = Record<string | symbol | number, any>;
export type AnyFunction = (...args: any[]) => any;
export type AnyClass = abstract new (...args: any) => any;

export type LiteralKey = string | number | symbol;
export type PrimitiveValue = string | boolean | number | bigint | symbol | null | undefined;

export type FalsyValue = false | 0 | "" | null | undefined;
export type Truthy<T> = Exclude<T, FalsyValue>;
export type Falsy<T> = Extract<T, FalsyValue>;

export type Fallback<T, F = NonNullable<T>> = NonNullable<T> | F;

export type TriggerCache<T> = {
  track: Get<T>;
  dirty: Get<T>;
  dirtyAll: Fn;
};

export type Trigger = [track: Fn, dirty: Fn];

export type Position = {
  x: number;
  y: number;
};

export type StaticStoreSetter<T extends [] | any[] | AnyObject> = {
  (setter: (prev: Readonly<T>) => Partial<Readonly<T>>): Readonly<T>;
  (state: Partial<Readonly<T>>): Readonly<T>;
  <K extends keyof T>(key: K, setter: (prev: T[K]) => T[K]): Readonly<T>;
  <K extends keyof T>(key: K, state: T[K]): Readonly<T>;
};
