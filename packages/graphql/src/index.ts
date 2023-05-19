import {
  createResource,
  type InitializedResourceOptions,
  type NoInfer,
  type ResourceOptions,
  type ResourceReturn,
} from "solid-js";
import { print, type DocumentNode } from "graphql";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { asAccessor, type MaybeAccessor, type Modify } from "@solid-primitives/utils";

export type RequestHeaders = { [key: string]: string };

export type RequestOptions<V extends object = {}> = Modify<
  Omit<RequestInit, "body">,
  {
    headers?: RequestHeaders;
    variables?: V;
    fetcher?: typeof fetch;
  }
>;

export type GraphQLResourceSource<V extends object = {}> = {
  url: string;
  options: RequestOptions<V>;
};

/**
 * A function returned by {@link createGraphQLClient}.
 * It wraps {@link createResource} and performs a GraphQL fetch to endpoint form the client.
 *
 * @param query GraphQL query string *(use {@link gql} function or `DocumentNode`/`TypedDocumentNode` type)*
 * @param variables variables for the GraphQL query
 * @param options options passed to {@link createResource}
 */
export type GraphQLClientQuery = {
  // initialized
  <TResult = unknown, TVariables extends object = {}>(
    query: string | DocumentNode | TypedDocumentNode<TResult, TVariables>,
    variables: MaybeAccessor<TVariables | false | undefined | null> | undefined,
    options: InitializedResourceOptions<NoInfer<TResult>, GraphQLResourceSource<TVariables>>,
  ): ResourceReturn<TResult>;
  // not initialized
  <TResult = unknown, TVariables extends object = {}>(
    query: string | DocumentNode | TypedDocumentNode<TResult, TVariables>,
    variables?: MaybeAccessor<TVariables | false | undefined | null>,
    options?: ResourceOptions<NoInfer<TResult>, GraphQLResourceSource<TVariables>>,
  ): ResourceReturn<TResult | undefined>;
};

/**
 * Creates a reactive GraphQL query client.
 *
 * @param url URL as string or accessor
 * @param options Options that will be applied to all the subsequent requests
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
    options: MaybeAccessor<Omit<RequestOptions, "variables">> = {},
  ): GraphQLClientQuery =>
  (query, variables: any = {}, resourceOptions) => {
    const getUrl = asAccessor(url),
      getVariables = asAccessor(variables),
      getOptions = asAccessor(options);
    return createResource(
      () => {
        const url = getUrl(),
          variables = getVariables(),
          options = getOptions();
        return url && variables && { url, options: { ...options, variables } };
      },
      ({ url, options }) => request(url, query, options),
      resourceOptions,
    );
  };

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
  options: RequestOptions<V> = {},
): Promise<T> {
  const { fetcher = fetch, variables = {}, headers = {}, method = "POST" } = options;
  const query_ = typeof query == "string" ? query : print(query);

  return fetcher(url, {
    ...options,
    method,
    body: JSON.stringify({ query: query_, variables }),
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  })
    .then((r: any) => r.json())
    .then(({ data, errors }: any) => {
      if (errors) throw errors;
      return data;
    });
}

/**
 * Performs a multi-part GraphQL fetch to provided endpoint.
 *
 * @param url target api endpoint
 * @param query GraphQL query string *(use `gql` function or `DocumentNode`/`TypedDocumentNode` type)*
 * @param options config object where you can specify query variables, request headers, method, etc.
 * @returns a Promise resolving in JSON value if the request was successful
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/graphql#file-upload-support
 */
export async function multipartRequest<T = any, V extends object = {}>(
  url: string,
  query: string | DocumentNode | TypedDocumentNode<T, V>,
  options: Omit<RequestOptions<V>, "method"> = {},
): Promise<T> {
  const { fetcher = fetch, variables = {}, headers = {} } = options;
  const query_ = typeof query == "string" ? query : print(query);

  return fetcher(url, {
    ...options,
    method: "POST",
    body: makeMultipartBody(query_, variables),
    headers: {
      "content-type": "multipart/form-data",
      ...headers,
    },
  })
    .then((r: any) => r.json())
    .then(({ data, errors }: any) => {
      if (errors) throw errors;
      return data;
    });
}

/**
 * Converts GraphQL query and variables into a multipart/form-data compatible format.
 *
 * @param query GraphQL query string
 * @param variables variables used in the mutation (File and Blob instances can be used as values).
 * @returns a FormData object, ready to be POSTed
 */
export function makeMultipartBody(query: string, variables: object) {
  const parts: { blob: Blob; path: string }[] = [];

  // We don't want to modify the variables passed in as arguments
  // so we do a deep copy and we replace instances of Blobs with
  // a null and generate the correct object-path as we go.

  function copyValue(r: any, k: string | number, v: any, path: (string | number)[]) {
    if (v instanceof Blob) {
      parts.push({
        blob: v,
        path: path.join(".") + "." + k,
      });
      r[k] = null;
    } else {
      if (typeof v === "object" && v != null) {
        path.push(k);
        r[k] = copyObject(v, path);
        path.pop();
      } else {
        r[k] = v;
      }
    }
  }

  function copyObject(obj: object, path: (string | number)[]) {
    const r: any = obj.constructor();
    for (const [k, v] of Object.entries(obj)) {
      copyValue(r, k, v, path);
    }
    return r;
  }

  variables = copyObject(variables, ["variables"]);

  const formData = new FormData();
  formData.append("operations", JSON.stringify({ query, variables }));
  formData.append("map", JSON.stringify(Object.fromEntries(parts.map((x, i) => [`${i}`, x.path]))));
  for (let i = 0; i < parts.length; i++) {
    formData.append(`${i}`, parts[i]!.blob);
  }
  return formData;
}

/**
 * Creates a GraphQL query string.
 */
export const gql = (query: TemplateStringsArray, ...expressions: any[]) =>
  query
    .map((s, i) => `${s}${expressions[i] ?? ""}`)
    .join("")
    .replace(/#.+\r?\n|\r/g, "")
    .replace(/\r?\n|\r/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
