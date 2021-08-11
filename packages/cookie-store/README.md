# @solid-primitives/cookies

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

A cookies storage facility.

`createCookieStore` - Handles creating and managing a single cookie action.

## How to use it

```ts
const [value, setValue] = createCookieStore("my-cookie", "derp");
setValue("my-new-value");
console.log(value());
```

## Demo

You may find a working example on CSB here: https://codesandbox.io/s/solid-create-cookie-store-uh192?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release.

1.1.3

Official release.

1.1.4

Patched incorrect use of serialize for the deserialize method.

</details>
