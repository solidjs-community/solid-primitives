import { createSignal, createEffect, Signal, NoInfer } from "solid-js";
import { isServer } from "solid-js/web";
import { parseCookie } from "solid-start";
import { useRequest } from "solid-start/server";

/**
 * A primitive for creating a cookie that can be accessed isomorphically on the client, or the server
 *
 * @param cookieMaxAge The max age of the cookie to be set, in seconds
 * @param cookieName The name of the cookie to be set
 * @return Returns an accessor and setter to manage the user's current theme
 */
type ParseCookie<T> = {
  toValue: (str?: string) => T | null;
  toString: (value: T) => string;
};
type ServerCookieOptions<T> = {
  defaultValue?: NoInfer<T>;
  cookieMaxAge?: number;
  CookieParser?: ParseCookie<T>;
};
export const createServerCookie = <T = string>(
  name: string,
  options?: ServerCookieOptions<T>,
): Signal<T | null> => {
  const {
    CookieParser = {
      toValue: (str?: string) => str,
      toString: String,
    },
    cookieMaxAge = 365 * 24 * 60 * 60,
    defaultValue = "light",
  } = options ?? {};
  const event = useRequest();
  const userTheme = parseCookie(
    isServer ? event.request.headers.get("cookie") ?? "" : document.cookie,
  )[name];
  const [cookie, setCookie] = createSignal<T | null>(
    (CookieParser.toValue(userTheme) ?? defaultValue) as T,
  );
  createEffect(() => {
    document.cookie = `${name}=${cookie()};max-age=${cookieMaxAge}`;
  });
  return [cookie, setCookie];
};

export const createUserTheme = (name?: string) => {
  const [theme, setTheme] = createServerCookie(name ?? "theme", {
    defaultValue: "light",
    CookieParser: {
      toValue: str => (str === "light" || str === "dark" ? str : null),
      toString: String,
    },
  });
  return [theme, setTheme];
};
