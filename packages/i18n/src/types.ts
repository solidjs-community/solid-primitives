export type NestedKeyOf<T extends object> = {
  [Key in keyof T & (string | number)]: T[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<T[Key]>}`
    : `${Key}`;
}[keyof T & (string | number)];

export type NestedValueOf<T extends object, K extends NestedKeyOf<T> | string> = K extends keyof T &
  (string | number)
  ? T[K]
  : K extends `${infer P extends keyof T & (string | number)}.${infer R}`
  ? T[P] extends object
    ? NestedValueOf<T[P], R>
    : unknown
  : unknown;

export type Translate<T = unknown> = T extends object
  ? (key: NestedKeyOf<T>, params?: Record<string, string>, defaultValue?: string) => string
  : (key: string, params?: Record<string, string>, defaultValue?: string) => string;

export type I18nAction = {
  add(lang: string, table: Record<string, unknown>): void;
  locale: (lang?: string) => string;
  dict: (lang: string) => Record<string, Record<string, unknown>>;
};

export type I18nContextInterface<T = unknown> = [Translate<T>, I18nAction];

export type UseScopedI18n<T = unknown> = T extends object
  ? <K extends NestedKeyOf<T>>(scope: K) => I18nContextInterface<NestedValueOf<T, K>>
  :
      | (<U extends object, K extends NestedKeyOf<U>>(
          scope: K,
        ) => I18nContextInterface<NestedValueOf<U, K>>)
      | ((scope: string) => I18nContextInterface);
