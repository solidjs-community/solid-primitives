import { RequestModifier } from "./modifiers";

import { AxiosStatic } from 'axios';

export const fetchRequest: RequestModifier =
  <T>(fetch = globalThis.fetch) =>
  requestContext => {
    requestContext.fetcher = (requestData: [info: RequestInfo, init?: RequestInit]) =>
      fetch?.(...requestData).then((response: Response) => {
        requestContext.response = response;
        if (requestContext.responseHandler) {
          return requestContext.responseHandler(response) as unknown as T;
        }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          return response.json();
        } else if (contentType.includes("text/")) {
          return response.text();
        } else {
          return response.blob();
        }
      });
    requestContext.wrapResource();
  };

export const axiosRequest: RequestModifier = <T>(axios: AxiosStatic) =>
  requestContext => {
    requestContext.fetcher = (requestData: [info: RequestInfo, init?: RequestInit]) => {
      // TODO: replace with actual axios
      return fetch?.(...requestData).then((response: Response) => {
        requestContext.response = response;
        if (requestContext.responseHandler) {
          return requestContext.responseHandler(response) as unknown as T;
        }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          return response.json();
        } else if (contentType.includes("text/")) {
          return response.text();
        } else {
          return response.blob();
        }
      });
    }
    requestContext.wrapResource();
  };
