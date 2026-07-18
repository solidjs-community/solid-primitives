import { type RequestContext } from "./fetch.ts";
import { isServer } from "solid-js/web";
import type NodeFetch from "node-fetch";

export type Request<FetcherArgs extends any[]> = <Result>(
  ...args: any[]
) => (requestContext: RequestContext<Result, FetcherArgs>) => void;

let fetchFallback: typeof fetch | typeof NodeFetch | undefined = globalThis.fetch as typeof fetch | undefined;
if (isServer && !fetchFallback) {
  try {
    const { default: nodeFetch } = await import("node-fetch");
    fetchFallback = nodeFetch;
  } catch (_e) {
    fetchFallback = () => {
      // oxlint-disable-next-line no-console
      console.warn(
        '"\x1b[33m⚠️ package missing to run createFetch on the server.\n Please run:\x1b[0m\n\nnpm i node-fetch\n"',
      );
      return Promise.reject(new Error("fetch not available"));
    };
  }
}

/**
 * The default request handler installed by `createFetch` at the base of the
 * modifier chain: calls `fetch` (or `node-fetch` on the server) and parses the
 * response as JSON, text, or a `Blob` based on its `content-type`, unless a
 * custom `responseHandler` is set on the request context.
 */
export const fetchRequest: Request<[info: RequestInfo, init?: RequestInit]> =
  fetchFn => requestContext => {
    requestContext.fetcher = <Result>(requestData: [info: RequestInfo, init?: RequestInit]) =>
      (fetchFn || fetchFallback)?.(...requestData).then((response: Response) => {
        requestContext.response = response;
        if (requestContext.responseHandler) {
          return requestContext.responseHandler(response) as any;
        }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          return response.json() as Result;
        } else if (contentType.includes("text/")) {
          return response.text() as Result;
        } else {
          return response.blob() as Result;
        }
      });
    requestContext.wrapResource();
  };
