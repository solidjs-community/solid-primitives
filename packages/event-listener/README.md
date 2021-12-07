# @solid-primitives/event-listener

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/event-listener?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/event-listener)
[![size](https://img.shields.io/npm/v/@solid-primitives/event-listener?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/event-listener)

A helpful event listener primitive that binds window and any element supplied.

- [`createEventListener`](#createEventListener) - Very basic and straightforward primitive that handles multiple elements according to a single event binding.
- [`createEventSignal`](#createEventListener) - Like `createEventListener`, but events are handled with the returned signal, instead of with a callback.
- [`WindowEventListener`](#WindowEventListener) - Listen to the `window` DOM Events, using a component.
- [`DocumentEventListener`](#DocumentEventListener) - The same as [`WindowEventListener`](#WindowEventListener), but listens to `document` events.

## Installation

```bash
npm install @solid-primitives/event-listener
# or
yarn add @solid-primitives/event-listener
```

## `createEventListener`

Can be used to listen to DOM or Custom Events on window, document, list of HTML elements or any EventTarget. The target prop can be reactive.

### How to use it

A very straightforward primitive that handles multiple elements according to a single event binding.

```ts
import { createEventListener } from "@solid-primitives/event-listener";

createEventListener(
  document.getElementById("mybutton"),
  "mousemove",
  e => console.log("x:", e.pageX, "y:", e.pageY),
  { passive: true }
);

// target element can be a reactive signal
const [ref, setRef] = createSignal<HTMLElement>();
createEventListener(ref, "click", e => {});

// you can provide your own event map type as well:
createEventListener<{ myCustomEvent: Event }>(window, "myCustomEvent", () => console.log("yup!"));
// just don't use interfaces as EventMaps!
```

### Directive Usage

props passed to the directive are also reactive, so you can change handlers on the fly.

```tsx
import { eventListener } from "@solid-primitives/event-listener";
// avoids tree-shaking the directive:
eventListener;

<button use:eventListener={["click", () => console.log("Click")]}>Click!</button>;
```

### Types

```ts
// DOM Events
function (
  target: MaybeAccessor<Many<Target>>,
  eventName: MaybeAccessor<EventName>,
  handler: (event: EventMap[EventName]) => void,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): void;

// Custom Events
function createEventListener<
  EventMap extends Record<string, Event>,
  EventName extends keyof EventMap
>(
  target: MaybeAccessor<Many<EventTarget>>,
  eventName: MaybeAccessor<EventName>,
  handler: (event: EventMap[EventName]) => void,
  options?: MaybeAccessor<boolean | AddEventListenerOptions>
): void;

// Directive
function eventListener(
  target: Element,
  props: Accessor<EventListenerDirectiveProps>
): EventListenerReturn;

type EventListenerDirectiveProps = [
  name: string,
  handler: (e: any) => void,
  options?: AddEventListenerOptions | boolean
];
```

## `createEventSignal`

Like [`createEventListener`](#createEventListener), but events are handled with the returned signal, instead of with a callback.

### How to use it

```ts
import { createEventSignal } from "@solid-primitives/event-listener";

// all arguments can be reactive signals
const lastEvent = createEventSignal(el, "mousemove", { passive: true });

createEffect(() => {
  console.log(lastEvent().x, lastEvent().y);
});
```

## `WindowEventListener`

Listen to the `window` DOM Events, using a component.

You can use it with any Solid's Control-Flow components, e.g. `<Show/>` or `<Switch/>`.

The event handler prop is reactive, so you can use it with signals.

### How to use it

```tsx
import { WindowEventListener } from "@solid-primitives/event-listener";

<WindowEventListener onMouseMove={e => console.log(e.x, e.y)} />;
```

## `DocumentEventListener`

The same as [`WindowEventListener`](#WindowEventListener), but listens to `document` events.

### How to use it

```tsx
import { DocumentEventListener } from "@solid-primitives/event-listener";

<DocumentEventListener onMouseMove={e => console.log(e.x, e.y)} />;
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-event-listener-elti5

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First ported commit from react-use-event-listener.

1.1.4

Released a version with type mostly cleaned up.

1.2.3

Switched to a more idiomatic pattern: Warning: incompatible with the previous version!

1.2.5

Added CJS build.

1.2.6

Migrated to new build process.

1.3.0

**(minor breaking changes to type generics and returned functions)**
Primitive rewritten to provide better types and more reliable usage. Added DocumentEventListener & WindowEventListener components.

</details>
