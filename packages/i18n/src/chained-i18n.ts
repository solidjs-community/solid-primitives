import { createContextProvider } from "@solid-primitives/context";
import { Accessor, createSignal, FlowComponent, Setter, DEV } from "solid-js";
import { isServer } from "solid-js/web";
import { deepReadObject } from "./i18n.js";

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
          !isServer && DEV
            ? `Unsupported data format on the keys. Values must resolve to a string or a function that returns a string. Key name: "${key}"`
            : "",
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
  },
];

/**
 * Creates chained dictionaries with callable end paths. IE dictionaries.en.hello()
 *
 * @param dictionaries {Record<string, Record<string, string | Function>} objects to parse for translations. End paths can be a string or function that returns a string
 * @returns dictionaries {Record<locale, Record<string, Function | Record<string, Function | etc>} chained dictionaries with callable end paths to get the translation.
 */
export function createChainedI18nDictionary<T extends Dictionaries<I18nObject>>(
  dictionaries: T & GuaranteeIdenticalSignatures<T>,
): I18nPath<T & GuaranteeIdenticalSignatures<T>> {
  const dict = {} as I18nPath<T & GuaranteeIdenticalSignatures<T>>;
  for (const locale in dictionaries) {
    dict[locale] = buildChainedDictionary(dictionaries[locale]);
  }
  return dict;
}

/**
 * Creates a chained dictionary and manages the locale. Provides a proxy wrapper around translate so you can do chained calls that always returns with the current locale. IE t.hello()
 *
 * @param props {{ dictionaries: Record<string, Record<string, string | Function | Record<>>; locale: keyof dictionaries. IE 'en' | 'es' | 'fr' }}
 * @returns [{ translate: chained dictionary with current locale path }, { locale: Accessor for current locale, setLocale: (locale: keyof dictionaries): => void; getDictionary(locale?: keyof dictionaries) => dictionaries[locale] }]
 *
 * @example
 * const dictionaries = { en: { hello: "Hello {{ name }}! "}, fr: { hello: "Bonjour {{ name }}!" }}
 *
 * createChainedI18n({ dictionaries, locale: "en" })
 */
export function createChainedI18n<T extends Dictionaries<I18nObject>>(props: {
  dictionaries: T & GuaranteeIdenticalSignatures<T>;
  locale: keyof T;
}): ChainedI18n<T> {
  const [locale, setLocale] = createSignal<keyof T>(props.locale);
  const [translations] = createSignal(createChainedI18nDictionary(props.dictionaries));

  /**
   * Translate function for i18n. Wrapped with a proxy so you always get the current locales dictionary and do not need to call it as it's invoked in the proxy. Example builds off of the example for createChainedI18n
   *
   * @example
   * ```tsx
   * const [t, { setLocale }] = createChainedI18n({ dictionaries, locale })
   *
   * t.hello({ name: "John" })
   * // => "Hello John!"
   *
   * setLocale("fr");
   * t.hello({ name: "John" })
   * // => "Bonjour John!"
   */
  const translate = new Proxy(
    { translate: translations()[locale()] },
    {
      get(_: any, prop: any) {
        return (translations()[locale()] as any)[prop];
      },
    },
  ) as I18nPath<T>[keyof T];

  return [
    translate,
    {
      /**
       * Accessor that returns the current locale.
       */
      locale,
      /**
       * Setter that takes in a locale (keyof dictionaries) and sets it as the current locale.
       */
      setLocale,
      /**
       *
       * @param language Optional keyof dictionaries. If one is not passed in, it uses the currently selected one.
       * @returns The dictionary of the language passed in or the currently selected locale
       */
      getDictionary(language?: keyof T): T[keyof T] {
        if (language) return props.dictionaries[language];
        return props.dictionaries[locale()];
      },
    },
  ];
}

/**
 * Creates chained I18n state wrapped in a Context Provider to be shared with the app using the component tree.
 *
 * Wraps {@link createChainedI18n}
 *
 * @param props Props for createChainedI18n
 * @param setFallback Sets the context on creation for a global i18n.
 */
export function createChainedI18nContext<T extends Dictionaries<I18nObject>>(
  props: Parameters<typeof createChainedI18n<T>>[0],
  setFallback: true,
): [I18nProvider: FlowComponent, useI18n: () => ChainedI18n<T>];
export function createChainedI18nContext<T extends Dictionaries<I18nObject>>(
  props: Parameters<typeof createChainedI18n<T>>[0],
  setFallback?: boolean,
): [I18nProvider: FlowComponent, useI18n: () => ChainedI18n<T> | null];
export function createChainedI18nContext<T extends Dictionaries<I18nObject>>(
  props: Parameters<typeof createChainedI18n<T>>[0],
  setFallback?: boolean,
) {
  const i18n = createChainedI18n(props);
  return createContextProvider(() => i18n, setFallback ? i18n : null);
}
