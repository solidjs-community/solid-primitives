import { getRequestEvent, isServer } from "solid-js/web";
import { StorageProps, StorageSignalProps, StorageWithOptions } from "./types.js";
import { addClearMethod } from "./tools.js";
import { createStorage, createStorageSignal } from "./storage.js";
import { PageEvent } from "@solidjs/start/dist/server";

export type CookieOptions = CookieProperties & {
  getRequest?: (() => Request) | (() => PageEvent);
  setCookie?: (key: string, value: string, options: CookieOptions) => void;
};

type CookieProperties = {
  domain?: string;
  expires?: Date | number | String;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  sameSite?: "None" | "Lax" | "Strict";
};

const cookiePropertyKeys = [
  "domain",
  "expires",
  "path",
  "secure",
  "httpOnly",
  "maxAge",
  "sameSite",
] as const;

function serializeCookieOptions(options?: CookieOptions) {
  if (!options) {
    return "";
  }
  let memo = "";
  for (const key in options) {
    if (!cookiePropertyKeys.includes(key as keyof CookieProperties)) continue;

    const value = options[key as keyof CookieProperties];
    memo +=
      value instanceof Date
        ? `; ${key}=${value.toUTCString()}`
        : typeof value === "boolean"
          ? `; ${key}`
          : `; ${key}=${value}`;
  }
  return memo;
}

function deserializeCookieOptions(cookie: string, key: string) {
  return cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop() ?? null;
}

let useRequest: () => PageEvent | undefined;
try {
  useRequest = () => getRequestEvent()?.request as PageEvent;
} catch (e) {
  useRequest = () => {
    // eslint-disable-next-line no-console
    console.warn(
      "It seems you attempt to use cookieStorage on the server without having solid-start installed or use vite.",
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
 *   getRequest?: () => Request | () => PageEvent // useRequest from solid-start, vite users must pass the "useRequest" from "solid-start/server" function manually
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
        let result = "";
        if (eventOrRequest.response.headers) {
          // Check if we really got a pageEvent
          result +=
            eventOrRequest.response.headers
              .get("Set-Cookie")
              ?.split(",")
              .map(cookie => !cookie.match(/\\w*\\s*=\\s*[^;]+/))
              .join(";") ?? "";
        }
        return `${result};${request?.headers?.get("Cookie") ?? ""}`; // because first cookie will be preferred we don't have to worry about duplicates
      }
    : () => document.cookie,
  _write: isServer
    ? (key: string, value: string, options?: CookieOptions) => {
        if (options?.setCookie) {
          options?.setCookie?.(key, value, options);
          return;
        }
        const pageEvent: PageEvent = options?.getRequest?.() || useRequest();
        if (!pageEvent.response.headers)
          // Check if we really got a pageEvent
          return;
        const responseHeaders = pageEvent.response.headers;
        const cookies =
          responseHeaders
            .get("Set-Cookie")
            ?.split(",")
            .filter(cookie => !cookie.match(`\\s*${key}\\s*=`)) ?? [];
        cookies.push(`${key}=${value}${serializeCookieOptions(options)}`);
        responseHeaders.set("Set-Cookie", cookies.join(","));
      }
    : (key: string, value: string, options?: CookieOptions) => {
        document.cookie = `${key}=${value}${serializeCookieOptions(options)}`;
      },
  getItem: (key: string, options?: CookieOptions) =>
    deserializeCookieOptions(cookieStorage._read(options), key),
  setItem: (key: string, value: string, options?: CookieOptions) => {
    const oldValue = isServer ? cookieStorage.getItem(key, options) : null;
    cookieStorage._write(key, value, options);
    if (!isServer) {
      // Storage events are only required on client when using multiple tabs
      const storageEvent = Object.assign(new Event("storage"), {
        key,
        oldValue,
        newValue: value,
        url: globalThis.document.URL,
        storageArea: cookieStorage,
      });
      window.dispatchEvent(storageEvent);
    }
  },
  removeItem: (key: string, options?: CookieOptions) => {
    cookieStorage._write(key, "deleted", { ...options, expires: new Date(0) });
  },
  key: (index: number, options?: CookieOptions) => {
    let key: string | null = null;
    let count = 0;
    cookieStorage
      ._read(options)
      .replace(/(?:^|;)\s*(.+?)\s*=\s*[^;]+/g, (_: string, found: string) => {
        if (!key && found && count++ === index) {
          key = found;
        }
        return "";
      });
    return key;
  },
  getLength: (options?: CookieOptions) => {
    let length = 0;
    cookieStorage._read(options).replace(/(?:^|;)\s*.+?\s*=\s*[^;]+/g, (found: string) => {
      length += found ? 1 : 0;
      return "";
    });
    return length;
  },
  get length() {
    return this.getLength();
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
