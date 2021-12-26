# @solid-primitives/event-bus

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/event-bus?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/event-bus)
[![size](https://img.shields.io/npm/v/@solid-primitives/event-bus?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/event-bus)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/davedbase/solid-primitives#contribution-process)

A collection of primitives providing different functionalities of pubsub/event-emitter/event-bus:

- [`createSimpleEmitter`](#createSimpleEmitter) - Very minimal interface for emiting and receiving events. Good for parent-child component communication.
- [`createEmitter`](#createEmitter) - Provides all the base functions of an event-emitter, plus additional functions for managing listeners, it's behavior could be customized with an config object. Good for advanced usage.
- [`createEventBus`](#createEventBus) - Extends [`createEmitter`](#createEmitter). Additionally it provides a signal accessor function with last event's value.
- [`createEventStack`](#createEventStack) - Extends [`createEmitter`](#createEmitter). Provides the emitted events in a list form, with tools to manage it.
- [`createEventHub`](#createEventHub) - Provides functions for using a group of emitters.

## Installation

```bash
npm install @solid-primitives/event-bus
# or
yarn add @solid-primitives/event-bus
```

## `createSimpleEmitter`

Very minimal interface for emiting and receiving events. Good for parent-child component communication.

### How to use it

```ts
import { createSimpleEmitter } from "@solid-primitives/event-bus";

// accepts up-to-3 genetic payload types
const [listen, emit, clear] = createSimpleEmitter<string, number, boolean>();

// can be used without payload type, if you don't want to send any
createSimpleEmitter();

listen((a, b, c) => console.log(a, b, c));

emit("foo", 123, true);

// clear all listeners
clear();
// listeners will also be cleared onCleanup automatically
```

### Types

```ts

```

## `createEmitter`

Provides all the base functions of an event-emitter, plus additional functions for managing listeners, it's behavior could be customized with an config object. Good for advanced usage.

### How to use it

```ts
import { createEmitter } from "@solid-primitives/event-bus";

// accepts up-to-3 genetic payload types
const emitter = createEmitter<string, number, boolean>();

// can be used without payload type, if you don't want to send any
createEmitter();

// emitter can be destructured:
const { listen, emit, has, clear } = emitter;

const listener = (a, b, c) => console.log(a, b, c);
emitter.listen(listener);

emitter.emit("foo", 123, true);

emitter.remove(listener);
emitter.has(listener); // false

// pass true as a second argument to protect the listener
emitter.listen(listener, true);
emitter.remove(listener);
emitter.has(listener); // true

// clear all listeners
emitter.clear();
// listeners will also be cleared onCleanup automatically
```

See [the tests](https://github.com/davedbase/solid-primitives/blob/main/packages/event-bus/test/emitter.test.ts) for better usage reference.

### Types

```ts

```

## `createEventBus`

Extends [`createEmitter`](#createEmitter). Additionally it provides a signal accessor function with last event's value.

### How to use it

```ts
import { createEventBus } from "@solid-primitives/event-bus";

// accepts up-to-3 genetic payload types
const bus = createEventBus<string>();

// can be destructured:
const { listen, emit, has, clear, value } = bus;

const listener = (event, previous) => console.log(event, previous);
bus.listen(listener);

bus.emit("foo");

bus.remove(listener);
bus.has(listener); // false

// pass true as a second argument to protect the listener
bus.listen(listener, true);
bus.remove(listener);
bus.has(listener); // true

// last event is be available as a signal
bus.value();

// clear all listeners
bus.clear();
// listeners will also be cleared onCleanup automatically
```

See [the tests](https://github.com/davedbase/solid-primitives/blob/main/packages/event-bus/test/eventBus.test.ts) for better usage reference.

### Types

```ts

```

## `createEventStack`

Extends [`createEmitter`](#createEmitter). Provides the emitted events in a list form, with tools to manage it.

### How to use it

```ts
import { createEventStack } from "@solid-primitives/event-bus";
```

### Types

```ts

```

## `createEventHub`

Provides functions for using a group of emitters.

### How to use it

```ts
import { createEventHub } from "@solid-primitives/event-bus";
```

### Types

```ts

```

## Demo

You may view a working example here: [ link to Stackblize or CodeSandBox ]

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

</details>
