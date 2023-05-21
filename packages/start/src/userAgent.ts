import { useRequest } from "solid-start/server";
import { isServer } from "solid-js/web";

export function useUserAgent() {
  const event = useRequest();
  if (isServer) {
    const userAgent = event.request.headers.get("user-agent") ?? null;
    return userAgent;
  }
  return navigator.userAgent;
}
