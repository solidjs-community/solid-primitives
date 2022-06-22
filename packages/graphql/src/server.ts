import * as api from "./index";
// @ts-ignore lack of types for node-fetch doesn't matter on the server
import nodeFetch from "node-fetch";

export const createGraphQLClient: typeof api.createGraphQLClient = (
  url,
  headers,
  fetcher = nodeFetch
) => api.createGraphQLClient(url, headers, fetcher);
export const gql = api.gql;
export const request = api.request;
