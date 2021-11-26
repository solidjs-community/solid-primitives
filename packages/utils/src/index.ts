import type { Accessor } from 'solid-js'

//
// GENERAL HELPERS:
//

export type Fn<R = void> = () => R
export type Many<T> = T | T[]
/**
 * Infers the element type of an array
 */
export type ItemsOf<T> = T extends (infer E)[] ? E : never
export type MaybeAccessor<T> = T | Accessor<T>
export type MaybeAccessorValue<T extends MaybeAccessor<any>> = T extends Fn ? ReturnType<T> : T

export const access = <T extends MaybeAccessor<any>>(v: T): MaybeAccessorValue<T> =>
   typeof v === 'function' ? (v as any)() : v

export const accessAsArray = <T extends MaybeAccessor<any>, V = MaybeAccessorValue<T>>(
   value: T,
): V extends any[] ? V : V[] => {
   const _value = access(value)
   return Array.isArray(_value) ? (_value as any) : [_value]
}

export const withAccess = <T, A extends MaybeAccessor<T>, V = MaybeAccessorValue<A>>(
   value: A,
   fn: (value: NonNullable<V>) => void,
) => {
   const _value = access(value)
   if (typeof _value !== 'undefined' && _value !== null) fn(_value as NonNullable<V>)
}

export const promiseTimeout = (
   ms: number,
   throwOnTimeout = false,
   reason = 'Timeout',
): Promise<void> =>
   new Promise((resolve, reject) =>
      throwOnTimeout ? setTimeout(() => reject(reason), ms) : setTimeout(resolve, ms),
   )

//
// SIGNAL BUILDERS:
//

export const stringConcat = (...a: MaybeAccessor<any>[]): string =>
   a.reduce((t: string, c) => t + access(c), '') as string

export const concat = <A extends MaybeAccessor<any>[], V = MaybeAccessorValue<ItemsOf<A>>>(
   ...a: A
): Array<V extends any[] ? ItemsOf<V> : V> =>
   a.reduce((t, c) => {
      const v = access(c)
      return Array.isArray(v) ? [...t, ...v] : [...t, v]
   }, [])

export const toFloat = (string: MaybeAccessor<string>): number => Number.parseFloat(access(string))

export const toInt = (string: MaybeAccessor<string>, radix?: number): number =>
   Number.parseInt(access(string), radix)

export const toArray = <A extends MaybeAccessor<any>[]>(
   ...a: A
): MaybeAccessorValue<ItemsOf<A>>[] => a.map(v => access(v))
