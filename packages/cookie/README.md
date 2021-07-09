# @solid-primitives/cookies

A cookies storage facility.

`createCookie` - Handles creating and managing a single cookie action.

## Proposed Primitives

`createCookie` - Manages a store of cookies.
`withSerializer` - Wraps the cookie with a specified serializer.

const [ set, get ] = withSerializer(JSON, createCookie('my-cookie', 'hi));

`createCookieStore` - Manages a store of cookies.

```ts
const [ set, get ] = createCookieStore([
    withSerializer(JSON, createCookie('my-cookie-one', 'hi')),
    withSerializer(JSON, createCookie('my-cookie-two', 'hi'))
]);
```

## How to use it

## Demo

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

First ported commit from react-use-localstorage.

</details>

## Contributors

Ported from the amazing work by at https://github.com/dance2die/react-use-localstorage.
