# @solid-primitives/controlled-signal

[![size](https://img.shields.io/badge/size-478_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/controlled-signal)
[![version](https://img.shields.io/npm/v/@solid-primitives/controlled-signal?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/controlled-signal)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Reactive signals that support both **controlled** (externally managed) and **uncontrolled** (internally managed) state — a pattern commonly used in headless UI components such as dialogs, dropdowns, and toggles.

## Installation

```bash
npm install @solid-primitives/controlled-signal
# or
yarn add @solid-primitives/controlled-signal
# or
pnpm add @solid-primitives/controlled-signal
```

## How it works

A **controllable signal** has two modes:

- **Uncontrolled** — when no `value` prop is provided (or it is `undefined`). The signal manages its own internal state, initialized from `defaultValue`.
- **Controlled** — when a `value` prop is provided. The signal defers entirely to the external value; `setValue` calls `onChange` but does not update internal state.

This mirrors the [controlled/uncontrolled pattern](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components) from React, adapted for SolidJS reactivity.

## Primitives

### `createControllableSignal`

```ts
import { createControllableSignal } from "@solid-primitives/controlled-signal";

const [value, setValue] = createControllableSignal<T>(props);
```

**Props:**

| Prop           | Type                       | Description                                              |
| -------------- | -------------------------- | -------------------------------------------------------- |
| `value`        | `Accessor<T \| undefined>` | Controlled value. When defined, enables controlled mode. |
| `defaultValue` | `Accessor<T \| undefined>` | Initial value for uncontrolled mode.                     |
| `onChange`     | `(value: T) => void`       | Called whenever the value would change.                  |

**Returns:** `[value: Accessor<T | undefined>, setValue: (next) => void]`

#### Uncontrolled usage

```ts
const [open, setOpen] = createControllableSignal({ defaultValue: () => false });

setOpen(true); // updates internal state and calls onChange if provided
setOpen(prev => !prev); // functional form
```

#### Controlled usage

```ts
// The consumer drives the state; your component just calls onChange.
const [value, setValue] = createControllableSignal({
  value: () => props.open,
  onChange: props.onOpenChange,
});

// setValue does NOT update internal state in controlled mode.
// It calls onChange so the consumer can update their signal.
setValue(true);
```

---

### `createControllableBooleanSignal`

Variant of `createControllableSignal` for `boolean` values. Returns `false` instead of `undefined` when unset.

```ts
const [open, setOpen] = createControllableBooleanSignal({
  defaultValue: () => false,
});
```

---

### `createControllableArraySignal`

Variant for `Array<T>` values. Returns `[]` instead of `undefined` when unset.

```ts
const [items, setItems] = createControllableArraySignal<string>({
  defaultValue: () => ["a", "b"],
});

setItems(prev => [...prev, "c"]);
```

---

### `createControllableSetSignal`

Variant for `Set<T>` values. Returns `new Set()` instead of `undefined` when unset.

```ts
const [selected, setSelected] = createControllableSetSignal<number>({
  defaultValue: () => new Set([1, 2]),
});

setSelected(prev => new Set([...prev, 3]));
```

---

### `createToggleState`

Controllable state for toggle components — checkboxes, switches, toggle buttons — built on top of `createControllableBooleanSignal`. Adapted from [Kobalte's `createToggleState`](https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/primitives/create-toggle-state).

```ts
import { createToggleState } from "@solid-primitives/controlled-signal";

const { isSelected, setIsSelected, toggle } = createToggleState({
  defaultIsSelected: () => false,
});

toggle(); // isSelected() === true
```

**Props:**

| Prop                | Type                       | Description                                             |
| ------------------- | -------------------------- | --------------------------------------------------------- |
| `isSelected`        | `Accessor<boolean \| undefined>` | Controlled selected state. When defined, enables controlled mode. |
| `defaultIsSelected` | `Accessor<boolean \| undefined>` | Initial selected state for uncontrolled mode.        |
| `isDisabled`        | `Accessor<boolean \| undefined>` | While `true`, `toggle()` and `setIsSelected()` are no-ops. |
| `isReadOnly`        | `Accessor<boolean \| undefined>` | While `true`, `toggle()` and `setIsSelected()` are no-ops. |
| `onSelectedChange`  | `(isSelected: boolean) => void`  | Called whenever the selected state would change.     |

**Returns:** `{ isSelected: Accessor<boolean>, setIsSelected: (v: boolean) => void, toggle: () => void }`

Just like `createControllableSignal`, `isSelected` can be omitted for uncontrolled usage, or provided (alongside `onSelectedChange`) to let a parent component drive the state.

## Credits

This primitive is adapted from the [`create-controllable-signal`](https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/primitives/create-controllable-signal) and [`create-toggle-state`](https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/primitives/create-toggle-state) implementations in [Kobalte](https://github.com/kobaltedev/kobalte) by the Kobalte Contributors, used under the [MIT License](https://github.com/kobaltedev/kobalte/blob/main/LICENSE).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
