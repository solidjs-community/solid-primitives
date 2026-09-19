<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=keyboard" alt="Solid Primitives keyboard">
</p>

# @solid-primitives/keyboard

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/badge/size-1.74_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/keyboard)
[![version](https://img.shields.io/npm/v/@solid-primitives/keyboard?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/keyboard)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

A library of reactive primitives for handling user keyboard input.

- [`useKeyDownEvent`](#usekeydownevent) — Provides a signal with the last keydown event.
- [`useKeyDownList`](#usekeydownlist) — Provides a signal with the list of currently held keys.
- [`useCurrentlyHeldKey`](#usecurrentlyheldkey) — Provides a signal with the currently held single key.
- [`useKeyDownSequence`](#usekeydownsequence) — Provides a signal with a sequence of currently held keys, as they were pressed down and up.
- [`createKeyHold`](#createkeyhold) — Provides a signal indicating if provided key is currently being held down.
- [`createShortcut`](#createshortcut) — Creates a keyboard shortcut observer.
- [`createKeyDown`](#createkeydown) — Listens for a keydown event for a specific key on a document.

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

`useKeyDownList` takes no arguments and returns a signal with the list of currently held keys.

```tsx
import { useKeyDownList } from "@solid-primitives/keyboard";

const keys = useKeyDownList();

createEffect(() => {
  console.log(keys()); // => string[] — list of currently held keys
});

<For each={keys()}>{key => <kbd>{key}</kbd>}</For>;
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

Creates a keyboard shortcut observer. The provided callback will be called when the specified keys are pressed.

### How to use it

`createShortcut` takes three arguments:

- `keys` — list of keys to listen for
- `callback` — callback to call when the specified keys are pressed
- `options` — additional configuration:
  - `preventDefault` — call `e.preventDefault()` on the keyboard event, when the specified key is pressed. _(Defaults to `true`)_
  - `requireReset` — If `true`, the shortcut will only be triggered once until all of the keys stop being pressed. Disabled by default.
  - `ignoreWithinInputs` — If `true`, the shortcut is ignored while focus is on an `input`, `textarea`, `select`, or `contenteditable` element, so it doesn't interrupt typing. Disabled by default.
  - `anyOrder` — If `true`, the keys can be pressed in any order (e.g. `Shift + Control` as well as `Control + Shift`), as long as they all end up held down together. Disabled by default, requiring `keys` to be pressed in order.

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

When `preventDefault` is `true`, `e.preventDefault()` will be called not only on the keydown event that has triggered the callback, but it will **optimistically** also prevent the default behavior of every previous keydown that will have the possibility to lead to the shortcut being pressed.

E.g. when listening for `Control + Shift + A`, all three keydown events will be prevented.

### Ignoring shortcuts while typing

Single, unmodified-key shortcuts (e.g. `["S"]`) conflict with typing — pressing "s" in a text field would both type the character and trigger the shortcut. Set `ignoreWithinInputs: true` to skip the shortcut entirely while focus is on a form control or `contenteditable` element:

```tsx
// won't fire while the user is typing in a text field
createShortcut(["S"], () => console.log("S was pressed"), { ignoreWithinInputs: true });
```

Combos that include a modifier (e.g. `Control + S`) don't have this problem, since the modifier itself prevents a character from being typed — `ignoreWithinInputs` is usually unnecessary for those.

### Matching keys in any order

By default, `keys` must be pressed in the order given — `["Control", "Shift", "M"]` only matches Control, then Shift, then M. Set `anyOrder: true` to match the combo regardless of press order, similar to how most editors handle shortcuts:

```tsx
// triggers for both Control+Shift+M and Shift+Control+M
createShortcut(["Control", "Shift", "M"], () => console.log("M was pressed"), { anyOrder: true });
```

## `createKeyDown`

Listens for a `keydown` event for a specific key on a document. Useful for global keyboard handlers that need to respond to a single key without setting up a full shortcut.

### How to use it

`createKeyDown` takes three arguments:

- `key` — the key to listen for (matched against `event.key`)
- `callback` — handler called when the key is pressed, receives the `KeyboardEvent`
- `options` — additional configuration:
  - `disabled` — a `boolean` or accessor; when `true` the listener is inactive. Reactive — the listener is added/removed as the value changes.
  - `ownerDocument` — accessor returning the `Document` to attach the listener to. Defaults to `window.document`. Useful for iframes and portals.

```tsx
import { createKeyDown } from "@solid-primitives/keyboard";

createKeyDown("Escape", e => close());

// with options
createKeyDown("Escape", e => close(), {
  disabled: () => !isOpen(),
  ownerDocument: () => iframeEl.contentDocument ?? document,
});
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
