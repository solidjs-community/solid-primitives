<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=cookies" alt="Solid Primitives cookies">
</p>

# @solid-primitives/cookies

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/cookies?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/cookies)
[![version](https://img.shields.io/npm/v/@solid-primitives/cookies?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/cookies)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive, signal-based cookie primitives for isomorphic use — readable and writable on both the server and the client.

This package provides **higher-order** cookie functionality: typed reactive signals that stay in sync with `document.cookie`, with built-in SSR support via `getRequestEvent`. It is intentionally narrow in scope.

> **Looking for raw cookie read/write?** [`@solid-primitives/storage`](../storage) exposes `cookieStorage` — a `localStorage`-compatible API (`getItem`, `setItem`, `removeItem`, `key`) that works on both client and server, including full support for cookie attributes such as `domain`, `path`, `secure`, `sameSite`, and `maxAge`. Use that package when you need direct, imperative access to the cookie store.

- [`createServerCookie`](#createservercookie) - Reactive signal backed by a named cookie; isomorphic on client and server.
- [`createUserTheme`](#createusertheme) - Type-safe `"light" | "dark"` theme signal stored as a cookie.
- [`getCookiesString`](#getcookiesstring) - Returns the raw cookie string from `document.cookie` on the client or the request `Cookie` header on the server.

## Installation

```bash
npm install @solid-primitives/cookies
# or
yarn add @solid-primitives/cookies
# or
pnpm add @solid-primitives/cookies
```

Requires `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` as peer dependencies.

## How to use it

## `createServerCookie`

Creates a reactive signal whose value is persisted to a named cookie. Reading the signal works on both the server (via the request `Cookie` header) and the client (via `document.cookie`). Writing the signal on the client automatically syncs the new value back to `document.cookie`.

```ts
import { createServerCookie } from "@solid-primitives/cookies";

const [cookie, setCookie] = createServerCookie("cookieName");

cookie(); // => string | undefined
setCookie("newValue");
```

### Custom serialization

Pass `deserialize` and `serialize` functions to store non-string values.

```ts
import { createServerCookie } from "@solid-primitives/cookies";

const [serverCookie, setServerCookie] = createServerCookie("coolCookie", {
  deserialize: str => (str ? str.split(" ") : []), // Deserializes cookie into a string[]
  serialize: val => (val ? val.join(" ") : ""),     // Serializes the value back into a string
});

serverCookie(); // => string[]
```

## `createUserTheme`

Composes `createServerCookie` to provide a type-safe `"light" | "dark"` theme signal. Any unrecognized cookie value is treated as `undefined` (or the provided `defaultValue`).

```ts
import { createUserTheme } from "@solid-primitives/cookies";

const [theme, setTheme] = createUserTheme("cookieName");

theme(); // => "light" | "dark" | undefined

// with default value
const [theme, setTheme] = createUserTheme("cookieName", {
  defaultValue: "light",
});

theme(); // => "light" | "dark"
```

## `getCookiesString`

Returns the raw cookie string for the current environment — `document.cookie` in the browser, or the `Cookie` request header on the server. Use it together with `parseCookie` when you need to read a cookie value outside of a reactive context.

```ts
import { getCookiesString, parseCookie } from "@solid-primitives/cookies";

const string = getCookiesString();
const cookie = parseCookie(string, "cookie_name");
```

## Demo

You can view live examples in the [Storybook](https://primitives.solidjs.community/storybook/?path=/docs/network-cookies--docs).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
