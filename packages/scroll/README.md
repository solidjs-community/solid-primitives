# @solid-primitives/scroll

Helpful primitives to manage browser scrolling.

`createScrollObserver` - Helpful monitor that reports the current position of an element or window.

## Primitive ideas:

`createScrollTo` - A primitive to support scroll to a target
`createHashScroll` - A primitive to support scrolling based on a hashtag change

## How to use it

```ts
const position = createScrollObserver();
```

or

```ts
let ref;
const position = createScrollObserver(() => ref);
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-create-audio-6wc4c?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

First ported commit from react-use-localstorage.

</details>

## Contributors

Ported from the amazing work by at https://github.com/dance2die/react-use-localstorage.
