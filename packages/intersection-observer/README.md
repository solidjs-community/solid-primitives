# @solid-primitives/intersection-observer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Creates a helper to manage IntersectionObserver.

`createIntersectionObserver` - Creates a basic intersection observer exposing methods to manage the observable.
`createViewportObserver` - More advanced tracker that creates a store of element signals.
`createVisibilityObserver` - Basic visibility observer using a signal.

## Installation

```bash
npm install @solid-primitives/intersection-observer
# or
yarn add @solid-primitives/intersection-observer
```

## How to use it

```ts
const { add, remove, start, stop } = createIntersectionObserver(el, entry =>
  console.log(entry.isIntersecting)
);
```

or

```ts
const { add, remove, start, stop } = createViewportObserver();
add(el, entry => console.log(entry.isIntersecting));
```

or

```ts
const [visible, { start, top }] = createVisibilityObserver(el);
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-intersection-observer-h22it?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.108

Committing first version of primitive.

1.0.0

Committing first version of primitive.

</details>
