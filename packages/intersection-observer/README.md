<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Intersection%20Observer" alt="Solid Primitives Intersection Observer">
</p>

# @solid-primitives/intersection-observer

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/intersection-observer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/intersection-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/intersection-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/intersection-observer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A range of IntersectionObserver API utilities great for different types of use cases:

- `makeIntersectionObserver` - Creates a basic non-reactive Intersection Observer exposing methods to manage the observable.
- `createIntersectionObserver` - A reactive observer primitive.
- `createViewportObserver` - More advanced tracker that creates a store of element signals.
- `createVisibilityObserver` - Basic visibility observer using a signal.

## Installation

```bash
npm install @solid-primitives/intersection-observer
# or
yarn add @solid-primitives/intersection-observer
```

## How to use them

### makeIntersectionObserver

```tsx
// Basic usage:
const { add, remove, start, stop, instance }] = makeIntersectionObserver(els, entries => {
  entries.forEach(e => console.log(e.isIntersecting));
});
add(el)

// Directive usage:
const { add: intersectionObserver } = makeIntersectionObserver([], entries => {
  entries.forEach(e => console.log(e.isIntersecting));
});
<div use:intersectionObserver></div>
```

#### Definition

```ts
function makeIntersectionObserver = (
  elements: Element[],
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): {
  add:  AddIntersectionObserverEntry,
  remove:  RemoveIntersectionObserverEntry;
  start: () =>  void;
  reset: () =>  void;
  stop: () =>  void;
  instance: IntersectionObserver;
}
```

### createIntersectionObserver

```tsx
// Basic usage:
const [add, { remove, start, stop, instance }] = createIntersectionObserver(els, entries => {
  entries.forEach(e => console.log(e.isIntersecting));
});
add(el)

// Directive usage:
const [intersectionObserver] = createIntersectionObserver()
<div use:intersectionObserver></div>
```

#### Definition

```ts
function createIntersectionObserver = (
  elements: Accessor<Element[]>,
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverInit
)
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

#### Definition

```ts
function createVisibilityObserver = (
  element: MaybeAccessor<Element>,
  options?: IntersectionObserverInit & {
    initialValue?: boolean;
    once?: boolean;
  }
): [
  Accessor<boolean>,
  {
    start: () =>  void;
    stop: () =>  void;
    instance: IntersectionObserver
  }
]
```

### createVisibilityObserver

```ts
const [isVisible, { start, stop, instance }] = createVisibilityObserver(() => el, { once: true });
```

#### Definition

```ts
function createViewportObserver(
  elements: MaybeAccessor<Element[]>,
  callback: EntryCallback,
  options?: IntersectionObserverInit
): CreateViewportObserverReturnValue;
```

## Demo

You may view a working example here: https://stackblitz.com/edit/vitejs-vite-n2lwpq

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
