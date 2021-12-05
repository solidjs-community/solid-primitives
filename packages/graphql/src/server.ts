import { Accessor } from "solid-js";
import { default as createGraphQL } from "./index";
import nodeFetch from "node-fetch";

const createGraphQLClient = (
  url: string | Accessor<string>,
  headers: RequestHeaders = {},
  fetcher = nodeFetch
) => {
  return createGraphQL(
    url,
    headers,
    fetcher as (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>
  );
};

export default createGraphQLClient;
