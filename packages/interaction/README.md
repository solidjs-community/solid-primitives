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
  let ref: HTMLDivElement | undefined;
  const [open, setOpen] = createSignal(false);

  createInteractOutside(
    { onInteractOutside: () => setOpen(false) },
    () => ref,
  );

  return (
    <Show when={open()}>
      <div ref={ref} class="popover">
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

## `ariaHideOutside`

```ts
function ariaHideOutside(targets: Element[], root?: HTMLElement): () => void
```

Imperatively hides all elements in the DOM outside the given `targets` from screen readers by setting `aria-hidden="true"`. Returns a cleanup function that reverts all changes.

A `MutationObserver` watches for new elements added to `root` after the call and hides them automatically. Multiple concurrent calls are handled with a ref-count stack — stacked calls each track their own set of hidden nodes and the cleanup is fully independent.

```ts
import { ariaHideOutside } from "@solid-primitives/interaction";

const restore = ariaHideOutside([dialogEl]);
// ... when done:
restore();
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `targets` | `Element[]` | Elements that should remain visible (not aria-hidden). |
| `root` | `HTMLElement` | Root to search from. Defaults to `document.body`. |

---

## `createHideOutside`

```ts
function createHideOutside(props: CreateHideOutsideProps): void
```

Reactive wrapper around `ariaHideOutside`. Re-runs automatically whenever any accessor in `props` changes, and cleans up the previous call before re-running.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `targets` | `MaybeAccessor<Element[]>` | Elements that should remain visible. Reactive. |
| `root` | `MaybeAccessor<HTMLElement \| undefined>` | Root to hide within. Defaults to `document.body`. |
| `isDisabled` | `MaybeAccessor<boolean \| undefined>` | Disables hiding when `true`. Reactive. |

### Usage

```tsx
import { createSignal, Show } from "solid-js";
import { createHideOutside } from "@solid-primitives/interaction";

function Dialog() {
  let ref: HTMLDivElement | undefined;
  const [open, setOpen] = createSignal(false);

  createHideOutside({
    targets: () => (ref ? [ref] : []),
    isDisabled: () => !open(),
  });

  return (
    <Show when={open()}>
      <div ref={ref} role="dialog">
        Dialog content — everything else is aria-hidden
      </div>
    </Show>
  );
}
```

---

## Demo

TODO

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Credits

Based on primitives from [Kobalte](https://kobalte.dev), adapted for Solid 2.0 and the Solid Primitives ecosystem:

- [`createInteractOutside`](https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-interact-outside/create-interact-outside.ts) — Kobalte, MIT, Copyright (c) 2022 Kobalte contributors
- [`ariaHideOutside`](https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-hide-outside/create-hide-outside.ts) — Kobalte, MIT, Copyright (c) 2022 Kobalte contributors

Kobalte's implementations draw from:

- [Radix UI Primitives](https://github.com/radix-ui/primitives) — MIT, Copyright (c) 2022 WorkOS
- [Zag by Chakra UI](https://github.com/chakra-ui/zag) — MIT, Copyright (c) 2021 Chakra UI
- [React Spectrum (`ariaHideOutside`)](https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/overlays/src/ariaHideOutside.ts) — Apache 2.0, Copyright (c) 2020 Adobe
