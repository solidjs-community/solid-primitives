import { Accessor, createResource } from "solid-js";

type QueryVariables = { [key: string]: string | number };
type Headers = { [key: string]: string };

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
  headers: Headers = {},
  fetcher = fetch
 ) => {
  return (query: string, variables: Accessor<QueryVariables>) => {
    return createResource(variables, async (variables) =>
      fetcher(typeof url === "function" ? url() : url, {
        method: "POST",
        body: JSON.stringify({ query, variables }),
        headers: {
          "content-type": "application/json",
          ...headers
        }
      })
        .then((r) => r.json())
        .then(({ data, errors }) => {
          if (errors) {
            throw errors;
          }
          return data;
        })
    );
  };
};
export const gql = (query: Array<string>) =>
  query
    .join(" ")
    .replace(/#.+\r?\n|\r/g, "")
    .replace(/\r?\n|\r/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
 
export default createGraphQLClient;
