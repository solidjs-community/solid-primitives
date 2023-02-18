import { createContextProvider } from "@solid-primitives/context";
import { Accessor, createSignal, FlowComponent, Setter } from "solid-js";
import { deepReadObject } from "./i18n";

export type I18nFormatOptions = Record<string, string | number>;

export type I18nObject = {
  readonly [x: string]: string | ((...args: any) => any) | I18nObject;
};

type I18nFormatArgs = Record<string, string | number>;

export type I18nPath<T extends I18nObject> = {
  [K in keyof T]: T[K] extends I18nObject
    ? I18nPath<T[K]>
    : T[K] extends (options: infer OptionsArgs) => string
    ? (options: OptionsArgs) => string
    : (options?: I18nFormatArgs) => string;
};

export type Dictionaries<T extends I18nObject> = { [key: string]: T };

type AddFunctionLengths<T> = T extends string
  ? string
  : T extends (...args: infer A) => unknown
  ? T & { __length: A["length"] }
  : { [K in keyof T]: AddFunctionLengths<T[K]> };

type RemoveFunctionLengths<T> = T extends string
  ? string
  : T extends (args: infer A) => infer R
  ? (args: A) => R
  : { [K in keyof T]: RemoveFunctionLengths<T[K]> };

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

type GuaranteeIdenticalSignatures<T extends Dictionaries<I18nObject>> = Record<
  keyof T,
  RemoveFunctionLengths<UnionToIntersection<AddFunctionLengths<T[keyof T]>>>
>;

function buildChainedDictionary<T extends I18nObject>(obj: T): I18nPath<T> {
  const mapped = {} as Record<string, any>;
  for (const [key, value] of Object.entries(obj)) {
    switch (typeof value) {
      case "object":
        mapped[key] = buildChainedDictionary(value);
        break;
      case "function":
        mapped[key] = value;
        break;
      case "string":
        mapped[key] = (args: I18nFormatOptions) =>
          value.replace(/{{([^{}]+)}}/g, (_, key) => deepReadObject(args, key, ""));
        break;
      default:
        throw new Error(
          process.env.DEV
            ? `Unsupported data format on the keys. Values must resolve to a string or a function that returns a string. Key name: "${key}"`
            : ""
        );
    }
  }
  return mapped as I18nPath<T>;
}

export type ChainedI18n<T extends Dictionaries<I18nObject>> = [
  tranlate: I18nPath<T>[keyof T],
  utils: {
    locale: Accessor<keyof T>;
    setLocale: Setter<keyof T>;
    getDictionary: (locale?: keyof T) => T[keyof T];
  }
];

export function createChainedI18nDictionary<T extends Dictionaries<I18nObject>>(
  dictionaries: T & GuaranteeIdenticalSignatures<T>
): I18nPath<T & GuaranteeIdenticalSignatures<T>> {
  const dict = {} as I18nPath<T & GuaranteeIdenticalSignatures<T>>;
  for (const locale in dictionaries) {
    dict[locale] = buildChainedDictionary(dictionaries[locale]);
  }
  return dict;
}

export function createChainedI18n<T extends Dictionaries<I18nObject>>(props: {
  dictionaries: T & GuaranteeIdenticalSignatures<T>;
  locale: keyof T;
}): ChainedI18n<T> {
  type K = keyof T;

  const [locale, setLocale] = createSignal<K>(props.locale as K);
  const [translations] = createSignal(createChainedI18nDictionary(props.dictionaries));

  const translate = new Proxy(
    { translate: translations()[locale()] },
    {
      get(_: any, prop: any) {
        return (translations()[locale()] as any)[prop];
      }
    }
  ) as I18nPath<T>[keyof T];

  return [
    translate,
    {
      locale,
      setLocale,
      getDictionary(language?: K): T[K] {
        if (language) return props.dictionaries[language];
        return props.dictionaries[locale()];
      }
    }
  ];
}

export function createChainedI18nContext<T extends Dictionaries<I18nObject>>(
  props: Parameters<typeof createChainedI18n<T>>[0],
  setFallback: true
): [I18nProvider: FlowComponent, useI18n: () => ChainedI18n<T>];
export function createChainedI18nContext<T extends Dictionaries<I18nObject>>(
  props: Parameters<typeof createChainedI18n<T>>[0],
  setFallback?: boolean
): [I18nProvider: FlowComponent, useI18n: () => ChainedI18n<T> | null];
export function createChainedI18nContext<T extends Dictionaries<I18nObject>>(
  props: Parameters<typeof createChainedI18n<T>>[0],
  setFallback?: boolean
) {
  const i18n = createChainedI18n(props);
  return createContextProvider(() => i18n, setFallback ? i18n : null);
}
