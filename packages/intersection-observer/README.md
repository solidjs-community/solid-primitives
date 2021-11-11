# @solid-primitives/intersection-observer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

A range of utilities built around the IntersectionObserver API. Each primitive is designed to be compatible with directives or used on their own.

`createIntersectionObserver` - Creates a basic intersection observer exposing methods to manage the observable.

`createViewportObserver` - More advanced tracker that creates a store of element signals.

`createVisibilityObserver` - Basic visibility observer using a signal.

## Installation

```bash
npm install @solid-primitives/intersection-observer
# or
yarn add @solid-primitives/intersection-observer
```

## How to use them

### createIntersectionObserver

```ts
// Basic usage:
const [add, { remove, start, stop }] = createIntersectionObserver(el, entries => {
  console.log(entry.isIntersecting);
});

// Directive usage:
const [observer] = createIntersectionObserver()
<div use:observer={(e) => console.log(e.isIntersecting)}></div>
```

### createViewportObserver

```ts
// Basic usage:
const [add, { remove, start, stop, instance }] = createViewportObserver(els, e => {...});
add(el, e => console.log(e.isIntersecting))

// Directive usage:
const [observer] = createIntersectionObserver()
<div use:observer={(e) => console.log(e.isIntersecting)}></div>
```

### createVisibilityObserver

```ts
const [isVisible, { start, stop, instance }] = createVisibilityObserver(() => el, { once: true });
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-intersection-observer-h22it?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.108

Committing first version of primitive.

1.0.0

Minor improvements to structure.

1.1.0

Major improvements to types and breaking changes of the interface.

</details>
