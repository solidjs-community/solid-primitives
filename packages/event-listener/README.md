---
Name: event-listener
Stage: 3
Package: "@solid-primitives/event-listener"
Primitives: createEventListener
Category: Browser APIs
---

# @solid-primitives/event-listener

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/event-listener?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/event-listener)
[![size](https://img.shields.io/npm/v/@solid-primitives/event-listener?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/event-listener)

A helpful event listener primitive that binds window and any element supplied.

`createEventListener` - Very basic and straightforward primitive that handles multiple elements according to a single event binding.

## Installation

```bash
npm install @solid-primitives/event-listener
# or
yarn add @solid-primitives/event-listener
```

## How to use it

`createEventListener` can be used to listen to DOM or Custom Events on window, document, list of HTML elements or any EventTarget. The target prop can be reactive.

```ts
import { createEventListener } from "@solid-primitives/event-listener";

const [stop, start] = createEventListener(
  document.getElementById("mybutton"),
  "mousemove",
  e => console.log("x:", e.pageX, "y:", e.pageY),
  { passive: true }
);

// if you use signal as a target, then the event listener
// will be removed for previous and added to the new element
const [ref, setRef] = createSignal<HTMLElement>();
createEventListener(ref, "click", e => {});

// you can provide your own event map type as well:
createEventListener<{ myCustomEvent: Event }>(window, "myCustomEvent", () => console.log("yup!"));
// just don't use interfaces as EventMaps!
```

or as a directive

```ts
<button use:createEventListener={["click", () => console.log("Click")]}>Click!</button>
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

1.3.0

Primitive rewritten to provide better types and more reliable usage. **(breaking changes to type generics and returned functions)**

</details>
