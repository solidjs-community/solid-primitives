import { createSignal, createEffect, Signal } from "solid-js";
import { isServer } from "solid-js/web";
import { parseCookie } from "solid-start";
import { useRequest } from "solid-start/server";

export type MaxAgeOptions = {
  /**
   * The maximum age of the cookie in seconds. Defaults to 1 year.
   */
  cookieMaxAge?: number;
};

export type ServerCookieOptions<T = string> = MaxAgeOptions & {
  /**
   * A function to deserialize the cookie value to be used as signal value
   */
  deserialize?: (str: string | undefined) => T;
  /**
   * A function to serialize the signal value to be used as cookie value
   */
  serialize?: (value: T) => string;
};

const YEAR = 365 * 24 * 60 * 60;

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

  const [cookie, setCookie] = createSignal(
    deserialize(
      parseCookie(isServer ? useRequest().request.headers.get("cookie") ?? "" : document.cookie)[
        name
      ],
    ),
  );

  createEffect(p => {
    const string = serialize(cookie());
    if (p !== string) document.cookie = `${name}=${string};max-age=${cookieMaxAge}`;
    return string;
  });

  return [cookie, setCookie];
}