import { isServer } from "solid-js/web";
import createLocalStore from "@solid-primitives/local-store";

export enum CookieSitePolicy {
  Strict,
  Lax,
  None
}

export interface CookieOptions {
  domain?: string;
  expires?: Date | number | String;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  sameSite?: CookieSitePolicy;
}

/**
 * Create a new one off cookie storage facility.
 *
 * @param prefix - Key prefix to store the cookie as
 * @param options - Starting value of the cookie
 * @param serializer - A function used for serializing to cookie store
 * @param deserializer - A function used for deserializing from the cookie store
 *
 * @example
 * ```ts
 * const [value, setValue] = createCookieStore('my-cookie', 'derp');
 * setValue('my-new-value');
 * console.log(value());
 * ```
 */
function createCookieStore<T>(
  prefix: string | null = null,
  options?: CookieOptions,
  serializer: Function | null = encodeURIComponent,
  deserializer: Function | null = decodeURIComponent,
): [
  store: T,
  setter: (key: string, value: string | number) => void,
  remove: (key: string) => void,
  clear: () => void
] {
  const defaults = { path: "/", expires: -1 };
  const attrs = convert({ ...defaults, ...options });
  const setItem = (key: string, value: string, atts?: string) => {
    if (!isServer) {
      const valueStr = serializer ? serializer(value) : value;
      document.cookie = `${key}=${valueStr}${atts || attrs}`;
    }
  };
  const getItem = (key: string) => {
    if (isServer) {
      return "";
    }
    const reKey = new RegExp(`(?:^|; )${escape(key)}(?:=([^;]*))?(?:;|$)`);
    const match = reKey.exec(document.cookie);
    if (match === null) return null;
    return deserializer ? deserializer(match[1]) : match[1];
  };
  const removeItem = (key: string) => {
    return setItem(key, "a", convert({ ...options, ...{ expires: -1 } }));
  };
  const clear = () => {
    if (isServer) {
      return;
    }
    const reKey = /(?:^|; )([^=]+?)(?:=([^;]*))?(?:;|$)/g;
    reKey.exec(document.cookie)?.forEach(match => removeItem(match[1]));
  };
  return createLocalStore(prefix, { setItem, getItem, removeItem, clear } as Storage);
}

const escape = (str: string) => str.replace(/[.*+?^$|[\](){}\\-]/g, "\\$&");

const convert = (opts: CookieOptions) => {
  let memo = "";
  for (const [key, value] of Object.entries(opts)) {
    if (key === "expires") {
      if (typeof value === "function") {
        memo += `; ${key}=${value.toUTCString()}`;
      } else {
        memo += `; ${key}=${value}`;
      }
    } else if (typeof value === "boolean" && value) {
      memo += `; ${key}`;
    } else {
      memo += `; ${key}=${value}`;
    }
  }
  return memo;
};

export default createCookieStore;
