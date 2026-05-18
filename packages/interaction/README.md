# @solid-primitives/interaction

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/interaction?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/interaction)
[![version](https://img.shields.io/npm/v/@solid-primitives/interaction?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/interaction)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for detecting and hiding interactions that originate **outside** a given element. Useful for building accessible dismissible UI components such as dropdowns, popovers, dialogs, and tooltips.

## Installation

```bash
npm install @solid-primitives/interaction
# or
pnpm add @solid-primitives/interaction
# or
yarn add @solid-primitives/interaction
```

## `createInteractOutside`

```ts
function createInteractOutside<T extends Element>(
  props: CreateInteractOutsideProps,
  ref: Accessor<T | undefined>,
): void
```

Sets up document-level event listeners that fire whenever the user interacts with any part of the page outside the element returned by `ref`. The listeners are registered lazily (via a deferred effect) and automatically removed on cleanup.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `isDisabled` | `MaybeAccessor<boolean \| undefined>` | Disables all listeners when `true`. Reactive — can be an accessor. |
| `shouldExcludeElement` | `(element: Element) => boolean` | Return `true` to suppress handlers for interactions with a specific element. |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | Fired when a `pointerdown` event occurs outside `ref`. Call `event.preventDefault()` to stop `onInteractOutside` from firing. |
| `onFocusOutside` | `(event: FocusOutsideEvent) => void` | Fired when focus moves outside `ref`. Call `event.preventDefault()` to stop `onInteractOutside` from firing. |
| `onInteractOutside` | `(event: InteractOutsideEvent) => void` | Fired for any outside interaction — both pointer and focus. Always fires after the specific handler unless that handler called `preventDefault`. |

### Event types

All handlers receive a `CustomEvent` that wraps the original DOM event.

```ts
type EventDetails<T> = {
  originalEvent: T;    // the original PointerEvent or FocusEvent
  isContextMenu: boolean; // true for right-click / Ctrl+click on Mac
};

type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>;
type FocusOutsideEvent       = CustomEvent<EventDetails<FocusEvent>>;
type InteractOutsideEvent    = PointerDownOutsideEvent | FocusOutsideEvent;
```

## Usage

### Dismiss a popover on outside interaction

```tsx
import { createSignal, Show } from "solid-js";
import { createInteractOutside } from "@solid-primitives/interaction";

function Popover() {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const [open, setOpen] = createSignal(false);

  createInteractOutside(
    { onInteractOutside: () => setOpen(false) },
    ref,
  );

  return (
    <Show when={open()}>
      <div ref={setRef} class="popover">
        Popover content
      </div>
    </Show>
  );
}
```

### Using individual focus and pointer handlers

```tsx
import { createInteractOutside } from "@solid-primitives/interaction";

function Tooltip() {
  let ref: HTMLElement | undefined;

  createInteractOutside(
    {
      onPointerDownOutside(e) {
        console.log("Clicked outside", e.detail.originalEvent);
      },
      onFocusOutside(e) {
        // Prevent onInteractOutside from also firing
        e.preventDefault();
        console.log("Focus moved outside");
      },
      onInteractOutside() {
        console.log("Any outside interaction");
      },
    },
    () => ref,
  );

  return <div ref={ref}>...</div>;
}
```

### Conditionally disabling

```tsx
function Dialog(props: { open: boolean }) {
  let ref: HTMLDivElement | undefined;

  createInteractOutside(
    {
      isDisabled: () => !props.open,
      onInteractOutside: () => { /* close */ },
    },
    () => ref,
  );

  return <div ref={ref}>Dialog</div>;
}
```

### Excluding specific elements

```tsx
function Dropdown() {
  let ref: HTMLElement | undefined;
  let triggerRef: HTMLButtonElement | undefined;

  createInteractOutside(
    {
      // Prevent the trigger button from closing the dropdown when clicked
      shouldExcludeElement: el => el === triggerRef || !!triggerRef?.contains(el),
      onInteractOutside: () => { /* close */ },
    },
    () => ref,
  );

  return (
    <>
      <button ref={triggerRef}>Open</button>
      <div ref={ref}>Dropdown content</div>
    </>
  );
}
```

> **Tip:** To hide content outside a dialog from screen readers, you don't need a library.
> Set `ariaModal="true"` on your dialog or popover element and assistive technologies will
> automatically scope navigation to it. See [`Element.ariaModal`](https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaModal) on MDN.

## Demo

TODO

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Credits

Based on primitives from [Kobalte](https://kobalte.dev), adapted for Solid 2.0 and the Solid Primitives ecosystem:

- [`createInteractOutside`](https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-interact-outside/create-interact-outside.ts) — Kobalte, MIT, Copyright (c) 2022 Kobalte contributors

Kobalte's implementation draws from:

- [Radix UI Primitives](https://github.com/radix-ui/primitives) — MIT, Copyright (c) 2022 WorkOS
- [Zag by Chakra UI](https://github.com/chakra-ui/zag) — MIT, Copyright (c) 2021 Chakra UI
