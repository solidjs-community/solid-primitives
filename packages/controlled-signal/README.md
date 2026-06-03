# @solid-primitives/controlled-signal

[![size](https://img.shields.io/badge/size-395_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/controlled-signal)
[![version](https://img.shields.io/npm/v/@solid-primitives/controlled-signal?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/controlled-signal)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive signals that support both **controlled** (externally managed) and **uncontrolled** (internally managed) state — a pattern commonly used in headless UI components such as dialogs, dropdowns, and toggles.

## Installation

```bash
npm install @solid-primitives/controlled-signal
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

| Prop           | Type                       | Description                                      |
| -------------- | -------------------------- | ------------------------------------------------ |
| `value`        | `Accessor<T \| undefined>` | Controlled value. When defined, enables controlled mode. |
| `defaultValue` | `Accessor<T \| undefined>` | Initial value for uncontrolled mode.             |
| `onChange`     | `(value: T) => void`       | Called whenever the value would change.          |

**Returns:** `[value: Accessor<T | undefined>, setValue: (next) => void]`

#### Uncontrolled usage

```ts
const [open, setOpen] = createControllableSignal({ defaultValue: () => false });

setOpen(true);         // updates internal state and calls onChange if provided
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

## Building a headless component

```tsx
import { createControllableBooleanSignal } from "@solid-primitives/controlled-signal";

function createToggle(props: {
  pressed?: Accessor<boolean | undefined>;
  defaultPressed?: Accessor<boolean | undefined>;
  onChange?: (pressed: boolean) => void;
}) {
  const [pressed, setPressed] = createControllableBooleanSignal({
    value: props.pressed,
    defaultValue: props.defaultPressed,
    onChange: props.onChange,
  });

  return { pressed, toggle: () => setPressed(p => !p) };
}
```

## Credits

This primitive is adapted from the [`create-controllable-signal`](https://github.com/kobaltedev/kobalte/tree/main/packages/core/src/primitives/create-controllable-signal) implementation in [Kobalte](https://github.com/kobaltedev/kobalte) by the Kobalte Contributors, used under the [MIT License](https://github.com/kobaltedev/kobalte/blob/main/LICENSE).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
