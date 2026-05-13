<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=focus" alt="Solid Primitives Focus">
</p>

# @solid-primitives/focus

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/focus?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/focus)
[![version](https://img.shields.io/npm/v/@solid-primitives/focus?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/focus)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for autofocusing HTML elements and trapping focus within a container.

The native `autofocus` attribute only works on page load, which makes it incompatible with SolidJS. These primitives run on render, allowing autofocus on initial render as well as dynamically added components.

- [`autofocus`](#autofocus) - Ref callback factory to autofocus an element on render.
- [`createAutofocus`](#createautofocus) - Reactive primitive to autofocus an element on render.
- [`createFocusTrap`](#createfocustrap) - Traps focus inside a given DOM element.

## Installation

```bash
npm install @solid-primitives/focus
# or
yarn add @solid-primitives/focus
# or
pnpm add @solid-primitives/focus
```

## `autofocus`

### How to use it

`autofocus` is a ref callback factory. It uses the native `autofocus` attribute to determine whether to focus the element.

```tsx
import { autofocus } from "@solid-primitives/focus";

<button ref={autofocus()} autofocus>
  Autofocused
</button>;
```

To conditionally enable autofocus, control the `autofocus` attribute directly — the `autofocus()` ref only focuses when the attribute is present, so removing it is sufficient to opt out:

```tsx
// Conditionally autofocus by toggling the attribute
<button ref={autofocus()} autofocus={shouldFocus()}>
  Maybe Autofocused
</button>;
```

> **Note:** The `enabled` parameter was removed because it was redundant — the same effect is achieved by omitting the `autofocus` attribute. Previously, Solid directives always received an accessor argument whether you used it or not, which gave the impression an explicit toggle was necessary.

## `createAutofocus`

`createAutofocus` reactively autofocuses an element passed in as a signal.

```tsx
import { createAutofocus } from "@solid-primitives/focus";

// Using ref
let ref!: HTMLButtonElement;
createAutofocus(() => ref);

<button ref={ref}>Autofocused</button>;

// Using ref signal
const [ref, setRef] = createSignal<HTMLButtonElement>();
createAutofocus(ref);

<button ref={setRef}>Autofocused</button>;
```

## `createFocusTrap`

`createFocusTrap` traps keyboard focus inside a given DOM element, cycling through focusable children on Tab / Shift+Tab. It uses a `MutationObserver` to stay up to date with DOM changes and restores focus to the previously focused element when deactivated.

> Ported from [solid-focus-trap](https://github.com/corvudev/corvu/tree/main/packages/solid-focus-trap) by [Jasmin Noetzli (GiyoMoon)](https://github.com/GiyoMoon), adapted for Solid.js 2.0.

### How to use it

```tsx
import { createFocusTrap } from "@solid-primitives/focus";

const DialogContent: Component<{ open: boolean }> = props => {
  const [contentRef, setContentRef] = createSignal<HTMLElement | null>(null);

  createFocusTrap({
    element: contentRef,
    enabled: () => props.open,
  });

  return (
    <Show when={props.open}>
      <div ref={setContentRef}>
        <button>Close</button>
        <input />
      </div>
    </Show>
  );
};
```

### Props

| Prop                 | Type                              | Default                          | Description                                                                       |
| -------------------- | --------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `element`            | `MaybeAccessor<HTMLElement\|null>` | —                               | Element to trap focus within.                                                     |
| `enabled`            | `MaybeAccessor<boolean>`          | `true`                           | Whether the trap is active.                                                       |
| `observeChanges`     | `MaybeAccessor<boolean>`          | `true`                           | Watch for DOM mutations inside the container and refresh focusable elements.      |
| `initialFocusElement`| `MaybeAccessor<HTMLElement\|null>` | First focusable element          | Element to focus when the trap activates.                                         |
| `restoreFocus`       | `MaybeAccessor<boolean>`          | `true`                           | Restore focus to the previously focused element when the trap deactivates.        |
| `finalFocusElement`  | `MaybeAccessor<HTMLElement\|null>` | Previously focused element       | Element to focus when the trap deactivates.                                       |
| `onInitialFocus`     | `(event: Event) => void`          | —                                | Callback when focus moves into the trap. Call `event.preventDefault()` to cancel.|
| `onFinalFocus`       | `(event: Event) => void`          | —                                | Callback when focus restores. Call `event.preventDefault()` to cancel.            |

### Custom initial focus

```tsx
const [contentRef, setContentRef] = createSignal<HTMLElement | null>(null);
const [inputRef, setInputRef] = createSignal<HTMLElement | null>(null);

createFocusTrap({
  element: contentRef,
  enabled: () => props.open,
  initialFocusElement: inputRef,
});

return (
  <Show when={props.open}>
    <div ref={setContentRef}>
      <button>Close</button>
      <input ref={setInputRef} />
    </div>
  </Show>
);
```

### Preventing focus moves

```tsx
createFocusTrap({
  element: contentRef,
  onInitialFocus: event => {
    event.preventDefault(); // focus won't move on activation
  },
  onFinalFocus: event => {
    event.preventDefault(); // focus won't restore on deactivation
  },
});
```

## Demo

You may see the working example here: https://primitives.solidjs.community/playground/focus/

Source code: https://github.com/solidjs-community/solid-primitives/blob/main/packages/focus/dev/index.tsx

## Credits

`createFocusTrap` is ported from [solid-focus-trap](https://github.com/corvudev/corvu/tree/main/packages/solid-focus-trap), part of the [corvu](https://corvu.dev) UI toolkit by [Jasmin Noetzli (GiyoMoon)](https://github.com/GiyoMoon). Licensed under the MIT License.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
