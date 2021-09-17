# @solid-primitives/fetch

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Creates a primitive to support abortable HTTP requests. If any reactive request options changes, the request is aborted automatically.

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

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release adapted from https://github.com/microcipcip/vue-use-kit/blob/master/src/functions/useFetch/useFetch.ts.

</details>
