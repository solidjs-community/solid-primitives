# @solid-primitives/mutation-observer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/mutation-observer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/mutation-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/mutation-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/mutation-observer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Primitive providing the ability to watch for changes made to the DOM tree. A wrapper for Browser's [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) API.

## Installation

```
npm install @solid-primitives/mutation-observer
# or
yarn add @solid-primitives/mutation-observer
```

## How to use it

### createMutationObserver

```ts
import { createMutationObserver } from "@solid-primitives/mutation-observer";

// Simple usage with on a single parent element.
let ref!: HTMLElement;
createMutationObserver(
  () => ref,
  { attributes: true, subtree: true },
  records => console.log(records)
);

// Observing multiple parent elements:
createMutationObserver(
  () => [el1, el2, el3],
  { attributes: true, subtree: true },
  e => {...}
);

// Set individual MutationObserver options:
createMutationObserver(
  [
    [el, { attributes: true, subtree: true }],
    [el1, { childList: true }]
  ],
  e => {...}
);

// Primitive return usefull values:
const [observe, {start, stop, instance}] = createMutationObserver(el, options, handler)

observe(el1, { childList: true })
stop()
```

### Directive Usage

```tsx
// You have to name it as "mutationObserver" when using typescript
const [mutationObserver] = createMutationObserver([], e => {...})

<div use:mutationObserver={{ childList: true }}>...</div>
```

### Standalone Directive Usage

```tsx
import { mutationObserver } from "@solid-primitives/mutation-observer";

// has to be used in code to avoid tree-shaking it:
mutationObserver;

<div use:mutationObserver={[{ childList: true }, e => {...}]}>...</div>
```

### Types

```ts
function createMutationObserver(
  initial: MaybeAccessor<Node | Node[]>,
  options: MutationObserverInit,
  callback: MutationCallback
): MutationObserverReturn;
function createMutationObserver(
  initial: MaybeAccessor<[Node, MutationObserverInit][]>,
  callback: MutationCallback
): MutationObserverReturn;

type MutationObserverReturn = [
  add: MutationObserverAdd,
  rest: {
    start: Fn;
    stop: Fn;
    instance: MutationObserver;
    isSupported: boolean;
  }
];

type MutationObserverAdd = (target: Node, options?: MaybeAccessor<MutationObserverInit>) => void;
```

## Demo

https://codesandbox.io/s/solid-mutation-observer-p59tu?file=/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial release as a Stage-2 primitive.

1.0.2

Added support for CJS and cleaned up docs.

1.0.3

Updated utility package dependency.

1.0.4

Updated to Solid 1.3

</details>
