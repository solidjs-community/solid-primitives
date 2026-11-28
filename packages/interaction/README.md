# @solid-primitives/interaction

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/badge/size-3.8_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/interaction)
[![version](https://img.shields.io/npm/v/@solid-primitives/interaction?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/interaction)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Primitives for detecting and hiding interactions that originate **outside** a given element, and for hiding off-screen content from assistive technologies. Useful for building accessible dismissible UI components such as dropdowns, popovers, dialogs, and tooltips.

## Installation

```bash
npm install @solid-primitives/interaction
# or
yarn add @solid-primitives/interaction
# or
pnpm add @solid-primitives/interaction
```

## `makeInteractOutside`

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";
import { makeInteractOutside } from "@solid-primitives/interaction";

function Demo() {
  const [status, setStatus] = createSignal("Not listening");
  let box!: HTMLDivElement;
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  const attach = () => {
    cleanup?.(); // the returned function removes the listeners
    cleanup = makeInteractOutside(box, {
      onPointerDownOutside: () => setStatus("Pointer down outside"),
      onFocusOutside: () => setStatus("Focus moved outside"),
    });
    setStatus("Listening — click or tab outside the box");
  };

  return (
    <>
      <div ref={box} style={{ border: "1px solid", padding: "1rem" }}>
        <button onClick={attach}>Attach</button>
        <p>{status()}</p>
      </div>
      <input placeholder="Focus me (outside)" />
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
function makeInteractOutside<T extends Element>(
  el: T,
  options: MakeInteractOutsideOptions,
): () => void;
```

A non-reactive, pure-ref primitive. Attaches outside-interaction listeners to `el` immediately and returns a cleanup function. Use this when you already have a stable element reference and don't need reactive re-attachment.

Mouse and pen presses report on `pointerdown`. A touch press is reported on the following `click`, so that a scroll never counts as an outside interaction. The pending touch is dropped when the pointer is cancelled (`pointercancel` / `touchcancel`), moves more than 10px, a key is pressed before the click (a keyboard-generated click), or no matching click arrives within about 700ms of the release. The click must also land on the pressed target or within 10px of the press.

```ts
import { makeInteractOutside } from "@solid-primitives/interaction";

const cleanup = makeInteractOutside(el, {
  onInteractOutside: () => close(),
});

// later, to remove listeners:
cleanup();
```

## `interactOutside`

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { interactOutside } from "@solid-primitives/interaction";

function Demo() {
  const [open, setOpen] = createSignal(false);
  let trigger!: HTMLButtonElement;

  return (
    <>
      <button ref={trigger} onClick={() => setOpen(o => !o)}>
        {open() ? "Close" : "Open"} dropdown
      </button>
      <Show when={open()}>
        <div
          ref={interactOutside({
            onInteractOutside: () => setOpen(false),
            shouldExcludeElement: el => trigger.contains(el),
          })}
          style={{ border: "1px solid", padding: "1rem", width: "200px" }}
        >
          Click anywhere outside to dismiss.
        </div>
      </Show>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
function interactOutside(options: MakeInteractOutsideOptions): (el: Element) => void;
```

A ref factory for `makeInteractOutside`. The most concise way to build dismissable UI — pass the result directly to a JSX `ref` prop and the element will close itself when the user interacts outside it. Cleanup is registered via `onCleanup` in the component's reactive scope, so listeners are removed automatically when the component disposes — no signal ref needed.

```tsx
import { createSignal, Show } from "solid-js";
import { interactOutside } from "@solid-primitives/interaction";

function Popover() {
  const [open, setOpen] = createSignal(false);

  return (
    <Show when={open()}>
      <div ref={interactOutside({ onInteractOutside: () => setOpen(false) })}>Popover content</div>
    </Show>
  );
}
```

## `createInteractOutside`

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createInteractOutside } from "@solid-primitives/interaction";

function Demo() {
  const [open, setOpen] = createSignal(false);
  const [popover, setPopover] = createSignal<HTMLDivElement>();
  let trigger!: HTMLButtonElement;

  createInteractOutside(
    {
      disabled: () => !open(),
      onInteractOutside: () => setOpen(false),
      shouldExcludeElement: el => trigger.contains(el),
    },
    popover,
  );

  return (
    <>
      <button ref={trigger} onClick={() => setOpen(o => !o)}>
        {open() ? "Close" : "Open"} popover
      </button>
      <div
        ref={setPopover}
        style={{ display: open() ? "block" : "none", border: "1px solid", padding: "1rem" }}
      >
        Click or focus outside this box to close it.
      </div>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
function createInteractOutside<T extends Element>(
  options: CreateInteractOutsideOptions,
  ref: Accessor<T | undefined>,
): void;
```

Reactive wrapper around `makeInteractOutside`. Sets up document-level event listeners that fire whenever the user interacts outside the element returned by `ref`. Re-attaches automatically when `ref` or `options.disabled` changes. Cleans up with the reactive owner.

### Options

| Option                 | Type                                       | Description                                                                                                                                      |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `disabled`             | `MaybeAccessor<boolean \| undefined>`      | Disables all listeners when `true`. Reactive — can be an accessor.                                                                               |
| `shouldExcludeElement` | `(element: Element) => boolean`            | Return `true` to suppress handlers for a specific element.                                                                                       |
| `onPointerDownOutside` | `(event: PointerDownOutsideEvent) => void` | Fired when a `pointerdown` event occurs outside `ref`. Call `event.preventDefault()` to stop `onInteractOutside` from firing.                    |
| `onFocusOutside`       | `(event: FocusOutsideEvent) => void`       | Fired when focus moves outside `ref`. Call `event.preventDefault()` to stop `onInteractOutside` from firing.                                     |
| `onInteractOutside`    | `(event: InteractOutsideEvent) => void`    | Fired for any outside interaction — both pointer and focus. Always fires after the specific handler unless that handler called `preventDefault`. |

### Event types

All handlers receive a `CustomEvent` that wraps the original DOM event.

```ts
type EventDetails<T> = {
  originalEvent: T; // the original PointerEvent or FocusEvent
  isContextMenu: boolean; // true for right-click / Ctrl+click on Mac
};

type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>;
type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>;
type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent;
```

## Usage

### Dismiss a popover on outside interaction

```tsx
import { createSignal, Show } from "solid-js";
import { createInteractOutside } from "@solid-primitives/interaction";

function Popover() {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const [open, setOpen] = createSignal(false);

  createInteractOutside({ onInteractOutside: () => setOpen(false) }, ref);

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
      onInteractOutside: () => {
        /* close */
      },
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
      onInteractOutside: () => {
        /* close */
      },
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

---

## `ariaHideOutside`

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, onCleanup } from "solid-js";
import { ariaHideOutside } from "@solid-primitives/interaction";

function Demo() {
  const [hiding, setHiding] = createSignal(false);
  let root!: HTMLDivElement;
  let dialog!: HTMLDivElement;
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  const toggle = () => {
    cleanup = cleanup ? void cleanup() : ariaHideOutside([dialog], root);
    setHiding(!!cleanup);
  };

  return (
    <>
      <style>{"[aria-hidden='true'] { opacity: 0.3; }"}</style>
      <button onClick={toggle}>{hiding() ? "Restore" : "Hide outside dialog"}</button>
      <div ref={root}>
        <p>Background paragraph</p>
        <div ref={dialog} style={{ border: "1px solid", padding: "0.5rem" }}>
          Dialog (stays visible)
        </div>
        <p>Another background paragraph</p>
      </div>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
function ariaHideOutside(
  targets: Element[],
  root?: HTMLElement,
  alwaysVisibleSelector?: string,
): () => void;
```

A non-reactive, imperative primitive. Walks the DOM from `root` (defaults to `document.body`) and sets `aria-hidden="true"` on every element that is not an ancestor of, or contained within, one of `targets`. A `MutationObserver` watches for newly added nodes and hides them automatically. Returns a cleanup function that removes all `aria-hidden` attributes added by this call.

Ref-counted — nested calls cooperate correctly so that tearing down an inner layer does not accidentally reveal content that an outer layer is still hiding.

```ts
import { ariaHideOutside } from "@solid-primitives/interaction";

const cleanup = ariaHideOutside([dialogEl]);

// when the dialog closes:
cleanup();
```

Pass `alwaysVisibleSelector` to exempt elements matched by a CSS selector from being hidden regardless of their position in the tree (useful for live-region announcers or top-layer elements):

```ts
const cleanup = ariaHideOutside([dialogEl], document.body, "[aria-live]");
```

## `createHideOutside`

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createHideOutside } from "@solid-primitives/interaction";

function Demo() {
  const [open, setOpen] = createSignal(false);
  const [root, setRoot] = createSignal<HTMLDivElement>();
  const [dialog, setDialog] = createSignal<HTMLDivElement>();

  createHideOutside({
    targets: () => (dialog() ? [dialog()!] : []),
    root,
    disabled: () => !open(),
    inert: true,
  });

  return (
    <>
      <style>{"[aria-hidden='true'] { opacity: 0.3; }"}</style>
      <button onClick={() => setOpen(o => !o)}>{open() ? "Close" : "Open"} dialog</button>
      <div ref={setRoot}>
        <p>Background content (hidden + inert while open)</p>
        <input placeholder="Not focusable while open" />
        <div ref={setDialog} role="dialog" style={{ border: "1px solid", padding: "0.5rem" }}>
          Dialog content
        </div>
      </div>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
function createHideOutside(options: CreateHideOutsideOptions): void;
```

Reactive wrapper around `ariaHideOutside`. Re-runs whenever `targets`, `root`, or `disabled` changes and cleans up the previous hide pass automatically. Integrates with the reactive owner so everything is torn down when the component or scope disposes.

### Options

| Option                  | Type                                      | Description                                                                                                    |
| ----------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `targets`               | `MaybeAccessor<Element[]>`                | The elements that should remain visible (and their ancestors / descendants). Reactive — can be an accessor.    |
| `root`                  | `MaybeAccessor<HTMLElement \| undefined>` | Subtree to walk. Defaults to `document.body`. Reactive — can be an accessor.                                   |
| `disabled`              | `MaybeAccessor<boolean \| undefined>`     | Skips hiding entirely when `true`. Reactive — can be an accessor.                                              |
| `alwaysVisibleSelector` | `string`                                  | CSS selector for elements that must never be hidden (e.g. `"[aria-live]"` for live-region announcers). Static. |

```tsx
import { createSignal, Show } from "solid-js";
import { createHideOutside } from "@solid-primitives/interaction";

function Dialog(props: { open: boolean }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  createHideOutside({
    targets: () => (ref() ? [ref()!] : []),
    disabled: () => !props.open,
  });

  return (
    <Show when={props.open}>
      <div ref={setRef} role="dialog" aria-modal="true">
        Dialog content
      </div>
    </Show>
  );
}
```

### Combining with `createInteractOutside`

A fully accessible dismissible dialog uses both primitives together — `createHideOutside` removes the background from the accessibility tree while `createInteractOutside` closes the dialog on outside pointer or focus events:

```tsx
import { createSignal, Show } from "solid-js";
import { createHideOutside, createInteractOutside } from "@solid-primitives/interaction";

function Modal(props: { open: boolean; onClose: () => void }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  createHideOutside({
    targets: () => (ref() ? [ref()!] : []),
    disabled: () => !props.open,
  });

  createInteractOutside(
    {
      disabled: () => !props.open,
      onInteractOutside: props.onClose,
    },
    ref,
  );

  return (
    <Show when={props.open}>
      <div ref={setRef} role="dialog">
        Modal content
      </div>
    </Show>
  );
}
```

## `makeInertOthers`

Hides everything outside a modal layer from assistive technology and user interaction by marking it `aria-hidden` and/or `inert`. Where [`ariaHideOutside`](#ariahideoutside) tags every node outside the targets, this one walks from each target up to the root and hides only the sibling subtrees that do not contain a target, and it is built for stacked layers.

```ts
// Type
type InertStrategy = "aria-hidden" | "inert" | "both";

type InertOthersOptions = {
  strategy?: InertStrategy; // default "aria-hidden"
  ignore?: Element | readonly (Element | null | undefined)[] | null;
  root?: Element; // default: the target's document.body
};

function makeInertOthers(
  targets: HTMLElement | readonly HTMLElement[] | null | undefined,
  options?: InertOthersOptions,
): VoidFunction;

// Example
import { makeInertOthers } from "@solid-primitives/interaction";

const restore = makeInertOthers(dialogEl, { strategy: "both", ignore: toastRegionEl });
// ...when the dialog closes
restore();
```

## `createInertOthers`

Reactive, owner-aware version of `makeInertOthers`, toggled by a signal.

```ts
// Type
function createInertOthers(
  targets: MaybeAccessor<HTMLElement | readonly HTMLElement[] | null | undefined>,
  enabled?: MaybeAccessor<boolean>, // default true
  options?: Omit<InertOthersOptions, "ignore"> & { ignore?: MaybeAccessor<...> },
): void;

// Example
import { createSignal } from "solid-js";
import { createInertOthers } from "@solid-primitives/interaction";

const [dialog, setDialog] = createSignal<HTMLElement>();
const [open, setOpen] = createSignal(false);

createInertOthers(dialog, open);

<div ref={setDialog} role="dialog" />;
```

The layer is applied after render, so a ref signal works as `targets`. Changing `targets` or `ignore` updates the layer in place (it keeps its stack position); turning `enabled` off restores the DOM, and turning it on again opens a new layer on top. Disposal of the owner restores it too. Only `enabled`, `targets` and `ignore` are reactive: `strategy` and `root` are read once when the layer opens, so to change them disable and re-enable (which opens a new layer on top).

### Behavior

- **Root and ignore:** without an explicit `root`, the root follows the first target's document `body` (re-evaluated when reactive targets change). A layer's `ignore` elements also stay exposed to the layers below it.
- **Skipped nodes:** `ignore` elements, live regions (`aria-live` other than `off`, and `role` `alert` / `status` / `log`; only with the default `aria-hidden` strategy, and never a live region that contains a lower layer's target), `script` / `style` / `template` / `noscript` / `link` / `meta`, and nodes that were already `aria-hidden="true"` (or `inert`) before the layer opened. A branch that contains a protected element stays exposed and its other children are hidden.
- **Restore:** a node's previous `aria-hidden` / `inert` value (or absence) is put back when its last holder closes.
- **Stacking:** opening a second layer hides the first one and exposes the second. Stacking order is opening order, like a real modal stack: the layer that opened last is on top. A `createInertOthers` layer keeps its position while it stays open, however its `targets` or `ignore` change, but disabling it and enabling it again is a new open and puts it on top (a layer that was created first but enabled later is above the layers that opened before it, and the layers that were open in between are hidden by it). Each node keeps a shared per-strategy ref count, so the layers can close in any order and a node stays hidden until every layer that hides it is closed. A lower layer's `ignore` elements are still hidden by an upper layer, on purpose.
- **Dynamic content:** nodes appended to a walked parent are hidden, and nodes removed from the document are released.
- **Duplicate copies:** the shared state lives on `globalThis`, so it stays correct if more than one copy of this package ends up installed.
- **Server:** both are no-ops.
- **Notes:** `inert` is not supported in every older browser, use `"both"` for the widest coverage. Attributes set by other code on a node while a layer holds it are overwritten on restore.

#### Focus and `aria-hidden`

Browsers (Chrome logs "Blocked aria-hidden on an element because its descendant retained focus") do not apply `aria-hidden` to an ancestor of the focused element: after about 100ms the attribute is in the DOM but the accessibility tree keeps exposing the node, and it is not applied again later. So when a node to hide contains the focused element (open shadow roots included), the `aria-hidden` part of the hold is deferred until focus leaves that node (`focusin` / `focusout` on its document, or removal of the focused element from the node, for browsers that fire no blur on removal), and applied then. Closing the layer before that simply drops the deferred hold; ref counts and restored values stay exact. The `inert` part is never deferred, because `inert` blurs the focused element itself.

- Prefer `strategy: "both"` or `"inert"` for modals.
- Move focus into the dialog right after opening it. The library never moves focus itself.

#### Caveats

- Only element children are hidden. Direct text nodes of a walked ancestor stay exposed.
- Nodes appended to the root after the layer opened (for example a select or popover dropdown portaled to `body` out of a modal) are hidden too, until they get their own layer or are passed in `ignore`. This is a common trap with portaled dropdowns inside a modal.
- If every target is removed from the document while the layer is open, what the layer already holds stays held until the layer is updated (new targets) or closed, instead of releasing the whole page. The one exception is a layer opened above it: holds that cover that upper layer's targets or `ignore` elements are released, and the frozen layer never adds new holds.
- The root is a single document: a target inside an iframe does not hide the parent document. A target moved to another document re-roots the layer there.
- Any value of the `inert` attribute counts as already inert, and such a node is left alone.

### `ariaHideOutside` or `makeInertOthers`?

They do not share state. Each one leaves alone a node the other already marked `aria-hidden="true"`, so mixing them will not fight over a node, but they will not stack with each other either. Prefer one per app.

- Use `makeInertOthers` / `createInertOthers` for modal layers that can stack, need `inert`, an `ignore` list, or previous attribute values restored.
- Use `ariaHideOutside` / `createHideOutside` when you need `alwaysVisibleSelector`, or already rely on its behavior.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Credits

Based on primitives from [Kobalte](https://kobalte.dev), adapted for Solid 2.0 and the Solid Primitives ecosystem:

- [`createInteractOutside`](https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-interact-outside/create-interact-outside.ts) — Kobalte, MIT, Copyright (c) 2022 Kobalte contributors
- [`createHideOutside`](https://github.com/kobaltedev/kobalte/blob/main/packages/core/src/primitives/create-hide-outside/create-hide-outside.ts) — Kobalte, MIT, Copyright (c) 2022 Kobalte contributors

Kobalte's implementation draws from:

- [Radix UI Primitives](https://github.com/radix-ui/primitives) — MIT, Copyright (c) 2022 WorkOS
- [Zag by Chakra UI](https://github.com/chakra-ui/zag) — MIT, Copyright (c) 2021 Chakra UI
