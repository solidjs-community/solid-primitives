<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Intersection%20Observer" alt="Solid Primitives">
</p>

# @solid-primitives/intersection-observer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/intersection-observer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/intersection-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/intersection-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/intersection-observer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A range of IntersectionObserver API utilities great for different types of usecases:

- `createIntersectionObserver` - Creates a basic intersection observer exposing methods to manage the observable.
- `createViewportObserver` - More advanced tracker that creates a store of element signals.
- `createVisibilityObserver` - Basic visibility observer using a signal.

## Installation

```bash
npm install @solid-primitives/intersection-observer
# or
yarn add @solid-primitives/intersection-observer
```

## How to use them

### createIntersectionObserver

```tsx
// Basic usage:
const [add, { remove, start, stop, instance }] = createIntersectionObserver(els, entries => {
  entries.forEach(e => console.log(e.isIntersecting));
});
add(el)

// Directive usage:
const [observer] = createIntersectionObserver()
<div use:observer></div>
```

### createViewportObserver

This primitive comes with a number of flexible options. You can specify a callback at the root with an array of elements or individual callbacks for individual elements.

```tsx
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

1.1.1

Minor type adjustments.

1.1.2

Released with CJS support.

1.1.11

After a couple rounds, patched CJS support.

1.2.0

Patched issue with observer only firing once and disconnecting not functional.

1.2.1

Updated to Solid 1.3

1.2.2

Minor improvements

</details>
