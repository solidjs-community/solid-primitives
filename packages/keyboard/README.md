<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=keyboard" alt="Solid Primitives keyboard">
</p>

# @solid-primitives/keyboard

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/keyboard?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/keyboard)
[![version](https://img.shields.io/npm/v/@solid-primitives/keyboard?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/keyboard)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A library of reactive promitives helping handling user's keyboard input.

- [`useKeyDownEvent`](#useKeyDownEvent) — Provides a signal with the last keydown event.
- [`useKeyDownList`](#useKeyDownList) — Provides a signal with the list of currently held keys
- [`useCurrentlyHeldKey`](#useCurrentlyHeldKey) — Provides a signal with the currently held single key.
- [`useKeyDownSequence`](#useKeyDownSequence) — Provides a signal with a sequence of currently held keys, as they were pressed down and up.
- [`createKeyHold`](#createKeyHold) — Provides a signal indicating if provided key is currently being held down.
- [`createShortcut`](#createShortcut) — Creates a keyboard shotcut observer.

## Installation

```bash
npm install @solid-primitives/keyboard
# or
pnpm add @solid-primitives/keyboard
# or
yarn add @solid-primitives/keyboard
```

## `useKeyDownEvent`

Provides a signal with the last keydown event.

This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive that will reuse event listeners and signals across dependents.

### How to use it

`useKeyDownEvent` takes no arguments, and returns a signal with the last keydown event.

```tsx
import { useKeyDownEvent } from "@solid-primitives/keyboard";

const event = useKeyDownEvent();

createEffect(() => {
  const e = event();
  console.log(e); // => KeyboardEvent | null

  if (e) {
    console.log(e.key); // => "Q" | "ALT" | ... or null
    e.preventDefault(); // prevent default behavior or last keydown event
  }
});
```

## `useKeyDownList`

Provides a signal with the list of currently held keys, ordered from least recent to most recent.

This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive that will reuse event listeners and signals across dependents.

### How to use it

`useKeyDownList` takes no arguments, and returns a signal with the list of currently held keys

```tsx
import { useKeyDownList } from "@solid-primitives/keyboard";

const keys = useKeyDownList();

createEffect(() => {
  console.log(keys()); // => string[] — list of currently held keys
});

<For each={keys()}>
  {key => <kbd>{key}</kdb>}
</For>
```

## `useCurrentlyHeldKey`

Provides a signal with the currently held single key. Pressing any other key at the same time will reset the signal to `null`.

This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive that will reuse event listeners and signals across dependents.

### How to use it

`useCurrentlyHeldKey` takes no arguments, and returns a signal with the currently held single key.

```tsx
import { useCurrentlyHeldKey } from "@solid-primitives/keyboard";

const key = useCurrentlyHeldKey();

createEffect(() => {
  console.log(key()); // => string | null — currently held key
});
```

## `useKeyDownSequence`

Provides a signal with a sequence of currently held keys, as they were pressed down and up.

This is a [singleton root](https://github.com/solidjs-community/solid-primitives/tree/main/packages/rootless#createSingletonRoot) primitive that will reuse event listeners and signals across dependents.

### How to use it

`useKeyDownSequence` takes no arguments, and returns a single signal.

```tsx
import { useKeyDownSequence } from "@solid-primitives/keyboard";

const sequence = useKeyDownSequence();

createEffect(() => {
  console.log(sequence()); // => string[][] — sequence of currently held keys
});

// example sequence of pressing Ctrl + Shift + A
// [["Control"], ["Control", "Shift"], ["Control", "Shift", "A"]]
```

## `createKeyHold`

Provides a `boolean` signal indicating if provided key is currently being held down.

Holding multiple keys at the same time will return `false` — holding only the specified one will return `true`.

### How to use it

`createKeyHold` takes two arguments:

- `key` keyboard key to listen for
- `options` additional configuration:
  - `preventDefault` — call `e.preventDefault()` on the keyboard event, when the specified key is pressed. _(Defaults to `true`)_

```tsx
import { createKeyHold } from "@solid-primitives/keyboard";

const pressing = createKeyHold("Alt", { preventDefault: false });

<p>Is pressing Alt? {pressing() ? "YES" : "NO"}</p>;
```

## `createShortcut`

Creates a keyboard shotcut observer. The provided callback will be called when the specified keys are pressed.

### How to use it

`createShortcut` takes three arguments:

- `keys` — list of keys to listen for
- `callback` — callback to call when the specified keys are pressed
- `options` — additional configuration:
  - `preventDefault` — call `e.preventDefault()` on the keyboard event, when the specified key is pressed. _(Defaults to `true`)_
  - `requireReset` — If `true`, the shortcut will only be triggered once until all of the keys stop being pressed. Disabled by default.

```tsx
import { createShortcut } from "@solid-primitives/keyboard";

createShortcut(
  ["Control", "Shift", "A"],
  () => {
    console.log("Shortcut triggered");
  },
  { preventDefault: false, requireReset: true },
);
```

### Preventing default

When `preventDefault` is `true`, `e.preventDefault()` will be called not only on the keydown event that have triggered the callback, but it will **optimistically** also prevend the default behavior of every previous keydown that will have the possibility to lead to the shotcut being pressed.

E.g. when listening for `Control + Shift + A`, all three keydown events will be prevented.

## DEMO

Working demo of some of the primitives in keyboard package:

https://codesandbox.io/s/solid-primitives-keyboard-demo-s2l84k?file=/index.tsx

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
