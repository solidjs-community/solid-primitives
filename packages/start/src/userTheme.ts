import { Signal } from "solid-js";
import { MaxAgeOptions, createServerCookie } from "./serverCookie";

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
export function createUserTheme(name = "theme", options?: UserThemeOptions): Signal<any> {
  const defaultValue = options?.defaultValue;
  return createServerCookie(name, {
    ...options,
    deserialize: str => (str === "light" || str === "dark" ? str : defaultValue),
    serialize: String,
  });
}
