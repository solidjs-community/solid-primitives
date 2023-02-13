import {
  createComponent,
  createContext,
  createMemo,
  createSignal,
  JSXElement,
  useContext
} from "solid-js";
import { createStore } from "solid-js/store";

/**
 * Safely access deep values in an object via a string path seperated by `.`
 *
 * @param obj {Record<string, unknown>} - The object to parse
 * @param path {string} - The path to search in the object
 * @param [defaultValue] {unknown} -  A default value if the path doesn't exist in the object
 *
 * @returns {any} - The value if found, the default provided value if set and not found, undefined otherwise
 *
 * @example
 *
 * ```js
 * const obj = { a: { b : { c: 'hello' } } };
 *
 * const value = deepReadObject(obj, 'a.b.c');
 * // => 'hello'
 * const notFound = deepReadObject(obj, 'a.b.d');
 * // => undefined
 * const notFound = deepReadObject(obj, 'a.b.d', 'not found');
 * // => 'not found'
 * ```
 */
const deepReadObject = <T = any>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown
): T => {
  const value = path
    .trim()
    .split(".")
    .reduce<any>((a, b) => (a ? a[b] : undefined), obj);
  return value !== undefined ? value : defaultValue;
};

/**
 * Provided a string template it will replace dynamics parts in place of variables.
 *
 * This util is largely inspired by [templite](https://github.com/lukeed/templite/blob/master/src/index.js)
 *
 * @param str {string} - The string you wish to use as template
 * @param params {Record<string, string>} - The params to inject into the template
 * @param [reg=/{{(.*?)}}/g] {RegExp} - The RegExp used to find and replace
 *
 * @returns {string} - The fully injected template
 *
 * @example
 * ```js
 * const txt = template('Hello {{ name }}', { name: 'Tom' });
 * // => 'Hello Tom'
 * ```
 */
const template = (str: string, params: Record<string, string>, reg: RegExp = /{{(.*?)}}/g): any =>
  str.replace(reg, (_, key) => deepReadObject(params, key, ""));

/**
 * This creates a I18nContext. It's extracted into a function to be able to type the Context
 * before it's even initialized.
 *
 * @param [init={}] {Record<string, Record<string, any>>} - Initial dictionary of languages
 * @param [lang=navigator.language] {string} - The default language fallback to browser language if not set
 * @param [options={}] { chained: boolean } -
 */
export const createI18nContext = (
  init: Record<string, Record<string, any>> = {},
  lang: string = typeof navigator !== "undefined" && navigator.language in init
    ? navigator.language
    : Object.keys(init)[0]
): [
  template: (key: string, params?: Record<string, string>, defaultValue?: string) => any,
  actions: {
    add(lang: string, table: Record<string, any>): void;
    locale: (lang?: string) => string;
    dict: (lang: string) => Record<string, Record<string, any>>;
  }
] => {
  const [locale, setLocale] = createSignal(lang);
  const [dict, setDict] = createStore(init);
  /**
   * The main translation function of the library. Given a key, it will look into its
   * dictionaries to find the right translation for that key and fallback to the default
   * translation provided in last argument (if provided).
   *
   * You can additionally give as a second arguments dynamic parameters to inject into the
   * the translation.
   *
   * @param key {string} - The key to look up a translation for
   * @param [params] {Record<string, string>} - Parameters to pass into the translation template
   * @param [defaultValue] {string} - Default value if the translation isn't found
   *
   * @returns {string} - The translated string
   *
   * @example
   * ```tsx
   * const [t] = useI18n();
   *
   * const dict = { fr: { hello: 'Bonjour {{ name }} !' } }
   * locale('fr')
   * t('hello', { name: 'John' }, 'Hello, {{ name }}!');
   * // => 'Bonjour John !'
   * locale('unknown')
   * t('hello', { name: 'Joe' }, 'Hello, {{ name }}!');
   * // => 'Hello, Joe!'
   * ```
   */
  const translate = (
    key: string,
    params?: Record<string, string>,
    defaultValue?: string
  ): string => {
    const val = deepReadObject(dict[locale()], key, defaultValue || "");
    if (typeof val === "function") return val(params);
    if (typeof val === "string") return template(val, params || {});
    return val as string;
  };
  const actions = {
    /**
     * Add (or edit an existing) locale
     *
     * @param lang {string} - The locale to add or edit
     * @param table {Record<string, any>} - The dictionary
     *
     * @example
     * ```js
     * const [_, { add }] = useI18n();
     *
     * const addSwedish = () => add('sw', { hello: 'Hej {{ name }}' })
     * ```
     */
    add(lang: string, table: Record<string, any>) {
      setDict(lang, t => Object.assign(t || {}, table));
    },
    /**
     * Switch to the language in the parameters.
     * Retrieve the current locale if no params
     *
     * @param [lang] {string} - The locale to switch to
     *
     * * @example
     * ```js
     * const [_, { locale }] = useI18n();
     *
     * locale()
     * // => 'fr'
     * locale('sw')
     * locale()
     * // => 'sw'
     *
     * ```
     */
    locale: (lang?: string) => (lang ? setLocale(lang) : locale()),
    /**
     * Retrieve the dictionary of a language
     *
     * @param lang {string} - The language to retrieve from
     */
    dict: (lang: string) => deepReadObject(dict, lang)
  };
  return [translate, actions as any];
};

type I18nContextInterface = ReturnType<typeof createI18nContext>;

export const I18nContext = createContext<I18nContextInterface>({} as I18nContextInterface);
export const useI18n = () => useContext(I18nContext);

// -------------------------- Chained I18n -------------------
type I18nFormatArgs = Record<string, string | number>;

export type I18nPath<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? I18nPath<T[K]>
    : T[K] extends (...args: any) => string
    ? (...args: Parameters<T[K]>) => string
    : T[K] extends string
    ? (args?: I18nFormatArgs) => string
    : never;
};

const buildI18nChain = <T>(obj: T): I18nPath<T> => {
  const keys = Object.keys(obj as any) as (keyof T)[];
  const paths = keys.reduce((acc, key) => {
    const value = obj[key];
    if (typeof value === "object") {
      return {
        ...acc,
        [key]: buildI18nChain(value)
      } as any;
    } else if (typeof value === "function") {
      return {
        ...acc,
        [key]: obj[key]
      };
    }
    if (typeof value === "string") {
      return {
        ...acc,
        [key]: (args: I18nFormatArgs) => {
          return value.replace(/{{(.*?)}}/g, (_, key) => deepReadObject(args, key, ""));
        }
      };
    } else {
      throw new TypeError(
        `Unsupported data format on the keys. Values must resolve to a string or a function that returns a string. Key name: "${
          key as string
        }"`
      );
    }
  }, {} as Partial<I18nPath<T>>);

  return paths as I18nPath<T>;
};

type Dictionaries<T extends object = object> = {
  [key: string]: I18nPath<T>;
};

export const makeChainedI18nContext = <T extends Dictionaries, K extends keyof T>(props: {
  dictionaries: T;
  locale: keyof T;
  setContext?: boolean;
}) => {
  const [_locale, _setLocale] = createSignal<K>(props.locale as K);

  const utils = {
    locale(): K {
      return _locale();
    },
    setLocale(locale: K): K {
      _setLocale(() => locale);
      return locale;
    },
    getDictionary(locale?: K): T[K] {
      if (locale) return props.dictionaries[locale];
      return props.dictionaries[_locale()];
    }
  };

  const chainedI18n = createMemo(() => buildI18nChain(props.dictionaries[_locale()]));

  const translate = () => {
    return chainedI18n();
  };

  const chainedI18nContext = createContext<[typeof translate, typeof utils] | null>(
    props.setContext ? [translate, utils] : null
  );

  return {
    I18nProvider: (props: { children: JSXElement }): JSXElement => {
      return createComponent(chainedI18nContext.Provider, {
        value: [translate, utils],
        get children() {
          return props.children;
        }
      });
    },
    useI18nContext: () => useContext(chainedI18nContext)
  };
};
