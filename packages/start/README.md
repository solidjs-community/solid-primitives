<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=start" alt="Solid Primitives start">
</p>

# @solid-primitives/start

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/start?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/start)
[![version](https://img.shields.io/npm/v/@solid-primitives/start?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/start)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A set of primitives for Solid Start

- [`createServerCookie`](#createservercookie) - Provides a getter and setter for a reactive cookie, which works isomorphically.
- [`createUserTheme`](#createusertheme) - Creates a Server Cookie providing a type safe way to store a theme and access it on the server or client.

## Installation

```bash
npm install @solid-primitives/start
# or
yarn add @solid-primitives/start
# or
pnpm add @solid-primitives/start
```

## How to use it

## `createServerCookie`

A primitive for creating a cookie that can be accessed isomorphically on the client, or the server.

```ts
const [cookie, setCookie] = createServerCookie("cookieName");

cookie(); // => string | undefined
```

### Custom serialization

Custom cookie serializers and deserializers can also be implemented

```ts
const [serverCookie, setServerCookie] = createServerCookie("coolCookie", {
  deserialize: str => (str ? str.split(" ") : []), // Deserializes cookie into a string[]
  serialize: val => (val ? val.join(" ") : ""), // serializes the value back into a string
});

serverCookie(); // => string[]
```

## `createUserTheme`

Composes `createServerCookie` to provide a type safe way to store a theme and access it on the server or client.

```ts
const [theme, setTheme] = createUserTheme("cookieName");

theme(); // => "light" | "dark" | undefined

// with default value
const [theme, setTheme] = createUserTheme("cookieName", {
  defaultValue: "light",
});

theme(); // => "light" | "dark"
```

## Demo

You can view a demo of this primitive here: <https://codesandbox.io/p/sandbox/amazing-easley-wqk38i?file=%2Fsrc%2Fstart_primitive%2Findex.ts%3A36%2C20>

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
