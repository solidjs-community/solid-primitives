# @solid-primitives/local-store

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## WARNING!: This primitive is deprecated in favour of the new/incoming Storage primitive. This package will be available but unmaintained.

Creates a general local storage handler for LocalStorage, SessionStorage or your own engine.

`createLocalStore` - A single primitive can handle localStorage and localSession.

## How to use it

```ts
const [value, setValue] = createStorage("app");
setValue("foo", "bar");
console.log(value.foo);
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-local-store-6wc4c?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First developed commit.

1.1.4

Added ability to stringify storage.

</details>
