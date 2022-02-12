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

#### Import

```ts
import { createGraphQLClient, gql, request } from "@solid-primitives/graphql";
// gql is a helper for creating GraphQL query strings
// request is an additional function to perform GraphQL requests imperatively
```

#### Using the client

`createGraphQLClient` takes 3 arguments:

- `url` - target api endpoint, as string or signal
- `headers` - _optional_, A list of request headers to supply the client
- `fetchFn` - _optional_, A fetch function to replace the default one, that is Fetch API on browser and `node-fetch` on server.

```ts
import { createGraphQLClient, gql } from "@solid-primitives/graphql";

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
  { path: "home" }
);
```

#### Preventing immediate requests

Query function is based on `createResource`, so it can be deferred in the same way - by passing `false` to the variables.

```ts
const newQuery = createGraphQLClient("https://foobar.com/v1/api");
const [data, { refetch }] = newQuery(somequery, false);

// later
refetch();
```

#### Providing Response Type

```ts
// query function accepts type generic for the response:
const [countries] = newQuery<{ countries: { name: string }[] }>(
  gql`
    query {
      countries {
        name
        code
      }
    }
  `
);
countries(); // T: { countries: { name: string }[] } | undefined
```

#### Initial value

By default the returned data type will be `T | undefined`, to make it always `T` you need to provide an initial value.

```ts
const [countries] = newQuery<{ countries: { name: string }[] }>(
  gql`
    query {
      countries {
        name
        code
      }
    }
  `,
  // no variables
  undefined,
  // the initial value
  { countries: [] }
);
countries(); // T: { countries: { name: string }[] }
```

#### Reactive query variables

Variables passed to the query can be reactive. If they change, the resource will be refetched.

```ts
const [code, setCode] = createSignal("BR");
const [data] = query(
  gql`
    query data($code: ID!) {
      country(code: $code) {
        name
      }
    }
  `,
  // function returning an object
  () => ({
    code: code()
  })
);
```

Remember, just like with [`createResource`](https://www.solidjs.com/docs/latest/api#createresource), you will need an [`<ErrorBoundary>`](https://www.solidjs.com/docs/latest/api#%3Cerrorboundary%3E) to catch the errors, even if they are accessible inside the resource. Otherwise, uncaught errors might disrupt your application.

## Demo

You may view a working example here:

https://codesandbox.io/s/solid-primitives-graphql-demo-g6fv6?file=/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial commit and publish of primitive.

1.0.3

Released with CJS support.

1.0.4

Updated to latest Solid.

1.0.6

Function argument improvements, named exports.

</details>
