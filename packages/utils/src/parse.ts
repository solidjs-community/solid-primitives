import { access, ItemsOf, MaybeAccessor, MaybeAccessorValue } from ".";

export const stringConcat = (...a: MaybeAccessor<any>[]): string =>
  a.reduce((t: string, c) => t + access(c), "") as string;

export const concat = <A extends MaybeAccessor<any>[], V = MaybeAccessorValue<ItemsOf<A>>>(
  ...a: A
): Array<V extends any[] ? ItemsOf<V> : V> =>
  a.reduce((t, c) => {
    const v = access(c);
    return Array.isArray(v) ? [...t, ...v] : [...t, v];
  }, []);

export const toFloat = (string: MaybeAccessor<string>): number => Number.parseFloat(access(string));

export const toInt = (string: MaybeAccessor<string>, radix?: number): number =>
  Number.parseInt(access(string), radix);

export const toArray = <A extends MaybeAccessor<any>[]>(
  ...a: A
): MaybeAccessorValue<ItemsOf<A>>[] => a.map(v => access(v));
