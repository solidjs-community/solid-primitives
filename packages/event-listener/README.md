# @solid-primitives/event-listener

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/event-listener?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/event-listener)
[![size](https://img.shields.io/npm/v/@solid-primitives/event-listener?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/event-listener)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/davedbase/solid-primitives#contribution-process)

A set of primitives that help with listening to DOM and Custom Events.

- [`createEventListener`](#createEventListener) - Very basic and straightforward primitive that handles multiple elements according to a single event binding.
- [`createEventSignal`](#createEventListener) - Like `createEventListener`, but events are handled with the returned signal, instead of with a callback.
- [`createEventListenerMap`](#createEventListenerMap) - A helpful primitive that listens to a map of events. Handle them by individual callbacks.
- [`createEventStore`](#createEventStore) - Similar to `createEventListenerMap`, but provides a reactive store with the latest captured events.
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

```ts
import { createEventListener } from "@solid-primitives/event-listener";

const clear = createEventListener(
  document.getElementById("myButton"),
  "mousemove",
  e => console.log("x:", e.pageX, "y:", e.pageY),
  { passive: true }
);

// to clear all of the event listeners
clear();

// target element and event name can be reactive signals
const [ref, setRef] = createSignal<HTMLElement>();
const [name, setName] = createSignal("mousemove");
createEventListener(ref, name, e => {}, { passive: true });
```

#### Custom events

```ts
// you can provide your own event map type as well:
// fill both type generics for the best type support
createEventListener<{ myCustomEvent: MyEvent; other: Event }, "myCustomEvent">(
  window,
  "myCustomEvent",
  () => console.log("yup!")
);
// just don't use interfaces as EventMaps! (write them using `type` keyword)
```

#### Listening to multiple events

Now _(`@1.4.3`)_ you can listen to multiple events using a single `createEventListener` primitive.

```ts
createEventListener(el, ["mousemove", "mouseenter", "mouseleave"], e => {});
```

### Directive Usage

props passed to the directive are also reactive, so you can change handlers on the fly.

```tsx
import { eventListener } from "@solid-primitives/event-listener";
// avoids tree-shaking the directive:
eventListener;

<button use:eventListener={["click", () => console.log("Click")]}>Click!</button>;
```

## `createEventSignal`

Like [`createEventListener`](#createEventListener), but events are handled with the returned signal, instead of with a callback.

### How to use it

```ts
import { createEventSignal } from "@solid-primitives/event-listener";

// all arguments can be reactive signals
const [lastEvent, clear] = createEventSignal(el, "mousemove", { passive: true });

createEffect(() => {
  console.log(lastEvent()?.x, lastEvent()?.y);
});

// to clear all the event listeners
clear();
```

## `createEventListenerMap`

A helpful primitive that listens to a map of events. Handle them by individual callbacks.

### How to use it

```ts
import { createEventListenerMap } from "@solid-primitives/event-listener";

const clear = createEventListenerMap(element, {
  mousemove: mouseHandler,
  mouseenter: e => {},
  touchend: touchHandler
});

// to clear all the event listeners
clear();

// both target can be reactive:
const [target, setTarget] = createSignal(document.getElementById("abc"));
createEventListenerMap(
  target,
  {
    mousemove: e => {},
    touchstart: e => {}
  },
  { passive: true }
);

// createEventListenerMap can be used to listen to custom events
// fill both type generics for the best type support
createEventListenerMap<
  {
    myEvent: MyEvent;
    custom: Event;
    other: Event;
  },
  "myEvent" | "custom"
>(target, {
  myEvent: e => {},
  custom: e => {}
});
```

### Directive usage

```tsx
import { eventListenerMap } from "@solid-primitives/event-listener";
// prevent tree-shaking:
eventListenerMap;

<div
  use:eventListenerMap={{
    mousemove: e => {},
    click: clickHandler,
    touchstart: () => {},
    myCustomEvent: e => {}
  }}
></div>;
```

## `createEventStore`

Similar to [`createEventListenerMap`](#createEventListenerMap), but provides a reactive store with the latest captured events.

### How to use it

```ts
const [lastEvents, clear] = createEventStore(el, "mousemove", "touchend", "click");

createEffect(() => {
  console.log(lastEvents?.mousemove.x);
});

// to clear all the event listeners
clear()

// both target and options args can be reactive:
const [target, setTarget] = createSignal(document.getElementById("abc"));
const [lastEvents] = createEventStore(target, "mousemove", "touchmove");

// createEventStore can be used to listen to custom events
// fill both type generics for the best type support
const [lastEvents] = createEventStore<
  {
    myEvent: MyEvent;
    custom: Event;
    unused: Event;
  },
  "myEvent" | "custom"
>(target, "myEvent", "custom");

// DON'T DO THIS:
const [{ mousemove }] = createEventStore(target, "mousemove", ...);
// the store cannot be destructured
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
Primitive rewritten to provide better types and more solidlike (reactive) usage. Added a lot more primitives.

1.3.8

Published recent major updates to latest tag.

1.4.1

Updated to Solid 1.3

1.4.2

Minor improvements.

1.4.3

Allow listening to multiple event types with a single `createEventListener` | `createEventSignal`. Removed option to pass a reactive signal as options.

</details>
