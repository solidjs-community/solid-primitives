<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Intersection%20Observer" alt="Solid Primitives Intersection Observer">
</p>

# @solid-primitives/intersection-observer

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/intersection-observer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/intersection-observer)
[![size](https://img.shields.io/npm/v/@solid-primitives/intersection-observer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/intersection-observer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A range of IntersectionObserver API utilities great for different types of use cases:

- [`makeIntersectionObserver`](#makeintersectionobserver) - A non-reactive, imperative wrapper around the IntersectionObserver API.
- [`createIntersectionObserver`](#createintersectionobserver) - A reactive observer primitive.
- [`createViewportObserver`](#createviewportobserver) - More advanced tracker that creates a store of element signals.
- [`createVisibilityObserver`](#createvisibilityobserver) - Basic visibility observer using a signal.

## Installation

```bash
npm install @solid-primitives/intersection-observer
# or
pnpm add @solid-primitives/intersection-observer
# or
yarn add @solid-primitives/intersection-observer
```

## `makeIntersectionObserver`

A non-reactive, imperative wrapper around the native IntersectionObserver API. Useful when you need full manual control over observation lifecycle without integrating into a Solid reactive scope.

```ts
import { makeIntersectionObserver } from "@solid-primitives/intersection-observer";

const { add, remove, start, stop, reset, instance } = makeIntersectionObserver(
  [el1, el2],
  entries => {
    entries.forEach(e => console.log(e.isIntersecting));
  },
  { threshold: 0.5 },
);

add(el3);
remove(el1);
stop(); // disconnects the observer
```

### Definition

```ts
function makeIntersectionObserver(
  elements: Element[],
  onChange: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): {
  add: (el: Element) => void;
  remove: (el: Element) => void;
  start: () => void;
  reset: () => void;
  stop: () => void;
  instance: IntersectionObserver;
};
```

## `createIntersectionObserver`

Returns a **store array** of `IntersectionObserverEntry` objects — one slot per element, updated in place when that element's intersection state changes. Because the return value is a Solid store, reading `entries[i].isIntersecting` only re-runs the computation that reads it, not every computation that reads the array.

```tsx
import { createIntersectionObserver } from "@solid-primitives/intersection-observer";

const [targets, setTargets] = createSignal<Element[]>([]);

const entries = createIntersectionObserver(targets, { threshold: 0.5 });

createEffect(() => {
  entries.forEach(e => console.log(e.isIntersecting));
});

<div ref={el => setTargets(p => [...p, el])} />;
```

`options` may be a reactive accessor — if the options object changes, the observer is disconnected and recreated with the new options, and all currently tracked elements are re-observed.

### Definition

```ts
function createIntersectionObserver(
  elements: Accessor<Element[]>,
  options?: MaybeAccessor<IntersectionObserverInit>,
): readonly IntersectionObserverEntry[];
```

## `createViewportObserver`

This primitive comes with a number of flexible options. You can specify a callback at the root with an array of elements or individual callbacks for individual elements.

```tsx
import { createViewportObserver } from '@solid-primitives/intersection-observer';

// Basic usage:
const [add, { remove, start, stop, instance }] = createViewportObserver(els, e => {...});
add(el, e => console.log(e.isIntersecting))

// Directive usage:
const [intersectionObserver] = createViewportObserver()
<div use:intersectionObserver={(e) => console.log(e.isIntersecting)}></div>
```

### Definition

```ts
function createViewportObserver(
  elements: MaybeAccessor<Element[]>,
  callback: EntryCallback,
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;
function createViewportObserver(
  initial: MaybeAccessor<[Element, EntryCallback][]>,
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;
function createViewportObserver(
  options?: IntersectionObserverInit,
): CreateViewportObserverReturnValue;
```

## `createVisibilityObserver`

Creates a reactive signal that changes when a single element's visibility changes. Takes the element to observe directly — the previous curried factory pattern has been removed.

The element may be a reactive accessor (`() => el`) or a plain DOM element. Passing a falsy accessor value removes the element from the observer.

Signal writes from the `IntersectionObserver` callback are wrapped in `runWithOwner` to correctly bind writes to the reactive scope that created the observer.

```tsx
import { createVisibilityObserver } from "@solid-primitives/intersection-observer";

let el: HTMLDivElement | undefined;

// make sure that you pass the element reference in a thunk if it is undefined initially
const visible = createVisibilityObserver(() => el, { threshold: 0.8 });

<div ref={el}>{visible() ? "Visible" : "Hidden"}</div>;
```

Options accepted in addition to `IntersectionObserverInit`:

- `initialValue` — Initial value of the signal _(default: false)_

### Setter callback

`createVisibilityObserver` accepts an optional setter callback as the third argument. It is called when the element's intersection changes and should return a boolean indicating whether the element is visible.

```ts
let el: HTMLDivElement | undefined;

const visible = createVisibilityObserver(
  () => el,
  { threshold: 0.8 },
  entry => {
    // do some calculations on the intersection entry
    return entry.isIntersecting;
  },
);
```

**Exported modifiers**

#### `withOccurrence`

It provides information about element occurrence in the viewport — `"Entering"`, `"Leaving"`, `"Inside"` or `"Outside"`.

```tsx
import { createVisibilityObserver, withOccurrence } from "@solid-primitives/intersection-observer";

let el: HTMLDivElement | undefined;

const visible = createVisibilityObserver(
  () => el,
  { threshold: 0.8 },
  withOccurrence((entry, { occurrence }) => {
    console.log(occurrence); // => "Entering" | "Leaving" | "Inside" | "Outside"
    return entry.isIntersecting;
  }),
);
```

#### `withDirection`

It provides information about element direction on the screen — `"Left"`, `"Right"`, `"Top"`, `"Bottom"` or `"None"`.

```ts
import { createVisibilityObserver, withDirection } from "@solid-primitives/intersection-observer";

let el: HTMLDivElement | undefined;

const visible = createVisibilityObserver(
  () => el,
  { threshold: 0.8 },
  withDirection((entry, { directionY, directionX, visible }) => {
    if (!entry.isIntersecting && directionY === "Top" && visible) {
      return true;
    }
    return entry.isIntersecting;
  }),
);
```

### Definition

```ts
function createVisibilityObserver(
  element: Accessor<Element | FalsyValue> | Element,
  options?: IntersectionObserverInit & { initialValue?: boolean },
  setter?: MaybeAccessor<VisibilitySetter>,
): Accessor<boolean>;
```

## Demo

[a working example](https://primitives.solidjs.community/playground/intersection-observer/) ([source](https://github.com/solidjs-community/solid-primitives/tree/main/packages/intersection-observer/dev))

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
