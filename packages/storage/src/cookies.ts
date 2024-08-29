import { getRequestEvent, isServer, type RequestEvent } from "solid-js/web";
import {
  SyncStorageWithOptions,
  addClearMethod,
  addWithOptionsMethod,
} from "./index.js";

export type CookieOptions =
  | (CookieProperties & {
      getRequestHeaders?: () => Headers;
      getResponseHeaders?: () => Headers;
    })
  | undefined;

type CookiePropertyTypes = {
  domain?: string;
  expires?: Date | number | String;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  sameSite?: "None" | "Lax" | "Strict";
};

type CookieProperties = {
  [key in keyof CookiePropertyTypes]: CookiePropertyTypes[key];
};

const cookiePropertyMap = {
  domain: "Domain",
  expires: "Expires",
  path: "Path",
  secure: "Secure",
  httpOnly: "HttpOnly",
  maxAge: "Max-Age",
  sameSite: "SameSite",
} as const;

function serializeCookieOptions(options?: CookieOptions) {
  if (!options) return "";
  const result = Object.entries(options)
    .map(([key, value]) => {
      const serializedKey: string | undefined =
        cookiePropertyMap[key as keyof CookiePropertyTypes];
      if (!serializedKey) return undefined;

      if (value instanceof Date)
        return `${serializedKey}=${value.toUTCString()}`;
      if (typeof value === "boolean")
        return value ? `${serializedKey}` : undefined;
      return `${serializedKey}=${value}`;
    })
    .filter((v) => !!v);

  return result.length != 0 ? `; ${result.join("; ")}` : "";
}

function deserializeCookieOptions(cookie: string, key: string) {
  const found = cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`)?.pop();
  return found != null ? decodeURIComponent(found) : null;
}

const getRequestHeaders = isServer
  ? () =>
      (
        getRequestEvent() as
          | (Partial<RequestEvent> & { response?: Response })
          | undefined
      )?.request?.headers || new Headers()
  : () => new Headers();
const getResponseHeaders = isServer
  ? () =>
      (
        getRequestEvent() as
          | (Partial<RequestEvent> & { response?: Response })
          | undefined
      )?.response?.headers || new Headers()
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
export const cookieStorage: SyncStorageWithOptions<CookieOptions> =
  addWithOptionsMethod(
    addClearMethod({
      _read: isServer
        ? (options?: CookieOptions) => {
            const requestCookies = (
              options?.getRequestHeaders?.() || getRequestHeaders()
            ).get("Cookie");
            const responseCookies = (
              options?.getResponseHeaders?.() || getResponseHeaders()
            ).get("Set-Cookie");
            const cookies: Record<string, string> = {};
            const addCookie = (_: string, key: string, val: string) =>
              (cookies[key] = val);
            requestCookies?.replace(/(?:^|;)([^=]+)=([^;]+)/g, addCookie);
            responseCookies?.replace(/(?:^|, )([^=]+)=([^;]+)/g, addCookie);
            return Object.entries(cookies)
              .map((keyval) => keyval.join("="))
              .join("; ");
          }
        : () => document.cookie,
      _write: isServer
        ? (key: string, value: string, options?: CookieOptions) => {
            const responseHeaders = getResponseHeaders();
            const currentCookies =
              responseHeaders
                .get("Set-Cookie")
                ?.split(", ")
                .filter((cookie) => cookie && !cookie.startsWith(`${key}=`)) ??
              [];
            responseHeaders.set(
              "Set-Cookie",
              [
                ...currentCookies,
                `${key}=${value}${serializeCookieOptions(options)}`,
              ].join(", ")
            );
          }
        : (key: string, value: string, options?: CookieOptions) => {
            document.cookie = `${key}=${value}${serializeCookieOptions(
              options
            )}`;
          },
      getItem: (key: string, options?: CookieOptions) =>
        deserializeCookieOptions(cookieStorage._read(options), key),
      setItem: (key: string, value: string, options?: CookieOptions) => {
        cookieStorage._write(key, value.replace(/[\u00c0-\uffff\&;]/g, (c) =>
          encodeURIComponent(c)
        ), options);
      },
      removeItem: (key: string, options?: CookieOptions) => {
        cookieStorage._write(key, "deleted", {
          ...options,
          expires: new Date(0),
        });
      },
      key: (index: number, options?: CookieOptions) => {
        let key: string | null = null;
        let count = 0;
        cookieStorage
          ._read(options)
          .replace(
            /(?:^|;)\s*(.+?)\s*=\s*[^;]+/g,
            (_: string, found: string) => {
              if (!key && found && count++ === index) {
                key = found;
              }
              return "";
            }
          );
        return key;
      },
      getLength: (options?: CookieOptions) => {
        let length = 0;
        cookieStorage
          ._read(options)
          .replace(/(?:^|;)\s*.+?\s*=\s*[^;]+/g, (found: string) => {
            length += found ? 1 : 0;
            return "";
          });
        return length;
      },
      get length() {
        return this.getLength();
      },
    })
  );
