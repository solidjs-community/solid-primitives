<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=dismissable&version=2.0" alt="Solid Primitives dismissable">
</p>

# @solid-primitives/dismissable

[![docs](https://img.shields.io/badge/-docs-blue?style=for-the-badge)](https://primitives.solidjs.community/package/dismissable)
[![version](https://img.shields.io/npm/v/@solid-primitives/dismissable?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/dismissable)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Dismissable layers (dialogs, popovers, menus) that share one layer stack, so Escape and outside presses always close the topmost layer first.

- **`makeDismissableLayer`** — non-reactive layer registration, returns `{ dismiss, cleanup, layer }`.
- **`createDismissableLayer`** — reactive layer, registers when `ref` resolves and unregisters on cleanup.
- **`getLayerStack` / `useLayerStack` / `getTopLayer` / `isTopLayer`** — read the shared stack.

Outside press and outside focus detection is delegated to [`@solid-primitives/interaction`](../interaction#readme) (`makeInteractOutside`, shadow-DOM aware; a touch that turns into a scroll or drag never dismisses); the Escape listener uses [`@solid-primitives/event-listener`](../event-listener#readme).

## Installation

```bash
npm install @solid-primitives/dismissable
# or
yarn add @solid-primitives/dismissable
# or
pnpm add @solid-primitives/dismissable
```

## How the stack works

- Layers are pushed on registration and removed on cleanup, in any order.
- Only the **topmost non-persistent** layer reacts to Escape, an outside pointer press and outside focus. Nested layers therefore close one at a time, even if a handler removes its layer synchronously.
- A press inside any layer opened after a layer (or registered with it as `parent`) is never "outside" that layer, so portaled children do not dismiss their parent.
- A **persistent** layer stays in the stack but is never auto-dismissed and never steals the top position. A layer that turns persistent while a press is being handled (for example in the tapped element's click handler) is not dismissed by that press.
- An outside press is attributed to the layer that was on top when the press started, so a touch tap that closes the layer above (in a click handler) does not also dismiss the layer below.
- When a layer is not `dismissible`, the request goes to `onDismissAttempt` and does **not** fall through to the layer below.

Dismiss reasons: `"escape" | "outside-pointer" | "outside-focus" | "programmatic"`.

### Mouse vs touch ordering

- **Mouse / pen:** an outside press dismisses on `pointerdown`, _before_ the pressed element's own `click` handlers run.
- **Touch:** the outside check is deferred to the tap's `click` (so a scroll or drag never dismisses), which means the dismissal runs _after_ the tapped element's own `click` handler. Whether a layer reacts is decided when the press **starts**: a layer that was the top layer at that moment is still dismissed by the tap even if the tapped trigger opened a new layer in its click handler. The newly opened layer is not dismissed by that same tap.
- A press that lands on a focusable element and the focus move it causes count as **one** interaction: the layer gets a single `outside-pointer` request (and a single `onDismissAttempt` when it is not `dismissible`), not an extra `outside-focus` one. This includes pressing a `<label>` whose associated control takes focus on click. A later keyboard focus move (e.g. Tab) to an outside element still reports `outside-focus`.
- A touch that is cancelled (scroll), drifts more than a few pixels, is followed by a key press, or whose `click` does not arrive shortly after release is dropped and cannot dismiss on a later click.

### Documents and cleanup

- A layer observes events of **its own document only**. A press or Escape inside a same-origin iframe does not dismiss a main-document layer, and the other way around. Cross-document dismissal is not supported. Workaround: from inside the iframe, forward the event yourself, e.g. `iframe.contentDocument.addEventListener("pointerdown", () => layer.dismiss("outside-pointer"))`, or register a layer in the iframe's document for its own content.
- A layer whose element is removed from the DOM without calling `cleanup` **stays in the stack** (and keeps blocking the layers below it). Always call `cleanup` (e.g. in `onCleanup`) or use `createDismissableLayer`, which does so through its owner.

## `makeDismissableLayer`

```ts
// Type
function makeDismissableLayer(options: {
  element: Element;
  onDismiss: (reason: DismissReason, event?: Event) => void;
  dismissible?: boolean | (() => boolean | undefined);
  onDismissAttempt?: (reason: DismissReason, event?: Event) => void;
  exclude?: Element | readonly Element[] | ((element: Element) => boolean);
  persistent?: boolean | (() => boolean | undefined);
  disableOutsidePointerEvents?: boolean;
  parent?: DismissableLayer;
}): {
  dismiss: (reason?: DismissReason, event?: Event) => void; // defaults to "programmatic"
  cleanup: () => void; // idempotent
  layer: DismissableLayer;
};

// Example
import { makeDismissableLayer } from "@solid-primitives/dismissable";

const { cleanup } = makeDismissableLayer({
  element: dialogEl,
  onDismiss: reason => closeDialog(reason),
});
// later
cleanup();
```

## `createDismissableLayer`

Same options, with `ref` (an element or an accessor, e.g. a ref signal) instead of `element`. The layer registers once `ref` resolves, re-registers if it changes, and unregisters when the owner is disposed. `dismissible`, `persistent` and the callbacks are read when needed, so changing them does not re-register the layer (the stack position is kept).

```ts
// Type
function createDismissableLayer(options: Omit<MakeOptions, "element"> & {
  ref: Element | null | undefined | (() => Element | null | undefined);
}): {
  dismiss: (reason?: DismissReason, event?: Event) => void;
  isTop: () => boolean;
};

// Example
import { createSignal } from "solid-js";
import { createDismissableLayer } from "@solid-primitives/dismissable";

function Dialog(props: { onClose: () => void }) {
  const [el, setEl] = createSignal<HTMLElement>();
  const [shake, setShake] = createSignal(false);

  createDismissableLayer({
    ref: el,
    onDismiss: () => props.onClose(),
    dismissible: () => !busy(),
    onDismissAttempt: () => setShake(true), // dismiss requested while not dismissible
    exclude: triggerEl, // pressing the trigger is not an outside press
  });

  return <div ref={setEl} class={{ shake: shake() }} />;
}
```

## Layer stack helpers

```ts
// Type
function getLayerStack(): DismissableLayer[]; // bottom (oldest) first
function useLayerStack(): () => readonly DismissableLayer[]; // reactive
function getTopLayer(): DismissableLayer | undefined; // topmost non-persistent layer
function isTopLayer(layer: DismissableLayer): boolean;

// Example
import { useLayerStack } from "@solid-primitives/dismissable";

const stack = useLayerStack();
const hasOpenLayers = () => stack().length > 0;
```

### Notes

- `disableOutsidePointerEvents` sets `pointer-events: none` on `document.body` while any such layer is registered and `none` on every layer below the topmost such layer (per document); that topmost disabling layer and any layer above it get `auto`; previous values are restored when the last one is removed.
- Listeners are attached on the next tick (by `makeInteractOutside`) so the event that opened a layer does not immediately dismiss it.
- On the server, everything is a no-op: layers are not registered and the stack is always empty.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
