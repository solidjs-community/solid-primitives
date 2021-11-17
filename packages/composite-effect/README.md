---
Name: composite-effect
Package: "@solid-primitives/composite-effect"
Primitives: createCompositeEffect, createEffectModifier
---

# @solid-primitives/composite-effect

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/composite-effect)](https://bundlephobia.com/package/@solid-primitives/composite-effect)
[![size](https://img.shields.io/npm/v/@solid-primitives/composite-effect)](https://www.npmjs.com/package/@solid-primitives/composite-effect)

A reactive primitive, that helps extend the `createEffect` behavior using composable and reusable modifiers.

`createCompositeEffect` - When used alone, it works as `createEffect(on())`. But it can be combined with a set of Modifiers extending it's functionality.

`createEffectModifier` - A utility for creating your own custom modifiers. Each available modifier has been made using this.

[**List of officially available modifiers**](#available-modifiers)

## How to use it

### createCompositeEffect

```ts
const [counter, setCounter] = createSignal(0);

// alone:
createCompositeEffect(counter, n => console.log(n));

// accepts "defer" option, same as on()
createCompositeEffect(counter, n => console.log(n), { defer: true });

// with filter:
createCompositeEffect(debounced(counter, n => console.log(n), { wait: 300 }));

// with nested filters:
const { stop, pause } = createCompositeEffect(stoppable(pausable(counter, n => console.log(n))));
```

### createEffectModifier

createEffectModifier accepts two arguments:

1. A callback modifier — function that is executed when your modifier gets attached to the `createCompositeEffect`. Here you get to modify the effect callback by attatching your logic to it.

2. A `boolean`, that if `true` requires the usage of inner `createRoot` to provide a `stop()` function for disposing of the effect permanently.

```ts
// types:
function createEffectModifier<Config, Returns, RequireStop>(
  cb_modifier: (
    source: Fn<any> | Fn<any>[], // like source of "on"
    callback: EffectCallback, // like callback of "on"
    config: Config, // config for your modifier
    stop: StopEffect | undefined // a StopEffect if RequireStop
  ) => [CustomCallback, Returns], // return your modified callback and custom return values
  requireStop?: RequireStop // true if you want to use StopEffect
): Filter {}

// modifier that doesn't use "stop()"
const yourModifier = createEffectModifier<{ myOption: boolean }, { value: string }>(
  (source, callback, config) => {
    const modifiedCallback = (...a) => {
      // is's important to run the previous callback here (modified callback of previous modifier)
      callback(...a);
    };
    return [modifiedCallback, { value: "this will get returned" }];
  }
);

// modifier that does require "stop()"
// notice the double "true" to use stop()
const yourModifier = createEffectModifier<void, { value: string }, true>(
  (source, callback, config, stop) => {
    const modifiedCallback = (...a) => {
      /* here you can use stop() */
      callback(...a);
    };

    return [modifiedCallback, { value: "this will get returned" }];
  },
  true
);
```

See the [implementations of official modifiers](https://github.com/davedbase/solid-primitives/blob/main/packages/composite-effect/src/modifiers.ts) for better reference.

### Available Modifiers

```ts
import {
  stoppable,
  once,
  atMost,
  debounce,
  throttle,
  whenever,
  pausable,
  ignorable
} from "@solid-primitives/composite-effect";
```

### stoppable

returns `{ stop: StopEffect }`, that can be used to manually dispose of the effects.

```ts
const { stop } = createCompositeEffect(stoppable(counter, n => console.log(n)));
```

### once

disposes itself on the first captured change. **Set the defer option to true**, otherwise the callback will run and dispose itself on the initial setup.

```ts
createCompositeEffect(
  once(counter, n => console.log(n)),
  { defer: true }
);
```

### atMost

you specify the number of times it can triggered, until disposes itself.

```ts
const { count } = createCompositeEffect(atMost(counter, n => console.log(n), { limit: 8 }));
```

### debounce

debounces callback

```ts
const position = createScrollObserver();

createCompositeEffect(debounce(position, x => console.log(x), { wait: 300 }));
```

### throttle

The callback is throttled

```ts
const position = createScrollObserver();

createCompositeEffect(throttle(position, x => console.log(x), { wait: 300 }));
```

### whenever

Runs callback each time the source is truthy.

```ts
setInterval(() => setCount(p => p + 1), 1000);

createCompositeEffect(
  whenever(
    () => count() > 5,
    () => console.log(count())
  )
);
// will fire on each count change, if count is gt 5
// => 6, 7, 8, 9, 10, ...

createCompositeEffect(
  whenever(
    createMemo(() => count() > 5),
    () => console.log(count())
  )
);
// will fire only when the memo changes
// => 6
```

### pausable

Manually controll if the callback gets to be executed

```ts
const { pause, resume, toggle } = createCompositeEffect(
  pausable(counter, x => console.log(x), { active: false })
);
```

### ignorable

Somewhat similar to `pausable`, but ignore changes that would cause the next effect to run.

Because Solid batches together changes made in effects, the usage inside and outside effects will differ.

```ts
const { ignoreNext, ignoring } = createCompositeEffect(ignorable(
   counter,
   x => {
      // next effect will be ignored:
      ignoreNext()
      setCounter(p => p + 1)

      // this change happens in the same effect, so it will also be ignored
      setCounter(5)
   }
));


const ignoreMe = () => {
   ignoring(() => {
      // both changes will be ignored:
      setCounter(420)
      setCounter(69)
   })
   // but not this one:
   setCounter(p => p + 2)
}

// this watcher will work normally,
// ignoring only affects the ignorableWatch above
createCompositeEffect(counter, () => {...})
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial realease

</details>

## Acknowledgement

- [VueUse](https://vueuse.org)
