import { StorageProps, StorageWithOptions, StorageSignalProps } from "./types";
import { addClearMethod } from "./tools";
import { createStorage, createStorageSignal } from "./storage";

export type CookieOptions = {
  domain?: string;
  expires?: Date | number | String;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  sameSite?: "None" | "Lax" | "Strict";
};

const serializeCookieOptions = (options?: CookieOptions) => {
  if (!options) {
    return "";
  }
  let memo = "";
  for (const key in options) {
    if (!options.hasOwnProperty(key)) {
      continue;
    }
    const value = options[key as keyof CookieOptions];
    memo +=
      value instanceof Date
        ? `; ${key}=${value.toUTCString()}`
        : typeof value === "boolean"
        ? `; ${key}`
        : `; ${key}=${value}`;
  }
  return memo;
};

/**
 * handle cookies exactly like you would handle localStorage
 *
 * the main change is that setItem accepts the following options:
 * ```typescript
 * export type CookieOptions = {
 *   domain?: string;
 *   expires?: Date | number | String;
 *   path?: string;
 *   secure?: boolean;
 *   httpOnly?: boolean;
 *   maxAge?: number;
 *   sameSite?: "None" | "Lax" | "Strict";
 * };
 * ```
 */
export const cookieStorage: StorageWithOptions<CookieOptions> = addClearMethod({
  _cookies: [globalThis.document, "cookie"],
  getItem: (key: string) =>
    cookieStorage._cookies[0][cookieStorage._cookies[1]]
      .match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)")
      ?.pop() ?? null,
  setItem: (key: string, value: string, options?: CookieOptions) => {
    const oldValue = cookieStorage.getItem(key);
    cookieStorage._cookies[0][cookieStorage._cookies[1]] = `${key}=${value}${serializeCookieOptions(
      options,
    )}`;
    const storageEvent = Object.assign(new Event("storage"), {
      key,
      oldValue,
      newValue: value,
      url: globalThis.document.URL,
      storageArea: cookieStorage,
    });
    window.dispatchEvent(storageEvent);
  },
  removeItem: (key: string) => {
    cookieStorage._cookies[0][cookieStorage._cookies[1]] = `${key}=deleted${serializeCookieOptions({
      expires: new Date(0),
    })}`;
  },
  key: (index: number) => {
    let key: string | null = null;
    let count = 0;
    cookieStorage._cookies[0][cookieStorage._cookies[1]].replace(
      /(?:^|;)\s*(.+?)\s*=\s*[^;]+/g,
      (_: string, found: string) => {
        if (!key && found && count++ === index) {
          key = found;
        }
        return "";
      },
    );
    return key;
  },
  get length() {
    let length = 0;
    cookieStorage._cookies[0][cookieStorage._cookies[1]].replace(
      /(?:^|;)\s*.+?\s*=\s*[^;]+/g,
      (found: string) => {
        length += found ? 1 : 0;
        return "";
      },
    );
    return length;
  },
});

/**
 * creates a reactive store but bound to document.cookie
 */
export const createCookieStorage = <T, O = CookieOptions, A = StorageWithOptions<CookieOptions>>(
  props?: Omit<StorageProps<T, A, O>, "api">,
) => createStorage<O, T>({ ...props, api: cookieStorage } as any);

/**
 * creates a reactive signal, but bound to document.cookie
 */
export const createCookieStorageSignal = <
  T,
  O = CookieOptions,
  A = StorageWithOptions<CookieOptions>,
>(
  key: string,
  initialValue?: T,
  props?: Omit<StorageSignalProps<T, A, O>, "api">,
) => createStorageSignal<T, O>(key, initialValue, { ...props, api: cookieStorage } as any);
