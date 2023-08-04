import { isServer } from "solid-js/web";
import { StorageProps, StorageWithOptions, StorageSignalProps } from "./types";
import { addClearMethod } from "./tools";
import { createStorage, createStorageSignal } from "./storage";
import type { PageEvent } from "solid-start";

export type CookieOptions = {
  domain?: string;
  expires?: Date | number | String;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  sameSite?: "None" | "Lax" | "Strict";
  getRequest?: (() => Request) | (() => PageEvent);
  setCookie?: (key: string, value: string, options: CookieOptions) => void;
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

let useRequest: () => PageEvent | undefined;
try {
  useRequest = require("solid-start/server").useRequest;
} catch (e) {
  useRequest = () => {
    // eslint-disable-next-line no-console
    console.warn(
      "It seems you attempt to use cookieStorage on the server without having solid-start installed",
    );
    return {
      request: { headers: { get: () => "" } } as unknown as Request,
    } as unknown as PageEvent;
  };
}

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
 *   getRequest?: () => Request | () => PageEvent // (useRequest from solid-start)
 *   setCookie?: (key, value, options) => void // set cookie on the server
 * };
 * ```
 * Also, you can use its _read and _write properties to change reading and writing
 */
export const cookieStorage: StorageWithOptions<CookieOptions> = addClearMethod({
  _read: isServer
    ? (options?: CookieOptions) => {
        const eventOrRequest = options?.getRequest?.() || useRequest();
        const request =
          eventOrRequest && ("request" in eventOrRequest ? eventOrRequest.request : eventOrRequest);
        return request?.headers.get("Cookie") || "";
      }
    : () => document.cookie,
  _write: isServer
    ? (key: string, value: string, options?: CookieOptions) =>
        options?.setCookie?.(key, value, options)
    : (key: string, value: string, options?: CookieOptions) => {
        document.cookie = `${key}=${value}${serializeCookieOptions(options)}`;
      },
  getItem: (key: string, options?: CookieOptions) =>
    cookieStorage
      ._read(options)
      .match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)")
      ?.pop() ?? null,
  setItem: (key: string, value: string, options?: CookieOptions) => {
    const oldValue = cookieStorage.getItem(key);
    cookieStorage._write(key, value, options);
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
    cookieStorage._write(key, "deleted", { expires: new Date(0) });
  },
  key: (index: number) => {
    let key: string | null = null;
    let count = 0;
    cookieStorage._read().replace(/(?:^|;)\s*(.+?)\s*=\s*[^;]+/g, (_: string, found: string) => {
      if (!key && found && count++ === index) {
        key = found;
      }
      return "";
    });
    return key;
  },
  get length() {
    let length = 0;
    cookieStorage._read().replace(/(?:^|;)\s*.+?\s*=\s*[^;]+/g, (found: string) => {
      length += found ? 1 : 0;
      return "";
    });
    return length;
  },
});

/**
 * creates a reactive store but bound to document.cookie
 * @deprecated in favor of makePersisted
 */
export const createCookieStorage = <T, O = CookieOptions, A = StorageWithOptions<CookieOptions>>(
  props?: Omit<StorageProps<T, A, O>, "api">,
) => createStorage<O, T>({ ...props, api: cookieStorage } as any);

/**
 * creates a reactive signal, but bound to document.cookie
 * @deprecated in favor of makePersisted
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
