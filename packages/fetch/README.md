# @solid-primitives/fetch

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/fetch?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/fetch)
[![size](https://img.shields.io/npm/v/@solid-primitives/fetch?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/fetch)

Creates a primitive to support abortable HTTP requests. If any reactive request options changes, the request is aborted automatically.

## Installation

```bash
npm install @solid-primitives/fetch
# or
yarn add @solid-primitives/fetch
```

## How to use it

```ts
const [resource, { mutate, refetch, abort }] = createFetch<T>(
  requestInfo: Accessor<RequestInfo> | RequestInfo,
  requestInit?: Accessor<RequestInit> | RequestInit,
  options?: { initialValue: T, name?: string }
);

resource(): T
resource.aborted: boolean
resource.error: Error | any | undefined
resource.loading: boolean
resource.status: number | null
```

Remember, just like with [`createResource`](https://www.solidjs.com/docs/latest/api#createresource), you will need an [`<ErrorBoundary>`](https://www.solidjs.com/docs/latest/api#%3Cerrorboundary%3E) to catch the errors, even if they are accessible inside the resource. Otherwise, uncaught errors might disrupt your application.

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release adapted from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useFetch/useFetch.ts.

0.0.105

Improve test setup

0.0.106

Add tests for error case, remove stray console.warn

1.0.5

Released CJS and SSR support.

</details>
