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
export function createCookieStore<T>(
  prefix: string | null = null,
  options?: CookieOptions,
  serializer: Function | null = encodeURIComponent,
  deserializer: Function | null = decodeURIComponent
): [
  store: T,
  setter: (key: string, value: string | number) => void,
  remove: (key: string) => void,
  clear: (keys: string[] | null) => void
] {
  const defaults = { path: "/", expires: -1 };
  const attrs = convert({ ...defaults, ...options });
  const setItem = (key: string, value: string, atts?: string) => {
    if (isServer) return;
    const valueStr = serializer ? serializer(value) : value;
    globalThis.document.cookie = `${key}=${valueStr}${atts || attrs}`;
  };
  const getItem = (key: string) => {
    if (isServer) return;
    const value =
      (globalThis.document || {}).cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)")?.pop() || "";
    return deserializer ? deserializer(value) : value;
  };
  const removeItem = (key: string) => {
    if (isServer) return;
    return setItem(
      key,
      "",
      convert({ ...options, ...{ expires: "Thu, 01 Jan 1970 00:00:00 GMT" } })
    );
  };
  const getAll = () => {
    const all: { [key: string]: string } = {};
    (globalThis.document || {}).cookie.replace(
      /(?:^|;)\s*(.+?)\s*=\s*([^;]+)/g,
      (_: string, key?: string, value?: string) => {
        if (key && value) {
          all[key] = deserializer ? deserializer(value) : value;
        }
        return "";
      }
    );
    return all;
  };
  const clear = (keys?: string[]) => {
    if (isServer) return;
    (keys || Object.keys(getAll())).forEach(key => removeItem(key));
  };
  // @ts-ignore
  return createLocalStore(prefix, { setItem, getItem, removeItem, getAll, clear } as Storage);
}

export default createCookieStore;
