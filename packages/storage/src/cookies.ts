import { isServer, getRequestEvent, type RequestEvent } from "solid-js/web";
import { StorageProps, StorageSignalProps, StorageWithOptions } from "./types.js";
import { addClearMethod, addWithOptionsMethod } from "./tools.js";
import { createStorage, createStorageSignal } from "./storage.js";

export type CookieOptions = CookieProperties & {
  getRequestHeaders?: () => Headers;
  getResponseHeaders?: () => Headers;
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
  if (!options) return "";
  return Object.entries(options).map(([key, value]) => {
    if (key === "maxAge") { key = "max-age"; }
    return value instanceof Date
      ? `; ${key}=${value.toUTCString()}`
      : typeof value === "boolean"
        ? `; ${key}`
        : `; ${key}=${value}`;
  }).join("");
}

function deserializeCookieOptions(cookie: string, key: string) {
  return cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop() ?? null;
}

const getRequestHeaders = isServer
  ? () => getRequestEvent()?.request?.headers || new Headers()
  : () => new Headers();
const getResponseHeaders = isServer
  ? () =>
      (getRequestEvent() as RequestEvent & { response: Response })?.response?.headers ||
      new Headers()
  : () => new Headers();

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
export const cookieStorage: StorageWithOptions<CookieOptions> = addWithOptionsMethod(
  addClearMethod({
    _read: isServer
      ? (options?: CookieOptions) => {
          const requestCookies = (options?.getRequestHeaders?.() || getRequestHeaders()).get(
            "Cookie",
          );
          const responseCookies = (options?.getResponseHeaders?.() || getResponseHeaders()).get(
            "Set-Cookie",
          );
          const cookies: Record<string, string> = {};
          const addCookie = (_: string, key: string, val: string) => (cookies[key] = val);
          requestCookies?.replace(/(?:^|;)([^=]+)=([^;]+)/g, addCookie);
          responseCookies?.replace(/(?:^|, )([^=]+)=([^;]+)/g, addCookie);
          return Object.entries(cookies)
            .map(keyval => keyval.join("="))
            .join("; ");
        }
      : () => document.cookie,
    _write: isServer
      ? (key: string, value: string, options?: CookieOptions) => {
          const responseHeaders = getResponseHeaders();
          responseHeaders.set(
            "Set-Cookie",
            (responseHeaders.get("Set-Cookie") || "").replace(
              new RegExp(`(?:^|, )${key}=[^,]+`, "g"),
              "",
            ),
          );
          responseHeaders.append("Set-Cookie", `${key}=${value}${serializeCookieOptions(options)}`);
        }
      : (key: string, value: string, options?: CookieOptions) => {
          document.cookie = `${key}=${value}${serializeCookieOptions(options)}`;
        },
    getItem: (key: string, options?: CookieOptions) =>
      deserializeCookieOptions(cookieStorage._read(options), key),
    setItem: (key: string, value: string, options?: CookieOptions) => {
      cookieStorage._write(key, value, options);
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
  }),
);

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
