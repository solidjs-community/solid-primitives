<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Fetch" alt="Solid Primitives Fetch">
</p>

# @solid-primitives/fetch

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/fetch?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/fetch)
[![size](https://img.shields.io/npm/v/@solid-primitives/fetch?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/fetch)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Creates a primitive to support abortable HTTP requests. If any reactive request options changes, the request is aborted automatically.

## Installation

```bash
npm install @solid-primitives/fetch
# or
yarn add @solid-primitives/fetch
```

### Additional requirements

Since nodejs 17.5.0, the fetch API is available in node via the `--experimental-fetch` command line option. From version 18.0.0 upwards, it is supposed to become available out of the box. If you want to use `createFetch` on your server, but your nodejs version does not support the fetch API, you need to install node-fetch alongside this primitive:

```bash
npm install node-fetch
# or
yarn add node-fetch
```

If you fail to install it, but still run it on the server, you should see a nice error message that asks you to install it in the logs and your requests are all rejected.

## How to use it

```ts
const [resource, { mutate, refetch, abort }] = createFetch<T>(
  requestInfo: Accessor<RequestInfo | undefined> | RequestInfo,
  requestInit?: Accessor<RequestInit | undefined> | RequestInit | undefined,
  options?: { initialValue: T, name?: string }
);

resource(): T
resource.aborted: boolean
resource.error: Error | any | undefined
resource.loading: boolean
resource.status: number | null
```

Remember, just like with [`createResource`](https://www.solidjs.com/docs/latest/api#createresource), you will need an [`<ErrorBoundary>`](https://www.solidjs.com/docs/latest/api#%3Cerrorboundary%3E) to catch the errors, even if they are accessible inside the resource. Otherwise, uncaught errors might disrupt your application.

If you want to initialize a fetch request without directly starting it, you can use an Accessor that returns undefined before being set to the actual request info or url. Even if you add a RequestInit, the request will not be started without a defined RequestInfo.

## Demo

TODO

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
