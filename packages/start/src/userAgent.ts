import { useRequest } from "solid-start/server";
import { isServer } from "solid-js/web";

export function useUserAgent() {
  if (isServer) {
    const req = useRequest();
    const userAgent = req.request.headers.get("user-agent");
    return userAgent;
  }
  return navigator.userAgent;
}
