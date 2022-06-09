<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Visibility%20Observer" alt="Solid Primitives Visibility Observer">
</p>

# @solid-primitives/visibility-observer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/visibility-observer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/visibility-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/visibility-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/visibility-observer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

- [`createPageVisibility`](#createPageVisibility) - Creates a signal with a boolean value identifying the page visibility state
- [`usePageVisibility`](#usePageVisibility) - A [shared-root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot) alternative.

## Installation

```
npm install @solid-primitives/visibility-observer
# or
yarn add @solid-primitives/visibility-observer
```

## `createPageVisibility`

Creates a signal with a boolean value identifying the page visibility state.

### How to use it

```ts
import { createPageVisibility } from "@solid-primitives/visibility-observer";

const visible = createPageVisibility();

createEffect(() => {
  visible(); // => boolean
});
```

## `usePageVisibility`

`usePageVisibility` is a [shared root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSharedRoot) primitive. It is providing the same signal as `createPageVisibility`, but the event-listener and the signal are shared between dependents, making it more optimized to use in multiple places at once.

### How to use it

```ts
import { usePageVisibility } from "@solid-primitives/visibility-observer";

const visible = usePageVisibility();

createEffect(() => {
  visible(); // => boolean
});
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial commit of the visibility observer.

2.0.0

Rename `createPageVisibilityObserver` to `createPageVisibility` _(no longer exported as default)_

Add `usePageVisibility`

</details>
