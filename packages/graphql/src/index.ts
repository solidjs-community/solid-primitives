import { createResource, ResourceReturn } from "solid-js";
import { access, FalsyValue, MaybeAccessor, Modify } from "@solid-primitives/utils";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { DocumentNode, print } from "graphql";

export type RequestOptions<V extends object = {}> = Modify<
  Omit<RequestInit, "body">,
  {
    headers?: RequestHeaders;
    variables?: V;
    fetcher?: typeof fetch;
  }
>;

export type GraphQLClientQuery = {
  <T = unknown, V extends object = {}>(
    query: string | DocumentNode | TypedDocumentNode<T, V>,
    variables: MaybeAccessor<V | FalsyValue> | undefined,
    initialValue: T
  ): ResourceReturn<T>;
  <T = unknown, V extends object = {}>(
    query: string,
    variables?: MaybeAccessor<V | FalsyValue>,
    initialValue?: undefined
  ): ResourceReturn<T | undefined>;
};

/**
 * Creates a reactive GraphQL query client.
 *
 * @param url URL as string or accessor
 * @param headers A list of headers to supply the client
 * @param fetchFn Fetch library to use for the request
 * @returns Returns a query generator the produces Solid resources for queries
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/graphql#how-to-use-it
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
  (query, variables: any = {}, initialValue) =>
    createResource(
      () => access(variables),
      (vars: any) => {
        const variables = typeof vars === "boolean" ? {} : vars;
        return request(access(url), query, { headers, variables, fetcher: fetchFn });
      },
      { initialValue }
    );

/**
 * Performs a GraphQL fetch to provided endpoint.
 *
 * @param url target api endpoint
 * @param query GraphQL query string *(use `gql` function or `DocumentNode`/`TypedDocumentNode` type)*
 * @param options config object where you can specify query variables, request headers, method, etc.
 * @returns a Promise resolving in JSON value if the request was successful
 */
export async function request<T = any, V extends object = {}>(
  url: string,
  query: string | DocumentNode | TypedDocumentNode<T, V>,
  options: RequestOptions<V> = {}
): Promise<T> {
  const { fetcher = fetch, variables = {}, headers = {}, method = "POST" } = options;
  const query_ = typeof query == "string" ? query : print(query);

  return fetcher(url, {
    ...options,
    method,
    body: JSON.stringify({ query: query_, variables }),
    headers: {
      "content-type": "application/json",
      ...headers
    }
  })
    .then((r: any) => r.json())
    .then(({ data, errors }: any) => {
      if (errors) throw errors;
      return data;
    });
}

/**
 * Creates a GraphQL query string.
 */
export const gql = (query: TemplateStringsArray) =>
  query
    .join(" ")
    .replace(/#.+\r?\n|\r/g, "")
    .replace(/\r?\n|\r/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
