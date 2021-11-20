---
Name: date-difference
Package: "@solid-primitives/date-difference"
Primitives: createdate-differenceEffect, createdate-differenceComputed, createdate-differenceMemo, createdate-differenceRenderEffect, createModifier
---

# @solid-primitives/date-difference

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/date-difference)](https://bundlephobia.com/package/@solid-primitives/date-difference)
[![size](https://img.shields.io/npm/v/@solid-primitives/date-difference)](https://www.npmjs.com/package/@solid-primitives/date-difference)

A reactive primitives, extending the `createEffect`, `createComputed`, `createMemo` behaviors using composable and reusable **modifiers**.

- `createdate-differenceEffect` - When used alone, it works as `createEffect(on())`. But it can be combined with a set of Modifiers extending it's functionality.

- `createdate-differenceComputed` - Similar to `createdate-differenceEffect`, but it uses `createComputed` instead.

- `createdate-differenceMemo` - Apply the same modifiers to `createMemo`.

- `createdate-differenceRenderEffect` - A `createdate-differenceEffect` that runs during the render phase as DOM elements are created and updated but not necessarily connected.

- `createModifier` - A utility for creating your own custom modifiers. Each available modifier has been made using it.

[**List of officially available modifiers**](#available-modifiers)

## How to use it

### createdate-differenceEffect

```ts
const [counter, setCounter] = createSignal(0);

// alone:
createdate - differenceEffect(counter, n => console.log(n));

// accepts "defer" option, same as on()
createdate - differenceEffect(counter, n => console.log(n), { defer: true });

// with filter:
createdate - differenceEffect(debounced(counter, n => console.log(n), { wait: 300 }));

// with nested filters:
const { stop, pause } =
  createdate - differenceEffect(stoppable(pausable(counter, n => console.log(n))));
```

### createdate-differenceComputed

The usage is the same as [`createdate-differenceEffect`](#createdate-differenceeffect)

```ts
const { ignoring } =
  createdate -
  differenceComputed(
    ignorable(counter, n => console.log(n)),
    { defer: true }
  );
```

### createdate-differenceMemo

Works simmilary to the ones above, but there are some differences:

- The returned value will be: `Accessor` if you don't use modifiers, or `[Accessor, ModifierReturns]` if you do.
- Accepts additional `equals` in options - a custom comparison function

```ts
const double = createdate - differenceMemo(counter, n => n * 2, { value: 0 });

// if you don't set the "value" option, the memo might return undefined
const [double, { pause, resume }] =
  createdate -
  differenceMemo(
    pausable(counter, n => n * 2),
    { value: 0 }
  );
```

### createdate-differenceRenderEffect

```ts
const { ignore } = createdate - differenceRenderEffect(stoppable(ignorable(counter, n => n * 2)));
```

See the [implementations of official modifiers](https://github.com/davedbase/solid-primitives/blob/main/packages/date-difference/src/modifiers.ts) for better reference.

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
} from "@solid-primitives/date-difference";
```

### stoppable

returns `{ stop: StopEffect }`, that can be used to manually dispose of the effects.

```ts
const { stop } = createdate - differenceEffect(stoppable(counter, n => console.log(n)));
```

### once

disposes itself on the first captured change. **Set the defer option to true**, otherwise the callback will run and dispose itself on the initial setup.

```ts
createdate -
  differenceEffect(
    once(counter, n => console.log(n)),
    { defer: true }
  );
```

### atMost

you specify the number of times it can triggered, until disposes itself.

```ts
const { count } = createdate - differenceEffect(atMost(counter, n => console.log(n), { limit: 8 }));
```

### debounce

debounces callback

```ts
const position = createScrollObserver();

createdate - differenceEffect(debounce(position, x => console.log(x), 300));
```

### throttle

The callback is throttled

```ts
const position = createScrollObserver();

createdate - differenceEffect(throttle(position, x => console.log(x), 300));
```

### whenever

Runs callback each time the source is truthy.

```ts
setInterval(() => setCount(p => p + 1), 1000);

createdate -
  differenceEffect(
    whenever(
      () => count() > 5,
      () => console.log(count())
    )
  );
// will fire on each count change, if count is gt 5
// => 6, 7, 8, 9, 10, ...

createdate -
  differenceEffect(
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
const { pause, resume, toggle } =
  createdate - differenceEffect(pausable(counter, x => console.log(x), { active: false }));
```

### ignorable

Somewhat similar to `pausable`, but ignore changes that would cause the next effect to run.

Preferably use this with `createCompositComputed`. As for `createdate-differenceffect`: since Solid batches together changes made in effects, the usage inside and outside effects will differ.

```ts
const { ignoreNext, ignore } = createCompositComputed(ignorable(
   counter,
   x => {
      // next effect will be ignored:
      ignoreNext()
      setCounter(p => p + 1)

      // is using createdate-differenceffect, this also will be ignored
      // but in createCompositComputed it won't be
      setCounter(5)
   }
));


const ignoreMe = () => {
   ignore(() => {
      // both changes will be ignored:
      setCounter(420)
      setCounter(69)
   })
   // but not this one:
   setCounter(p => p + 2)
}

// this watcher will work normally,
// ignoring only affects the one above
createdate-differenceEffect(counter, () => {...})
```

### createModifier

A utility for creating your own modifiers, it accepts two arguments:

1. A callback modifier — function that is executed when your modifier gets attached to the `createdate-difference___`. Here you get to modify the effect callback by attatching your logic to it.

2. A `boolean`, that if `true` requires the usage of inner `createRoot` to provide a `stop()` function for disposing of the effect permanently.

```ts
// types:
function createModifier<Config, Returns, RequireStop>(
  cb_modifier: (
    source: Fn<any> | Fn<any>[], // like source of "on"
    callback: EffectCallback, // like callback of "on"
    config: Config, // config for your modifier
    stop: StopEffect | undefined // a StopEffect if RequireStop
  ) => [CustomCallback, Returns], // return your modified callback and custom return values
  requireStop?: RequireStop // true if you want to use StopEffect
): Modifier {}

// modifier that doesn't use "stop()"
const yourModifier = createModifier<{ myOption: boolean }, { value: string }>(
  (source, callback, config) => {
    const modifiedCallback = (...a) => {
      // is's important to run the previous callback here (modified callback of previous modifier)
      // also to be compatable with `createdate-differenceMemo` this should return a value
      return callback(...a);
    };
    return [modifiedCallback, { value: "this will get returned" }];
  }
);

// modifier that does require "stop()"
// notice the double "true" to use stop()
const yourModifier = createModifier<void, { value: string }, true>(
  (source, callback, config, stop) => {
    const modifiedCallback = (...a) => {
      /* here you can use stop() */
      return callback(...a);
    };

    return [modifiedCallback, { value: "this will get returned" }];
  },
  true
);
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Initial realease

</details>

## Acknowledgements

- [VueUse](https://vueuse.org)
- [solid-rx](https://www.npmjs.com/package/solid-rx)
