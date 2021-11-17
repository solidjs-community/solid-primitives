---
Name: graphql
Package: "@solid-primitives/graphql"
Primitives: createGraphQLClient
---

# @solid-primitives/graphql

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/audio)](https://bundlephobia.com/package/@solid-primitives/graphql)
[![size](https://img.shields.io/npm/v/@solid-primitives/graphql)](https://www.npmjs.com/package/@solid-primitives/graphql)

Creates a reactive GraphQL query client.

## How to use it

```ts
const newQuery = createGraphQLClient("https://foobar.com/v1/api");
const [data, { refetch }] = newQuery(
  gql`
    query data($path: ID!) {
      PageItem(id: $path) {
        content {
          body
        }
      }
    }
  `,
  () => ({ path: "home" })
);
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-graphql-query-4ljs7?file=/src/createGraphQLClient.ts

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial commit and publish of primitive.

</details>
