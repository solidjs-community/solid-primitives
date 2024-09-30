import { createSignal, createEffect, Signal } from "solid-js";
import { getRequestEvent, isServer } from "solid-js/web";

const YEAR = 365 * 24 * 60 * 60;

/*
 Original code by Chakra UI
 MIT Licensed, Copyright (c) 2019 Segun Adebayo.

 Credits to the Chakra UI team:
 https://github.com/chakra-ui/chakra-ui/blob/%40chakra-ui/toast%401.2.0/packages/color-mode/src/storage-manager.ts
*/

export function parseCookie(cookie: string, key: string): string | undefined {
  return cookie.match(new RegExp(`(^| )${key}=([^;]+)`))?.[2];
}

/**
 * A primitive that allows for the cookie string to be accessed isomorphically on the client, or on the server
 * @return Returns the cookie string
 */
export function getCookiesString(): string {
  if (isServer) {
    return getRequestEvent()?.request.headers.get("cookie") ?? ""
  }
  return document.cookie
}

export type MaxAgeOptions = {
  /** The maximum age of the cookie in seconds. Defaults to 1 year. */
  cookieMaxAge?: number;
};

export type ServerCookieOptions<T = string> = MaxAgeOptions & {
  /** A function to deserialize the cookie value to be used as signal value */
  deserialize?: (str: string | undefined) => T;
  /** A function to serialize the signal value to be used as cookie value */
  serialize?: (value: T) => string;
};

/**
 * A primitive for creating a cookie that can be accessed isomorphically on the client, or the server
 *
 * @param name The name of the cookie to be set
 * @param options Options for the cookie {@see ServerCookieOptions}
 * @return Returns an accessor and setter to manage the user's current theme
 */
export function createServerCookie<T>(
  name: string,
  options: ServerCookieOptions<T> & {
    deserialize: (str: string | undefined) => T;
    serialize: (value: T) => string;
  },
): Signal<T>;
export function createServerCookie(
  name: string,
  options?: ServerCookieOptions,
): Signal<string | undefined>;
export function createServerCookie<T>(
  name: string,
  options?: ServerCookieOptions<T | undefined>,
): Signal<T | undefined> {
  const {
    deserialize = (v: any) => v as T,
    serialize = String,
    cookieMaxAge = YEAR,
  } = options ?? {};

  const [cookie, setCookie] = createSignal(deserialize(parseCookie(getCookiesString(), name)));

  createEffect(p => {
    const string = serialize(cookie());
    if (p !== string) document.cookie = `${name}=${string};max-age=${cookieMaxAge}`;
    return string;
  });

  return [cookie, setCookie];
}

export type Theme = "light" | "dark";

export type UserThemeOptions = MaxAgeOptions & {
  /**
   * The default theme to be used if the cookie is not set
   */
  defaultValue?: Theme;
};

/**
 * Composes {@link createServerCookie} to provide a type safe way to store a theme and access it on the server or client.
 *
 * @param name The name of the cookie to be set
 * @param options Options for the cookie {@link UserThemeOptions}
 */
export function createUserTheme(
  name: string | undefined,
  options: UserThemeOptions & { defaultValue: Theme },
): Signal<Theme>;
export function createUserTheme(
  name?: string,
  options?: UserThemeOptions,
): Signal<Theme | undefined>;
export function createUserTheme(name = "theme", options: UserThemeOptions = {}): Signal<any> {
  const {defaultValue, cookieMaxAge} = options;
  return createServerCookie(name, {
    cookieMaxAge,
    deserialize: str => (str === "light" || str === "dark" ? str : defaultValue),
    serialize: String,
  });
}
