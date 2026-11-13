<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Mouse" alt="Solid Primitives Mouse">
</p>

# @solid-primitives/mouse

[![size](https://img.shields.io/badge/size-1.75_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/mouse)
[![size](https://img.shields.io/npm/v/@solid-primitives/mouse?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/mouse)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

A collection of primitives, capturing current mouse cursor position, and helping to deal with common usecases:

##### Reactive primitives:

- [`createMousePosition`](#createmouseposition) - Listens to the mouse events, providing a reactive up-to-date position of the cursor on the page.
- [`createPositionToElement`](#createpositiontoelement) - Provides an auto-updating position relative to a provided element.

##### Non-reactive primitives:

- [`makeMousePositionListener`](#makemousepositionlistener) - Attaches event listeners to provided target, listening for changes to the mouse/touch position.
- [`makeMouseInsideListener`](#makemouseinsidelistener) - Attaches event listeners to provided target, listening for mouse/touch entering/leaving the element.

##### Calculations:

- [`getPositionToElement`](#getpositiontoelement) - Turn position relative to the page, into position relative to an element.
- [`getPositionInElement`](#getpositioninelement) - Turn position relative to the page, into position relative to an element. Clamped to the element bounds.
- [`getPositionToScreen`](#getpositiontoscreen) - Turn position relative to the page, into position relative to the screen.

## Installation

```bash
npm install @solid-primitives/mouse
# or
pnpm add @solid-primitives/mouse
# or
yarn add @solid-primitives/mouse
```

## `createMousePosition`

Attaches event listeners to provided target, providing a reactive up-to-date position of the cursor on the page.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createMousePosition } from "@solid-primitives/mouse";

function Demo() {
  const [el, setEl] = createSignal<HTMLDivElement>();
  const pos = createMousePosition(() => el()!);
  return (
    <>
      <div
        ref={setEl}
        style={{ width: "240px", height: "120px", background: pos.isInside ? "#6366f1" : "#ddd" }}
      />
      <p>
        x: {Math.round(pos.x)}, y: {Math.round(pos.y)}, inside: {String(pos.isInside)}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

#### Usage

```tsx
import { createMousePosition } from "@solid-primitives/mouse";

const pos = createMousePosition(window);
createEffect(() => {
  console.log(pos.x, pos.y);
});

// target can be a reactive signal
const [el, setEl] = createSignal(ref);
const pos = createMousePosition(el);

// if using a jsx ref, pass it as a function, or wrap primitive inside onMount
let ref;
const pos = createMousePosition(() => ref);
<div ref={ref}></div>;
```

By default `createMousePosition` is listening to `touch` events as well. You can disable that behavior with `touch` and `followTouch` options.

```ts
// disables following touch position – only registers touch start
const pos = createMousePosition(window, { followTouch: false });

// disables listening to any touch events
const pos = createMousePosition(window, { touch: false });
```

#### `useMousePosition`

This primitive provides a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) variant that will listen to window mouse position, and reuse event listeners and signals across dependents.

```ts
const pos = useMousePosition();
createEffect(() => {
  console.log(pos.x, pos.y);
});
```

#### Definition

```ts
function createMousePosition(
  target?: MaybeAccessor<SVGSVGElement | HTMLElement | Window | Document>,
  options?: MousePositionOptions,
): MousePositionInside;
```

## `createPositionToElement`

Provides an autoupdating position relative to an element based on provided page position.

```tsx repl
import { render } from "@solidjs/web";
import { createMousePosition, createPositionToElement } from "@solid-primitives/mouse";

function Demo() {
  let ref!: HTMLDivElement;
  const mouse = createMousePosition(window);
  const relative = createPositionToElement(
    () => ref,
    () => mouse,
  );
  return (
    <>
      <div ref={ref} style={{ width: "240px", height: "120px", border: "1px solid #999" }} />
      <p>
        relative x: {Math.round(relative.x)}, y: {Math.round(relative.y)}, inside:{" "}
        {String(relative.isInside)}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

#### Usage

```ts
import { createPositionToElement, useMousePosition } from "@solid-primitives/mouse";

const pos = useMousePosition();
const relative = createPositionToElement(ref, () => pos);

createEffect(() => {
  console.log(relative.x, relative.y);
});

// target can be a reactive signal
const [el, setEl] = createSignal(ref);
const relative = createPositionToElement(el, () => pos);

// if using a jsx ref, pass it as a function, or wrap primitive inside onMount
let ref;
const relative = createPositionToElement(() => ref);
<div ref={ref}></div>;
```

#### Definition

```ts
function createPositionToElement(
  element: Element | Accessor<Element | undefined>,
  pos: Accessor<Position>,
  options?: PositionToElementOptions,
): PositionRelativeToElement;
```

## Non-reactive primitives:

### `makeMousePositionListener`

###### Added id `@2.0.0`

Attaches event listeners to provided target, listening for changes to the mouse/touch position.

```ts
const clear = makeMousePositionListener(el, pos => console.log(pos), { touch: false });
// remove listeners manually (will happen on cleanup)
clear();
```

### `makeMouseInsideListener`

###### Added id `@2.0.0`

Attaches event listeners to provided target, listening for mouse/touch entering/leaving the element.

```ts
const clear = makeMouseInsideListener(el, inside => console.log(inside), { touch: false });
// remove listeners manually (will happen on cleanup)
clear();
```

## Calculations

### `getPositionToElement`

Turn position relative to the page, into position relative to an element.

```ts
const pos = getPositionToElement(pageX, pageY, element);
```

### `getPositionInElement`

Turn position relative to the page, into position relative to an element. Clamped to the element bounds.

```ts
const pos = getPositionInElement(pageX, pageY, element);
```

### `getPositionToScreen`

Turn position relative to the page, into position relative to the screen.

```ts
const pos = getPositionToScreen(pageX, pageY);
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
