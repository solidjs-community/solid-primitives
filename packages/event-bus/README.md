# @solid-primitives/event-bus

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/event-bus?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/event-bus)
[![size](https://img.shields.io/npm/v/@solid-primitives/event-bus?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/event-bus)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/davedbase/solid-primitives#contribution-process)

A collection of SolidJS primitives providing various features of a pubsub/event-emitter/event-bus:

- [`createSimpleEmitter`](#createSimpleEmitter) - Very minimal interface for emiting and receiving events. Good for parent-child component communication.
- [`createEmitter`](#createEmitter) - Provides all the base functions of an event-emitter, plus additional functions for managing listeners, it's behavior could be customized with an config object. Good for advanced usage.
- [`createEventBus`](#createEventBus) - Extends [`createEmitter`](#createEmitter). Additionally it provides a signal accessor function with last event's value.
- [`createEventStack`](#createEventStack) - Extends [`createEmitter`](#createEmitter). Provides the emitted events in a list form, with tools to manage it.
- [`createEventHub`](#createEventHub) - Provides helpers for using a group of emitters.

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

#### Creating Emitter

```ts
import { createEmitter } from "@solid-primitives/event-bus";

// accepts up-to-3 genetic payload types
const emitter = createEmitter<string, number, boolean>();

// can be used without payload type, if you don't want to send any
createEmitter();

// emitter can be destructured:
const { listen, emit, has, clear } = emitter;
```

#### Emiting & Listening to events

```ts
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

#### Emitter Config

```ts
const { listen, has, remove, emit } = createEmitter<string>({
  beforeEmit: event => {...},
  emitGuard: (emit, payload) => allowedEmit && emit(), // emit('foo') to emit different value
  removeGuard: (remove, listener) => allowedRemove && remove()
});
```

See [the tests](https://github.com/davedbase/solid-primitives/blob/main/packages/event-bus/test/emitter.test.ts) for better usage reference.

### Types

```ts

```

## `createEventBus`

Extends [`createEmitter`](#createEmitter). Additionally it provides a signal accessor function with last event's value.

### How to use it

#### Creating EventBus

```ts
import { createEventBus } from "@solid-primitives/event-bus";

const bus = createEventBus<string>();

// can be destructured:
const { listen, emit, has, clear, value } = bus;
```

#### Emitting & listening to events

```ts
const listener = (event, previous) => console.log(event, previous);
bus.listen(listener);

bus.emit("foo");

bus.remove(listener);
bus.has(listener); // false

// pass true as a second argument to protect the listener
bus.listen(listener, true);
bus.remove(listener);
bus.has(listener); // true

// clear all listeners
bus.clear();
// listeners will also be cleared onCleanup automatically
```

#### Last Value signal

```ts
// last event is be available as a signal
bus.value(); // => string | undefined

// pass initial value to config to remove "undefined" from the type
createEventBus({
  value: "initial"
});

bus.value(); // => string
```

#### EventBus Config

```ts
createEventBus<string>({
  beforeEmit: event => console.log(event),
  emitGuard: (emit, event, prev) => allowedEmit && emit(), // emit('foo') to emit different value,
  removeGuard: (remove, listener) => allowedRemove && remove(),
  value: "Initial Value"
});
```

See [the tests](https://github.com/davedbase/solid-primitives/blob/main/packages/event-bus/test/eventBus.test.ts) for better usage reference.

### Types

```ts

```

## `createEventStack`

Extends [`createEmitter`](#createEmitter). Provides the emitted events in a list form, with tools to manage it.

### How to use it

#### Creating the event bus

```ts
import { createEventStack } from "@solid-primitives/event-bus";

// 1. event type has to be an object
// be what you emit will be added to the value stack
const bus = createEventStack<{ message: string }>();

// 2. provide event type, value type, and toValue parsing function
// value type has to be an object
const bus = createEventStack<string, { text: string }>({
  toValue: e => ({ text: e })
});

// can be destructured:
const { listen, emit, has, clear, value } = bus;
```

#### Listening & Emitting

```ts
const listener: EventStackListener<{ text: string }> = (event, stack, removeValue) => {
  console.log(event, stack);
  // you can remove the value from stack
  removeValue();
};
bus.listen(listener);

bus.emit("foo");

bus.remove(listener);
bus.has(listener); // false

// pass true as a second argument to protect the listener
bus.listen(listener, true);
bus.remove(listener);
bus.has(listener); // true
```

#### Event Stack

```ts
// a signal accessor:
bus.stack() // => { text: string }[]

bus.removeFromStack(value) // pass a reference to the value

bus.setStack(stack => stack.filter(item => {...}))
```

#### createEventStack Config

```ts
createEventStack<string, { text: string }>({
  beforeEmit: (value, stack, remove) => console.log(value, stack),
  emitGuard: (emit, text) => allowEmit && emit(), // emit('foo') to emit different value
  removeGuard: (remove, listener) => allowRemove && remove(),
  toValue: e => ({ text: e })
});
```

### Types

```ts

```

## `createEventHub`

Provides helpers for using a group of emitters.

Can be used with [`createEmitter`](#createEmitter), [`createEventBus`](#createEventBus), [`createEventStack`](#createEventStack).

### How to use it

#### Creating EventHub

```ts
import { createEventHub } from "@solid-primitives/event-bus";

// by passing an record of Channels
const hub = createEventHub({
  busA: createEmitter<void>(),
  busB: createEventBus<string>(),
  busC: createEventStack<{ text: string }>()
});

// by passing a function
const hub = createEventHub(bus => ({
  busA: bus<number>(),
  busB: bus<string>(),
  busC: createEventStack<{ text: string }>()
}));

// hub can be destructured
const { busA, busB, on, off, listen, emit, clear } = hub;
```

#### Listening & Emitting

```ts
// using hub methods:
hub.on("busA", e => {});
hub.on("busB", e => {});

hub.emit("busA", 0);
hub.emit("busB", "foo");

// using emitters
hub.busA.listen(e => {});
hub.busA.emit(1);

hub.busB.listen(e => {});
hub.busB.emit("bar");

// global listener - listens to all channels
hub.listen((name, e) => {});
```

#### Accessing values

If a emitter returns an accessor value, it will be available in a `.store` store.

```ts
hub.store.myBus;
// same as
hub.myBus.value();
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
