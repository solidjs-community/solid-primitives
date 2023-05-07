import { createSignal, createEffect, Signal } from "solid-js";
import { isServer } from "solid-js/web";
import { parseCookie } from "solid-start";
import { useRequest } from "solid-start/server";

/**
 * A template example of how to create a new primitive.
 *
 * @param cookieMaxAge The max age of the cookie to be set, in seconds
 * @param cookieName The name of the cookie to be set
 * @return Returns an accessor and setter to manage the user's current theme
 */
type UserThemeOptions = {
  cookieMaxAge: number;
  cookieName: string;
};
export const createUserTheme = <T extends string>(
  defaultTheme: T,
  options?: UserThemeOptions,
): Signal<T> => {
  const { cookieMaxAge = 365 * 24 * 60 * 60, cookieName = "theme" } = options ?? {};
  const event = useRequest();
  const userTheme = parseCookie(
    isServer ? event.request.headers.get("cookie") ?? "" : document.cookie,
  )[cookieName] as T | undefined;
  const [theme, setTheme] = createSignal<T>(userTheme ?? defaultTheme);
  createEffect(() => {
    document.cookie = `${cookieName}=${theme()};max-age=${cookieMaxAge}`;
  });
  return [theme, setTheme];
};