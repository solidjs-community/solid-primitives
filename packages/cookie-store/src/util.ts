
export enum CookieSitePolicy {
  Strict,
  Lax,
  None
}

export type CookieOptions = {
  domain?: string,
  expires?: Date|number|String,
  path?: string,
  secure?: boolean,
  httpOnly?: boolean,
  maxAge?: number,
  sameSite?: CookieSitePolicy
};

export const escape = (str: string) => str.replace(/[.*+?^$|[\](){}\\-]/g, '\\$&');

export function computeExpires(str: string) {
  const value = parseInt(str, 10);
  let expires = new Date();
  switch (str.charAt(str.length - 1)) {
    case 'Y': expires.setFullYear(expires.getFullYear() + value); break;
    case 'M': expires.setMonth(expires.getMonth() + value); break;
    case 'D': expires.setDate(expires.getDate() + value); break;
    case 'h': expires.setHours(expires.getHours() + value); break;
    case 'm': expires.setMinutes(expires.getMinutes() + value); break;
    case 's': expires.setSeconds(expires.getSeconds() + value); break;
    default: expires = new Date(str);
  }
  return expires;
}

export function convert(opts: CookieOptions) {
  return Object.entries(opts).reduce((memo, [key, value]) => {
    if (key == 'expires') {
      const expires = computeExpires(typeof value === 'number' ? 'D' : '');
      memo += `;${key}=${expires.toUTCString()}`;
    } else if (typeof value === 'boolean' && value) {
      memo += `;${key}`;
    } else {
      memo += `;${key}=${value}`;
    }
    return memo;
  }, '');
}
