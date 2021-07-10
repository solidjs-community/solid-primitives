import createLocalStore from '../../local-store/src/index';
import { convert, CookieOptions, escape } from './util';

/**
 * Create a new one off cookie storage facility.
 *
 * @param prefix - Key prefix to store the cookie as
 * @param options - Starting value of the cookie
 * @param serializer - A function
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
): [
  store: T,
  setter: (key: string, value: string|number) => void,
  remove: (key: string) => void,
  clear: () => void
] {
  const defaults = { path: '/', expires: -1 }
  const attrs = convert({ ...defaults, ...options });
  const setItem = (
    key: string, value: string, atts?: string
  ) => {
    const valueStr = serializer ? serializer(value) : value;
    document.cookie = `${key}=${valueStr}${atts || attrs}`;
  }
  const getItem = (key: string) => {
    const reKey = new RegExp(
      `(?:^|; )${escape(key)}(?:=([^;]*))?(?:;|$)`
    );
    const match = reKey.exec(document.cookie);
    if (match === null) return null;
    return serializer ? serializer(match[1]) : match[1];
  };
  const removeItem = (key: string) => {
    return setItem(key, 'a', convert({
      ...options,
      ...{ expires: -1 }
    }));
  }
  const clear = () => {
    const reKey = /(?:^|; )([^=]+?)(?:=([^;]*))?(?:;|$)/g;
    reKey.exec(document.cookie)?.forEach((match) => removeItem(match[1]))
  }
  return createLocalStore(
    prefix,
    { setItem, getItem, removeItem, clear } as Storage
  );
}

export default createCookieStore;
