---
Name: scroll
Package: "@solid-primitives/scroll"
Primitives: createScrollObserver
---

# @solid-primitives/scroll

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/scroll)](https://bundlephobia.com/package/@solid-primitives/scroll)
[![size](https://img.shields.io/npm/v/@solid-primitives/scroll)](https://www.npmjs.com/package/@solid-primitives/scroll)

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

You may view a working example here: https://codesandbox.io/s/solid-primitives-scroll-csg7f

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial porting of the scroll primitive.

</details>

## Contributors

Ported from the amazing work by at https://github.com/dance2die/react-use-localstorage.
