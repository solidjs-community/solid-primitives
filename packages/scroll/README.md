# @solid-primitives/scroll

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/scroll?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/scroll)
[![size](https://img.shields.io/npm/v/@solid-primitives/scroll?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/scroll)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Helpful primitives to manage browser scrolling.

`createScrollObserver` - Helpful monitor that reports the current position of an element or window.

## Installation

```
npm install @solid-primitives/scroll
# or
yarn add @solid-primitives/scroll
```

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

### Primitive ideas:

`createScrollTo` - A primitive to support scroll to a target
`createHashScroll` - A primitive to support scrolling based on a hashtag change

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial porting of the scroll primitive.

1.0.4

Released new version with CJS and SSR support.

1.0.5

Updated to Solid 1.3

</details>
