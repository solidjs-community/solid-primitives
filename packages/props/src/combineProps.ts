import { AnyObject, chain } from "@solid-primitives/utils";
import { JSX, mergeProps } from "solid-js";
import { MergeProps } from "./utils";

const extractCSSregex = /([^:; ]*):\s*([^;]*)/g;

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

type CombinePropsInputOf<El extends Element> = {
  class?: string;
  className?: string;
  classList?: Record<string, boolean | undefined>;
  style?: JSX.CSSProperties | string;
  ref?: El | ((el: El) => void);
} & {
  [K in EventPropKeys<keyof JSX.DOMAttributes<El>>]?: JSX.DOMAttributes<El>[K];
};

export type CombinePropsInput = CombinePropsInputOf<Element>;

export type CombineProps<T extends AnyObject> = {
  [K in keyof T]: K extends "style" ? JSX.CSSProperties | string : T[K];
};

export function combineProps<T extends CombinePropsInput[]>(
  ...sources: T
): CombineProps<MergeProps<T>> {
  const merge = mergeProps(...sources) as CombineProps<MergeProps<T>>;

  const reduce = <K extends keyof CombinePropsInput>(
    key: K,
    calc: (
      a: NonNullable<CombinePropsInput[K]>,
      b: NonNullable<CombinePropsInput[K]>
    ) => CombinePropsInput[K]
  ): CombinePropsInput[K] =>
    sources.reduce((a, props) => {
      if (!a) return props[key];
      if (!props[key]) return a;
      return calc(a!, props[key]!);
    }, sources[0]?.[key]);

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
      )
        return reduce(key as any, chain);

      // Merge classes or classNames
      if (key === "class" || key === "className") reduce(key, (a, b) => `${a} ${b}`);

      // Merge classList objects, keys in the last object overrides all previous ones.
      if (key === "classList") reduce(key, (a, b) => ({ ...a, ...b }));

      return Reflect.get(target, key);
    }
  });
}
