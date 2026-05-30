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
```

## `makeInteractOutside`

```ts
function makeInteractOutside<T extends Element>(
  el: T,
  options: MakeInteractOutsideOptions,
): () => void
```

A non-reactive, pure-ref primitive. Attaches outside-interaction listeners to `el` immediately and returns a cleanup function. Use this when you already have a stable element reference and don't need reactive re-attachment.

```ts
import { makeInteractOutside } from "@solid-primitives/interaction";

const cleanup = makeInteractOutside(el, {
  onInteractOutside: () => close(),
});

// later, to remove listeners:
cleanup();
```

## `interactOutside`

```ts
function interactOutside(options: MakeInteractOutsideOptions): (el: Element) => void
```

A ref factory for `makeInteractOutside`. The most concise way to build dismissable UI — pass the result directly to a JSX `ref` prop and the element will close itself when the user interacts outside it. Cleanup is registered via `onCleanup` in the component's reactive scope, so listeners are removed automatically when the component disposes — no signal ref needed.

```tsx
import { createSignal, Show } from "solid-js";
import { interactOutside } from "@solid-primitives/interaction";

function Popover() {
  const [open, setOpen] = createSignal(false);

  return (
    <Show when={open()}>
      <div ref={interactOutside({ onInteractOutside: () => setOpen(false) })}>
        Popover content
      </div>
    </Show>
  );
}
```

## `createInteractOutside`

```ts
function createInteractOutside<T extends Element>(
  options: CreateInteractOutsideOptions,
  ref: Accessor<T | undefined>,
): void
```

Reactive wrapper around `makeInteractOutside`. Sets up document-level event listeners that fire whenever the user interacts outside the element returned by `ref`. Re-attaches automatically when `ref` or `options.disabled` changes. Cleans up with the reactive owner.

### Options

| Option | Type | Description |
|--------|------|-------------|
| `disabled` | `MaybeAccessor<boolean \| undefined>` | Disables all listeners when `true`. Reactive — can be an accessor. |
| `shouldExcludeElement` | `(element: Element) => boolean` | Return `true` to suppress handlers for a specific element. |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | Fired when a `pointerdown` event occurs outside `ref`. Call `event.preventDefault()` to stop `onInteractOutside` from firing. |
| `onFocusOutside` | `(event: FocusOutsideEvent) => void` | Fired when focus moves outside `ref`. Call `event.preventDefault()` to stop `onInteractOutside` from firing. |
| `onInteractOutside` | `(event: InteractOutsideEvent) => void` | Fired for any outside interaction — both pointer and focus. Always fires after the specific handler unless that handler called `preventDefault`. |

### Event types

All handlers receive a `CustomEvent` that wraps the original DOM event.

```ts
type EventDetails<T> = {
  originalEvent: T;        // the original PointerEvent or FocusEvent
  isContextMenu: boolean;  // true for right-click / Ctrl+click on Mac
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
import { createSignal } from "solid-js";
import { createInteractOutside } from "@solid-primitives/interaction";

function Tooltip() {
  const [ref, setRef] = createSignal<HTMLElement>();

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
    ref,
  );

  return <div ref={setRef}>...</div>;
}
```

### Conditionally disabling

```tsx
import { createSignal } from "solid-js";
import { createInteractOutside } from "@solid-primitives/interaction";

function Dialog(props: { open: boolean }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  createInteractOutside(
    {
      disabled: () => !props.open,
      onInteractOutside: () => { /* close */ },
    },
    ref,
  );

  return <div ref={setRef}>Dialog</div>;
}
```

### Excluding specific elements

```tsx
import { createSignal } from "solid-js";
import { createInteractOutside } from "@solid-primitives/interaction";

function Dropdown() {
  const [ref, setRef] = createSignal<HTMLElement>();
  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement>();

  createInteractOutside(
    {
      // Prevent the trigger button from closing the dropdown when clicked
      shouldExcludeElement: el => el === triggerRef() || !!triggerRef()?.contains(el),
      onInteractOutside: () => { /* close */ },
    },
    ref,
  );

  return (
    <>
      <button ref={setTriggerRef}>Open</button>
      <div ref={setRef}>Dropdown content</div>
    </>
  );
}
```

### Using the ref factory

`interactOutside` is the most concise option when you don't need a signal ref:

```tsx
import { createSignal, Show } from "solid-js";
import { interactOutside } from "@solid-primitives/interaction";

function Menu() {
  const [open, setOpen] = createSignal(false);

  return (
    <Show when={open()}>
      <ul ref={interactOutside({ onInteractOutside: () => setOpen(false) })}>
        <li>Item 1</li>
      </ul>
    </Show>
  );
}
```

### Using the base primitive imperatively

`makeInteractOutside` is the right choice outside of JSX — custom directives, imperative setups, or tests:

```ts
import { makeInteractOutside } from "@solid-primitives/interaction";

const cleanup = makeInteractOutside(el, {
  onInteractOutside: () => close(),
});

// later:
cleanup();
```

> **Tip:** To hide content outside a dialog from screen readers, you don't need a library.
> Set `ariaModal="true"` on your dialog or popover element and assistive technologies will
> automatically scope navigation to it. See [`Element.ariaModal`](https://developer.mozilla.org/en-US/docs/Web/API/Element/ariaModal) on MDN.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Credits

Based on primitives from [Kobalte](https://kobalte.dev), adapted for Solid 2.0 and the Solid Primitives ecosystem:

- [`createInteractOutside`](https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-interact-outside/create-interact-outside.ts) — Kobalte, MIT, Copyright (c) 2022 Kobalte contributors

Kobalte's implementation draws from:

- [Radix UI Primitives](https://github.com/radix-ui/primitives) — MIT, Copyright (c) 2022 WorkOS
- [Zag by Chakra UI](https://github.com/chakra-ui/zag) — MIT, Copyright (c) 2021 Chakra UI
