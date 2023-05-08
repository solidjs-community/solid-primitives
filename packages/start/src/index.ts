import { createSignal, createEffect, Signal } from "solid-js";
import { isServer } from "solid-js/web";
import { parseCookie } from "solid-start";
import { useRequest } from "solid-start/server";

type ServerCookieOptions<T = string> = {
  cookieMaxAge?: number;
  toValue?: (str: string | undefined) => T;
  toString?: (value: T) => string;
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
    toValue: (str: string) => T;
    toString: (value: T) => string;
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
    toValue = (v: any) => v as T,
    toString = String,
    cookieMaxAge = 365 * 24 * 60 * 60,
  } = options ?? {};

  const [cookie, setCookie] = createSignal(
    toValue(
      parseCookie(isServer ? useRequest().request.headers.get("cookie") ?? "" : document.cookie)[
        name
      ],
    ),
  );

  createEffect(p => {
    const string = toString(cookie());
    if (p !== string) {
      document.cookie = `${name}=${toString(cookie())};max-age=${cookieMaxAge}`;
    }
    return string;
  });

  return [cookie, setCookie];
}

export type Theme = "light" | "dark";

export function createUserTheme(name: string | undefined, defaultValue: Theme): Signal<Theme>;
export function createUserTheme(name?: string): Signal<Theme | null>;
export function createUserTheme(
  name = "theme",
  defaultValue: Theme | null = null,
): Signal<Theme | null> {
  return createServerCookie(name, {
    toValue: str => (str === "light" || str === "dark" ? str : defaultValue),
  });
}
