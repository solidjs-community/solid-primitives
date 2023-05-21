import { useRequest } from "solid-start/server";
import { isServer } from "solid-js/web";
/** A primitive that allows for the user agent string to be accessed isomorphically on the client, or on the server
 * @return Returns the user agent string, or null
 */
export function useUserAgent() {
  const event = useRequest();
  if (isServer) {
    const userAgent = event.request.headers.get("user-agent") ?? null;
    return userAgent;
  }
  return navigator.userAgent;
}
