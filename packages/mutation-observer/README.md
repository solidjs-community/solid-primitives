<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Mutation%20Observer" alt="Solid Primitives Mutation Observer">
</p>

# @solid-primitives/mutation-observer

[![size](https://img.shields.io/badge/size-447_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/mutation-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/mutation-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/mutation-observer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive providing the ability to watch for changes made to the DOM tree. A wrapper for Browser's [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) API.

## Installation

```
npm install @solid-primitives/mutation-observer
# or
yarn add @solid-primitives/mutation-observer
# or
pnpm add @solid-primitives/mutation-observer
```

**Requires** `solid-js` and `@solidjs/web` >= `2.0.0-beta.13` as peer dependencies.

## How to use it

### createMutationObserver

```ts
import { createMutationObserver } from "@solid-primitives/mutation-observer";

// Use the returned `add` as a ref — options are set at creation time:
const [add] = createMutationObserver([], { childList: true }, records => console.log(records));
<div ref={add} />

// Observe multiple elements:
const [add, { start, stop }] = createMutationObserver(
  () => [el1, el2, el3],
  { attributes: true, subtree: true },
  records => console.log(records)
);

// Per-element options:
createMutationObserver(
  [[el, { attributes: true }], [el1, { childList: true }]],
  records => console.log(records)
);
```

Automatically starts observing after the component settles (via `onSettled`) and disconnects on cleanup. You can also control observation manually with `start()` and `stop()`.

### Standalone Ref

`mutationObserver` is a convenience for observing a single element without calling `createMutationObserver` separately:

```tsx
import { mutationObserver } from "@solid-primitives/mutation-observer";

<div ref={mutationObserver({ childList: true }, records => console.log(records))} />
```

### Types

```ts
function createMutationObserver(
  initial: MaybeAccessor<Node | Node[]>,
  options: MutationObserverInit,
  callback: MutationCallback,
): MutationObserverReturn;
function createMutationObserver(
  initial: MaybeAccessor<[Node, MutationObserverInit][]>,
  callback: MutationCallback,
): MutationObserverReturn;

type MutationObserverReturn = [
  add: MutationObserverAdd,
  rest: {
    start: Fn;
    stop: Fn;
    instance: MutationObserver;
    isSupported: boolean;
  },
];

type MutationObserverAdd = (target: Node, options?: MaybeAccessor<MutationObserverInit>) => void;

const mutationObserver: (
  options: MutationObserverInit,
  callback: MutationCallback,
) => (target: Element) => void;
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
