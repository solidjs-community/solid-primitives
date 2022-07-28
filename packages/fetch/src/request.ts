import { RequestContext } from "./fetch";
import { ResourceFetcherInfo } from "solid-js";

export type Request<FetcherArgs extends any[]> = <Result>(
  ...args: any[]
) => (requestContext: RequestContext<Result, FetcherArgs>) => void;

export const fetchRequest: Request<[info: RequestInfo, init?: RequestInit]> =
  (fetch = globalThis.fetch) =>
  requestContext => {
    requestContext.fetcher = <Result extends unknown>(
      requestData: [info: RequestInfo, init?: RequestInit],
      _info: ResourceFetcherInfo<Result>
    ) =>
      fetch?.(...requestData).then((response: Response) => {
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
