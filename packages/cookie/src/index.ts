import {} from 'solid-js';
import { isServer } from 'solid-js/web';

/**
 * Create a new one off cookie storage facility.
 *
 * @param key - Key to store the cookie as
 * @param initialValue - Starting value of the cookie
 * 
 * @example
 * ```ts
 * const [value, setValue] = createCookie('my-cookie', 'derp');
 * setValue('my-new-value');
 * console.log(value());
 * ```
 */

// @TODO: Look at refactoring with something like: https://davidwalsh.name/javascript-proxy-with-storage
 const createCookie = <T extends string | number | boolean>(
  key: string,
  initialValue = '',
  options = {
    path: '/',
    date: null,
    milliseconds: 0
  }
): [
  get: () => T,
  set: (value: T) => void
] => {
  const set = (value: T) => {
    if (isServer) return;
    const expires = options.date ? options.date : new Date().setTime(options.milliseconds);
    document.cookie =
      key +
      '=' +
      encodeURIComponent(value!) +
      '; expires=' +
      expires +
      '; path=' +
      options.path;
  };
  const get = (): T => {
    if (!isServer) {
      return initialValue;
    }
    const value = document.cookie.split('; ').reduce((r, v) => {
      const parts = v.split('=');
      return parts[0] === key ? decodeURIComponent(parts[1]) : r;
    }, '');
    return value || initialValue;
  };
  return [get, set];
};

export default createCookie;
