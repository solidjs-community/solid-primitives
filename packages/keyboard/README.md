<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=keyboard&version=2.0" alt="Solid Primitives keyboard">
</p>

# @solid-primitives/keyboard

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/badge/size-1.77_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/keyboard)
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
- [`createShortcuts`](#createshortcuts) / [`makeShortcutRegistry`](#makeshortcutregistry) — Register many shortcuts through a single listener pair, with dynamic add/remove and a deterministic conflict policy.

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

```tsx repl
import { render } from "@solidjs/web";
import { createEffect, createSignal } from "solid-js";
import { useKeyDownEvent } from "@solid-primitives/keyboard";

function Demo() {
  const event = useKeyDownEvent();
  const [last, setLast] = createSignal("none");
  createEffect(
    () => event(),
    e => {
      if (e) setLast(`${e.key} (code: ${e.code})`);
    },
  );
  return <p>Click here, then press a key. Last keydown: {last()}</p>;
}

render(() => <Demo />, document.getElementById("app")!);
```

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

```tsx repl
import { render } from "@solidjs/web";
import { For } from "solid-js";
import { useKeyDownList } from "@solid-primitives/keyboard";

function Demo() {
  const keys = useKeyDownList();
  return (
    <>
      <p>Click here, then hold some keys:</p>
      <p>
        <For each={keys()} fallback="(none)">
          {key => <kbd>{key} </kbd>}
        </For>
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

```tsx repl
import { render } from "@solidjs/web";
import { useCurrentlyHeldKey } from "@solid-primitives/keyboard";

function Demo() {
  const key = useCurrentlyHeldKey();
  return <p>Click here, then hold a single key. Held: {key() ?? "(none)"}</p>;
}

render(() => <Demo />, document.getElementById("app")!);
```

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

```tsx repl
import { render } from "@solidjs/web";
import { For } from "solid-js";
import { useKeyDownSequence } from "@solid-primitives/keyboard";

function Demo() {
  const sequence = useKeyDownSequence();
  return (
    <>
      <p>Click here, then hold Shift, add Alt, then Q:</p>
      <ol>
        <For each={sequence()} fallback={<li>(none)</li>}>
          {step => <li>{step.join(" + ")}</li>}
        </For>
      </ol>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

```tsx repl
import { render } from "@solidjs/web";
import { createKeyHold } from "@solid-primitives/keyboard";

function Demo() {
  const holding = createKeyHold("Shift", { preventDefault: false });
  return (
    <p style={{ background: holding() ? "gold" : "transparent" }}>
      Click here, then hold Shift (alone): {holding() ? "YES" : "NO"}
    </p>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createShortcut } from "@solid-primitives/keyboard";

function Demo() {
  const [count, setCount] = createSignal(0);
  createShortcut(["Control", "K"], () => setCount(n => n + 1), { requireReset: true });
  return <p>Click here, then press Ctrl+K. Triggered {count()} times.</p>;
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

`createShortcut` takes three arguments:

- `keys` — list of keys to listen for
- `callback` — callback to call when the specified keys are pressed
- `options` — additional configuration:
  - `preventDefault` — call `e.preventDefault()` on the keyboard event, when the specified key is pressed. _(Defaults to `true`)_
  - `requireReset` — If `true`, the shortcut will only be triggered once until all of the keys stop being pressed. Disabled by default. A modifier with two physical keys (for example both Control keys) counts as held until the last one is released.
  - `ignoreWithinInputs` — If `true`, the shortcut is ignored while focus is on an `input`, `textarea`, `select`, or `contenteditable` element, so it doesn't interrupt typing. Inputs that never accept typed characters (`type` of `checkbox`, `button`, `submit`, `reset` or `image`) are not treated as editable, so the shortcut still fires there. Disabled by default.
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

Inputs whose `type` never accepts typed characters (`checkbox`, `button`, `submit`, `reset`, `image`; case-insensitive) are **not** treated as editable, so a plain-key shortcut still fires while one of them has focus. All other inputs stay ignored: text-like types (`text`, `search`, `email`, `url`, `tel`, `password`, `number`, the date and time types, and an input with a missing or unknown `type`) as well as `radio`, `range`, `file` and `color`, which consume arrow and other keys. `textarea`, `select` and `contenteditable` are always ignored. The same rules apply to the registry's `ignoreInputs`.

The check also works for inputs inside iframes and **open** shadow roots (the real target is taken from `event.composedPath()`). **Closed** shadow roots hide their contents from the page, so inputs inside them cannot be detected.

### Ignored keys and platform quirks

- **Lock keys are ignored.** `CapsLock`, `NumLock` and `ScrollLock` are skipped by `useKeyDownList`, `createShortcut` and the shortcut registry (keydown and keyup). On macOS CapsLock sends only a keydown when switched on and only a keyup when switched off, so tracking it would leave it "held" and stop every exact-match shortcut from firing. They cannot be part of a shortcut.
- **Option/Alt on macOS.** Matching uses `event.key`, and with Option held macOS reports the composed character (`Option+E` gives `Dead`, `Option+S` gives `ß`) instead of the letter. A shortcut written as `["Alt", "S"]` therefore does not match on macOS. If you need such a shortcut, match the composed character, or use `createKeyDown`/your own listener and compare `event.code` (`"KeyS"`).
- **Meta keyup.** macOS never sends keyup for keys pressed while Meta (Cmd) is held, only Meta's own. Releasing Meta therefore clears every tracked key.
- **Keyup is always observed on `window` in the capture phase**, so an app handler calling `stopPropagation()` on keyup cannot leave a key stuck.

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

## `createShortcuts`

Registers many shortcuts at once through a single `keydown`/`keyup` listener pair. Accepts a list, a map of key combination to handler, or an accessor of either; when the accessor changes, the shortcuts are re-registered. `createShortcut` is unchanged.

```ts
// Type
function createShortcuts(
  shortcuts: MaybeAccessor<
    ShortcutDefinition[] | Record<string, Handler | (Options & { handler: Handler })>
  >,
  options?: { scope?: MaybeAccessor<EventTarget | undefined> },
): void;

// Example
createShortcuts({
  "Control+K": () => openPalette(),
  Escape: { handler: () => close(), enabled: isOpen, preventDefault: false },
});

createShortcuts(
  () => [{ keys: ["Control", "S"], handler: save, ignoreInputs: false }],
  { scope: () => panelEl }, // only while focus is inside the element
);
```

Each definition is `{ keys, handler, preventDefault?, requireReset?, ignoreInputs?, enabled? }`:

- `keys` — an array (`["Control", "K"]`) or a `+`-joined string (`"Ctrl+Shift+K"`, `"Control++"` for the plus key). Case-insensitive; `Ctrl`, `Cmd`/`Command`, `Option` and `Space` are aliases. Matching is **exact and order-independent**: `Control+K` does not fire for `Control+Shift+K`.
- `handler(event)` — called with the `KeyboardEvent`.
- `preventDefault` — defaults to `true`.
- `requireReset` — fire once until all keys are released. Defaults to `false`.
- `ignoreInputs` — skip while focus is in an `input`, `textarea`, `select` or `contenteditable`. Like `ignoreWithinInputs`, it does not apply to `checkbox`, `button`, `submit`, `reset` and `image` inputs. Defaults to `false` (same as `createShortcut`'s `ignoreWithinInputs`).
- `enabled` — boolean or accessor, read at key time. A disabled shortcut never matches.

Key repeat is ignored. Modifier state is taken from the event's `ctrlKey`/`shiftKey`/`altKey`/`metaKey` flags, and releasing `Meta` clears all held keys (macOS sends no keyup for keys held with Meta).

### Conflict policy

At most **one** shortcut fires per keydown. Because matching is on the exact key set, all candidates are equally specific, so the **most recently registered eligible shortcut wins** (for lists and maps: the last matching entry). "Eligible" means enabled, not suppressed by `ignoreInputs` and not blocked by `requireReset`, so a disabled or input-ignoring newer shortcut never shadows an older one. Only the winner's `preventDefault` applies.

## `makeShortcutRegistry`

The non-reactive base of `createShortcuts`. Listeners are attached when the first shortcut is registered and removed when the last is unregistered or on `clear()`. When `scope` is set, key releases are also observed on `window` (so a release after focus leaves the scope is seen) and on the scope itself, also in the capture phase (so a scope whose events never reach `window`, such as an iframe, still sees them even when an app handler stops keyup propagation). A `scope` may also be an iframe's `contentDocument` or `contentWindow`. It also clears itself when its owner is disposed. On the server it returns an inert registry.

```ts
// Type
function makeShortcutRegistry(options?: { scope?: EventTarget }): {
  register(definition: ShortcutDefinition): VoidFunction; // returns unregister
  clear(): void;
};

// Example
const registry = makeShortcutRegistry({ scope: dialogEl });
const unregister = registry.register({ keys: "Escape", handler: close });
unregister(); // remove one
registry.clear(); // remove all and detach listeners
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
