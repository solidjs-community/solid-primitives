import * as api from "./index";
import nodeFetch from "node-fetch";

export const createGraphQLClient: typeof api.createGraphQLClient = (
  url,
  headers,
  fetcher = nodeFetch as any
) => api.createGraphQLClient(url, headers, fetcher);
export const gql = api.gql;
