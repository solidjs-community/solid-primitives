import { createResource, ResourceReturn } from "solid-js";
import { access, MaybeAccessor, Modify } from "@solid-primitives/utils";

export type RequestOptions = Modify<
  Omit<RequestInit, "body">,
  {
    headers?: RequestHeaders;
    variables?: QueryVariables;
    fetcher?: typeof fetch;
  }
>;

export type GraphQLClientQuery = {
  <T = any>(
    query: string,
    variables?: MaybeAccessor<QueryVariables | boolean>,
    initialValue?: undefined
  ): ResourceReturn<T | undefined>;
  <T = any>(
    query: string,
    variables: MaybeAccessor<QueryVariables | boolean> | undefined,
    initialValue: T
  ): ResourceReturn<T>;
};

/**
 * Creates a reactive GraphQL query client.
 *
 * @param url URL as string or accessor
 * @param headers A list of headers to supply the client
 * @param fetchFn Fetch library to use for the request
 * @returns Returns a query generator the produces Solid resources for queries
 *
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/graphql#how-to-use-it
 *
 * @example
 * ```ts
 * const newQuery = createGraphQLClient("https://foobar.com/v1/api", { authorization: "Bearer mytoken" });
 * ```
 */
export const createGraphQLClient =
  (
    url: MaybeAccessor<string>,
    headers?: RequestHeaders,
    fetchFn?: typeof fetch
  ): GraphQLClientQuery =>
  (query, variables = {}, initialValue) =>
    createResource(
      () => access(variables),
      vars => {
        const variables = typeof vars === "boolean" ? {} : vars;
        return request(access(url), query, { headers, variables, fetcher: fetchFn });
      },
      { initialValue }
    );

/**
 * Performs a GraphQL fetch to provided endpoint.
 *
 * @param url target api endpoint
 * @param query GraphQL query string *(use `gql` function)*
 * @param options config object where you can specify query variables, request headers, method, etc.
 * @returns a Promise resolving in JSON value if the request was successful
 */
export function request<T = any>(
  url: string,
  query: string,
  options: RequestOptions = {}
): Promise<T> {
  const { fetcher = fetch, variables = {}, headers = {}, method = "POST" } = options;

  return fetcher(url, {
    ...options,
    method,
    body: JSON.stringify({ query, variables }),
    headers: {
      "content-type": "application/json",
      ...headers
    }
  })
    .then(r => r.json())
    .then(({ data, errors }) => {
      if (errors) throw errors;
      return data;
    });
}

/**
 * Creates GraphQL query string
 */
export const gql = (query: TemplateStringsArray) =>
  query
    .join(" ")
    .replace(/#.+\r?\n|\r/g, "")
    .replace(/\r?\n|\r/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
