# @solid-primitives/graphql

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/audio?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/graphql)
[![size](https://img.shields.io/npm/v/@solid-primitives/graphql?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/graphql)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Creates a reactive GraphQL query client.

## Installation

```
npm install @solid-primitives/graphql
# or
yarn add @solid-primitives/graphql
```

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

1.0.3

Released with CJS support.

1.0.4

Updated to latest Solid.

</details>
