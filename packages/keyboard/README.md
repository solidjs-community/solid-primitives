<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=keyboard" alt="Solid Primitives keyboard">
</p>

# @solid-primitives/keyboard

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/keyboard?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/keyboard)
[![version](https://img.shields.io/npm/v/@solid-primitives/keyboard?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/keyboard)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A library of reactive promitives helping handling user's keyboard input.

- [`makeKeyHoldListener`](#makeKeyHoldListener) - Attaches keyboard event-listeners, and triggers callback whenever user holds or stops holding specified key.

## Installation

```bash
npm install @solid-primitives/keyboard
# or
yarn add @solid-primitives/keyboard
```

## `makeKeyHoldListener`

Attaches keyboard event-listeners to `window`, and calls provided callback whenever user holds or stops holding specified key.

Event listeners are automatically cleaned on root dispose.

### How to use it

`makeKeyHoldListener` takes three arguments:

- `key` keyboard key or modifier to listen for
- `onHoldChange` callback fired when the hold state changes
- `options` additional configuration:
  - `preventDefault` — call `e.preventDefault()` on the keyboard event, when the specified key is pressed. _(Defaults to `false`)_
  - `allowOtherKeys` — Should the user be allowed to press other keys while holding the specified one _(Defaults to `false`)_

```tsx
import { makeKeyHoldListener } from "@solid-primitives/keyboard";

const [pressing, setPressing] = createSignal(false);

makeKeyHoldListener("altKey", setPressing, {
  preventDefault: true
});

<p>Is pressing Alt? {pressing() ? "YES" : "NO"}</p>;
```

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
