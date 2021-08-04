# @solid-primitives/graphql

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

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
