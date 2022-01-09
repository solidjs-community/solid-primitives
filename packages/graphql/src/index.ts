import { createResource } from "solid-js";
import { access, isFunction, MaybeAccessor } from "@solid-primitives/utils";

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
export const createGraphQLClient =
  (url: MaybeAccessor<string>, headers: RequestHeaders = {}, fetchFn = fetch) =>
  (query: string, variables: MaybeAccessor<QueryVariables> = {}) => {
    const fetcher = async (variables: QueryVariables) =>
      fetchFn(access(url), {
        method: "POST",
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

    return isFunction(variables)
      ? createResource(variables, fetcher)
      : createResource(() => fetcher(variables));
  };

export const gql = (query: TemplateStringsArray) =>
  query
    .join(" ")
    .replace(/#.+\r?\n|\r/g, "")
    .replace(/\r?\n|\r/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
