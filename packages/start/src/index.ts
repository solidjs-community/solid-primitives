import { createSignal, createEffect, Signal } from "solid-js";
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
type ServerCookieOptions = {
  cookieMaxAge?: number;
  isValid?: (item: string) => boolean;
};
export const createServerCookie = (
  defaultValue: string,
  name: string,
  options?: ServerCookieOptions,
): Signal<string> => {
  const { cookieMaxAge = 365 * 24 * 60 * 60, isValid = (item: string) => true } = options ?? {};
  const event = useRequest();
  const userTheme = parseCookie(
    isServer ? event.request.headers.get("cookie") ?? "" : document.cookie,
  )[name];
  const [cookie, setCookie] = createSignal(userTheme ?? defaultValue);
  createEffect(() => {
    if (!isValid(cookie())) return;
    document.cookie = `${name}=${cookie()};max-age=${cookieMaxAge}`;
  });
  return [cookie, setCookie];
};

export const createUserTheme = (themes: string[], defaultTheme: string): Signal<string> => {
  const [theme, setTheme] = createServerCookie(defaultTheme, "theme", {
    isValid(item) {
      if (themes.includes(item)) return true;
      return false;
    },
  });

  return [theme, setTheme];
};
