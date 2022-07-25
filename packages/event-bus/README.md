<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Event%20Bus" alt="Solid Primitives Event Bus">
</p>

# @solid-primitives/event-bus

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/event-bus?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/event-bus)
[![size](https://img.shields.io/npm/v/@solid-primitives/event-bus?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/event-bus)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A collection of SolidJS primitives providing various features of a pubsub/event-emitter/event-bus:

- [`createSimpleEmitter`](#createSimpleEmitter) - Very minimal interface for emiting and receiving events. Good for parent-child component communication.
- [`createEmitter`](#createEmitter) - Provides all the base functions of an event-emitter, plus additional functions for managing listeners, it's behavior could be customized with an config object. Good for advanced usage.
- [`createEventBus`](#createEventBus) - Extends [`createEmitter`](#createEmitter). Additionally it provides a signal accessor function with last event's value.
- [`createEventStack`](#createEventStack) - Extends [`createEmitter`](#createEmitter). Provides the emitted events in a list/history form, with tools to manage it.
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

Check out [shared types](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-bus/src/types.ts).

```ts
function createSimpleEmitter<A0 = void, A1 = void, A2 = void>(): [
  listen: GenericListen<[A0, A1, A2]>,
  emit: GenericEmit<[A0, A1, A2]>,
  clear: VoidFunction
];
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

See [the tests](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-bus/test/emitter.test.ts) for better usage reference.

### Types

Check out [shared types](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-bus/src/types.ts).

```ts
function createEmitter<A0 = void, A1 = void, A2 = void>(
  config: EmitterConfig<A0, A1, A2> = {}
): Emitter<A0, A1, A2>;

type Emitter<A0 = void, A1 = void, A2 = void> = {
  listen: GenericListenProtect<[A0, A1, A2]>;
  emit: GenericEmit<[A0, A1, A2]>;
  remove: Remove<A0, A1, A2>;
  clear: VoidFunction;
  has: (listener: GenericListener<[A0, A1, A2]>) => boolean;
};

type EmitterConfig<A0 = void, A1 = void, A2 = void> = {
  emitGuard?: EmitGuard<A0, A1, A2>;
  removeGuard?: RemoveGuard<GenericListener<[A0, A1, A2]>>;
  beforeEmit?: GenericListener<[A0, A1, A2]>;
};
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

See [the tests](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-bus/test/eventBus.test.ts) for better usage reference.

### Types

Check out [shared types](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-bus/src/types.ts).

```ts
// Initial value was NOT provided
function createEventBus<Event>(
  config?: EmitterConfig<Event, Event | undefined>
): EventBus<Event, Event | undefined>;
// Initial value was provided
function createEventBus<Event>(
  config: EmitterConfig<Event, Event> & {
    value: Event;
  }
): EventBus<Event, Event>;

type EventBusListener<Event, V = Event | undefined> = GenericListener<[Event, V]>;
type EventBusListen<Event, V = Event | undefined> = ListenProtect<Event, V>;

type EventBusRemove<Event, V = Event | undefined> = (
  listener: EventBusListener<Event, V>
) => boolean;

type EventBus<Event, V = Event | undefined> = {
  remove: EventBusRemove<Event, V>;
  listen: EventBusListen<Event, V>;
  emit: GenericEmit<[Event]>;
  clear: VoidFunction;
  has: (listener: EventBusListener<Event, V>) => boolean;
  value: Accessor<V>;
};
```

## `createEventStack`

Extends [`createEmitter`](#createEmitter). Provides the emitted events in a list/history form, with tools to manage it.

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

Check out [shared types](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-bus/src/types.ts).

```ts
// Overload 0: "toValue" was not passed
function createEventStack<E extends object>(config?: Config<E, E>): EventStack<E, E>;
// Overload 1: "toValue" was set
function createEventStack<E, V extends object>(
  config: Config<E, V> & {
    toValue: (event: E, stack: V[]) => V;
  }
): EventStack<E, V>;

type EventStackListener<V> = (event: V, stack: V[], removeFromStack: Fn) => void;

type EventStack<E, V = E> = Modify<
  Emitter<V, V[], Fn>,
  {
    value: Accessor<V[]>;
    stack: Accessor<V[]>;
    setStack: Setter<V[]>;
    removeFromStack: (value: V) => boolean;
    emit: GenericEmit<[E]>;
  }
>;
type Config<E, V> = {
  length?: number;
  emitGuard?: EmitterConfig<E>["emitGuard"];
  removeGuard?: EmitterConfig<V, V[], Fn>["removeGuard"];
  beforeEmit?: EmitterConfig<V, V[], Fn>["beforeEmit"];
};
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

Check out [shared types](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-bus/src/types.ts) and [createEventHub source](https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-bus/src/eventHub.ts).

```ts
function createEventHub<ChannelMap extends Record<string, EventHubChannel>>(
  defineChannels: ((bus: typeof createEventBus) => ChannelMap) | ChannelMap
): EventHub<ChannelMap>;
/**
 * Required interface of a Emitter/EventBus, to be able to be used as a channel in the EventHub
 */
interface EventHubChannel {
  remove: (fn: (...payload: any[]) => void) => boolean;
  listen: (listener: (...payload: any[]) => void, protect?: boolean) => VoidFunction;
  emit: (...payload: any[]) => void;
  clear: VoidFunction;
  value: Accessor<any>;
}
type EventHub<ChannelMap extends Record<string, EventHubChannel>> = ChannelMap & {
  on: EventHubOn<ChannelMap>;
  off: EventHubOff<ChannelMap>;
  emit: EventHubEmit<ChannelMap>;
  clear: (event: keyof ChannelMap) => void;
  clearAll: VoidFunction;
  listen: (listener: EventHubListener<ChannelMap>, protect?: boolean) => VoidFunction;
  remove: (listener: EventHubListener<ChannelMap>) => void;
  clearGlobal: VoidFunction;
  store: ValueMap<ChannelMap>;
};
```

## EventBus Utils

### `toPromise`

Turns a stream-like listen function, into a promise resolving when the first event is captured.

```ts
import { toPromise } from "@solid-primitives/event-bus";

const emitter = createEmitter<string>();
const event = await toPromise(emitter.listen);

// can be used together with raceTimeout from @solid-primitives/utils
import { raceTimeout } from "@solid-primitives/utils";
try {
  const event = await raceTimeout(toPromise(emitter.listen), 2000, true, "event was too slow");
  // if event is quicker:
  event; // => string
} catch (err) {
  // if timeouts:
  console.log(err); // => "event was too slow"
}
```

### `once`

Listen to any EventBus/Emitter, but the listener will automatically unsubscribe on the first captured event. So the callback will run only **once**.

```ts
import { once } from "@solid-primitives/event-bus";

const { listen, emit } = createEmitter<string>();
const unsub = once(listen, event => console.log(event));

emit("foo"); // will log "foo" and unsub

emit("bar"); // won't log
```

### `toEffect`

Wraps `emit` calls inside a `createEffect`. It causes that listeners execute having an reactive owner available. It allows for usage of effects, memos and other primitives inside listeners, without having to create a synthetic root.

```ts
import { toEffect } from "@solid-primitives/event-bus";

const { listen, emit } = createEmitter();
const emitInEffect = toEffect(emit);

// owner is needed for creating computations like createEffect
listen(() => console.log(getOwner()));

// ...sometime later (after root initiation):
emit(); // listener will log `null`
emitInEffect(); // listener will log an owner object
```

## Demo

https://codesandbox.io/s/solid-primitives-event-bus-6fp4h?file=/index.tsx

## Changelog

See [CHANGELOG.md](.\CHANGELOG.md)

