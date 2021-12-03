import { Accessor } from "solid-js";
import { default as createGraphQL } from "./index";
import nodeFetch from 'node-fetch';

/**
 * Creates a reactive GraphQL query client.
 *
 * @param string URL as string or accessor
 * @param headers A list of headers to supply the client
 * @param function Fetch library to use for the request
 * @returns Returns a query generator the produces Solid resources for queries
 *
 * @example
 * ```ts
 * const newQuery = createGraphQLClient("https://foobar.com/v1/api", { authorization: "Bearer mytoken" });
 * ```
 */
const createGraphQLClient = (
  url: string | Accessor<string>,
  headers: RequestHeaders = {},
  fetcher = nodeFetch
) => {
  return createGraphQL(
    url,
    headers,
    fetcher as (
      input: RequestInfo,
      init?: RequestInit | undefined
    ) => Promise<Response>
  );
};

export default createGraphQLClient;
