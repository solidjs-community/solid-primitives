import { AnyFunction, AnyObject, chain } from "@solid-primitives/utils";
import { JSX, mergeProps } from "solid-js";
import { MergeProps } from "./utils";

const extractCSSregex = /([^:; ]*):\s*([^;\n]*)/g;

export function stringStyleToObject(style: string): JSX.CSSProperties {
  const object: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = extractCSSregex.exec(style))) {
    object[match[1]] = match[2];
  }
  return object;
}

export function combineStyle(a: string, b: string): string;
export function combineStyle(a: JSX.CSSProperties, b: JSX.CSSProperties): JSX.CSSProperties;
export function combineStyle(
  a: JSX.CSSProperties | string,
  b: JSX.CSSProperties | string
): JSX.CSSProperties;
export function combineStyle(
  a: JSX.CSSProperties | string,
  b: JSX.CSSProperties | string
): JSX.CSSProperties | string {
  if (typeof a === "object" && typeof b === "object") return { ...a, ...b };
  if (typeof a === "string" && typeof b === "string") return `${a};${b}`;

  const objA = typeof a === "object" ? a : stringStyleToObject(a);
  const objB = typeof b === "object" ? b : stringStyleToObject(b);

  return { ...objA, ...objB };
}

type EventPropKeys<T extends string> = T extends `on${string}` ? T : never;

type CombinePropsInput = {
  class?: string;
  className?: string;
  classList?: Record<string, boolean | undefined>;
  style?: JSX.CSSProperties | string;
  ref?: Element | ((el: any) => void);
} & {
  [K in EventPropKeys<keyof JSX.DOMAttributes<Element>>]?: JSX.DOMAttributes<Element>[K];
} & Record<PropertyKey, any>;

type CombineProps<T extends AnyObject> = {
  [K in keyof T]: K extends "style" ? JSX.CSSProperties | string : T[K];
};

export function combineProps<T extends CombinePropsInput[]>(
  ...sources: T
): CombineProps<MergeProps<T>> {
  if (sources.length === 0) return {} as CombineProps<MergeProps<T>>;
  if (sources.length === 1) return sources[0] as CombineProps<MergeProps<T>>;

  const merge = mergeProps(...sources) as CombineProps<MergeProps<T>>;

  const reduce = <K extends keyof CombinePropsInput>(
    key: K,
    calc: (
      a: NonNullable<CombinePropsInput[K]>,
      b: NonNullable<CombinePropsInput[K]>
    ) => CombinePropsInput[K]
  ) => {
    let v: CombinePropsInput[K] = undefined;
    for (const props of sources) {
      const propV = props[key];
      if (!v) v = propV;
      else if (propV) v = calc(v, propV);
    }
    return v;
  };

  return new Proxy(merge, {
    get(target, key) {
      if (typeof key !== "string") return Reflect.get(target, key);

      if (key === "style") return reduce("style", combineStyle);

      // Chain events/ref assignments
      if (
        key === "ref" ||
        // This is a lot faster than a regex.
        (key[0] === "o" &&
          key[1] === "n" &&
          key.charCodeAt(2) >= /* 'A' */ 65 &&
          key.charCodeAt(2) <= /* 'Z' */ 90)
      ) {
        const callbacks: AnyFunction[] = [];
        for (const props of sources) {
          const cb = props[key as "onClick"];
          if (cb) callbacks.push(cb as AnyFunction);
        }
        return chain(...callbacks);
      }

      // Merge classes or classNames
      if (key === "class" || key === "className") return reduce(key, (a, b) => `${a} ${b}`);

      // Merge classList objects, keys in the last object overrides all previous ones.
      if (key === "classList") return reduce(key, (a, b) => ({ ...a, ...b }));

      return Reflect.get(target, key);
    }
  });
}
