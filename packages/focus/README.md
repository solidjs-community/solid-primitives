<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=focus&version=2.0" alt="Solid Primitives Focus">
</p>

# @solid-primitives/focus

[![size](https://img.shields.io/badge/size-3.21_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/focus)
[![version](https://img.shields.io/npm/v/@solid-primitives/focus?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/focus)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Primitives for autofocusing HTML elements and trapping focus within a container.

The native `autofocus` attribute only works on page load, which makes it incompatible with SolidJS. These primitives run on render, allowing autofocus on initial render as well as dynamically added components.

- [`autofocus`](#autofocus) - Ref callback factory to autofocus an element on render.
- [`createAutofocus`](#createautofocus) - Reactive primitive to autofocus an element on render.
- [`createFocusTrap`](#createfocustrap) - Traps focus inside a given DOM element.
- [`createFocusRestore`](#createfocusrestore) - Restores focus to the previously focused element, without trapping.
- [`createFocusGroup`](#createfocusgroup) - Imperatively moves focus between the focusable elements of a container.
- [`makeRovingScope` / `createRovingScope`](#makerovingscope--createrovingscope) - Roving tabindex for the items of a container: one tab stop, arrow-key navigation, remembers the last item.
- [`makePressKeepsFocus` / `createPressKeepsFocus`](#makepresskeepsfocus--createpresskeepsfocus) - Pressing a control (e.g. a toolbar button) does not steal focus from the focused element.

## Installation

```bash
npm install @solid-primitives/focus
# or
yarn add @solid-primitives/focus
# or
pnpm add @solid-primitives/focus
```

## `autofocus`

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { autofocus } from "@solid-primitives/focus";

function Demo() {
  const [mounted, setMounted] = createSignal(true);
  return (
    <>
      <button onClick={() => setMounted(m => !m)}>{mounted() ? "Unmount" : "Remount"}</button>
      <Show when={mounted()}>
        <input ref={autofocus()} autofocus placeholder="Focused on every mount" />
      </Show>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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
</button>
```

> **Note:** The `enabled` parameter was removed because it was redundant — the same effect is achieved by omitting the `autofocus` attribute. Previously, Solid directives always received an accessor argument whether you used it or not, which gave the impression an explicit toggle was necessary.

## `createAutofocus`

`createAutofocus` reactively autofocuses an element passed in as a signal.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { createAutofocus } from "@solid-primitives/focus";

function Field() {
  const [ref, setRef] = createSignal<HTMLInputElement>();
  createAutofocus(ref);
  return <input ref={setRef} placeholder="Focused via signal ref" />;
}

function Demo() {
  const [mounted, setMounted] = createSignal(true);
  return (
    <>
      <button onClick={() => setMounted(m => !m)}>{mounted() ? "Unmount" : "Remount"}</button>
      <Show when={mounted()}>
        <Field />
      </Show>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { createFocusTrap } from "@solid-primitives/focus";

function Demo() {
  const [open, setOpen] = createSignal(false);
  const [trapRef, setTrapRef] = createSignal<HTMLElement>();
  createFocusTrap({ element: trapRef, enabled: open });

  return (
    <>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      <div ref={setTrapRef} style={{ border: "1px solid #ccc", padding: "1rem" }}>
        <Show when={open()} fallback={<p>Dialog closed.</p>}>
          <p>Tab / Shift+Tab stay inside this box.</p>
          <input placeholder="Name" />
          <button onClick={() => setOpen(false)}>Close</button>
        </Show>
      </div>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

| Prop                  | Type                               | Default                    | Description                                                                       |
| --------------------- | ---------------------------------- | -------------------------- | --------------------------------------------------------------------------------- |
| `element`             | `MaybeAccessor<HTMLElement\|null>` | —                          | Element to trap focus within.                                                     |
| `enabled`             | `MaybeAccessor<boolean>`           | `true`                     | Whether the trap is active.                                                       |
| `observeChanges`      | `MaybeAccessor<boolean>`           | `true`                     | Watch for DOM mutations inside the container and refresh focusable elements.      |
| `initialFocusElement` | `MaybeAccessor<HTMLElement\|null>` | First focusable element    | Element to focus when the trap activates.                                         |
| `restoreFocus`        | `MaybeAccessor<boolean>`           | `true`                     | Restore focus to the previously focused element when the trap deactivates.        |
| `finalFocusElement`   | `MaybeAccessor<HTMLElement\|null>` | Previously focused element | Element to focus when the trap deactivates.                                       |
| `onInitialFocus`      | `(event: Event) => void`           | —                          | Callback when focus moves into the trap. Call `event.preventDefault()` to cancel. |
| `onFinalFocus`        | `(event: Event) => void`           | —                          | Callback when focus restores. Call `event.preventDefault()` to cancel.            |

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

## `createFocusRestore`

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { createFocusRestore } from "@solid-primitives/focus";

function Demo() {
  const [open, setOpen] = createSignal(false);
  createFocusRestore({ enabled: open });

  return (
    <>
      <button onClick={() => setOpen(o => !o)}>Toggle popover</button>
      <Show when={open()}>
        <div role="dialog" style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <input placeholder="Focus me, then press Close" />
          <button onClick={() => setOpen(false)}>Close (focus returns to where it was)</button>
        </div>
      </Show>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

`createFocusRestore` saves the currently focused element while active and restores focus to it once deactivated — without trapping focus or managing tab order. Use it for non-modal surfaces (Popover, Tooltip, Menu) that should return focus to their trigger on close but must not intercept Tab navigation while open. For modal dialogs that need both behaviors, use [`createFocusTrap`](#createfocustrap)'s `restoreFocus` option instead.

### How to use it

```tsx
import { createFocusRestore } from "@solid-primitives/focus";

const Popover: Component<{ open: boolean }> = props => {
  createFocusRestore({ enabled: () => props.open });

  return (
    <Show when={props.open}>
      <div role="dialog">...</div>
    </Show>
  );
};
```

### Props

| Prop                | Type                               | Default                    | Description                                                            |
| ------------------- | ---------------------------------- | -------------------------- | ---------------------------------------------------------------------- |
| `enabled`           | `MaybeAccessor<boolean>`           | `true`                     | Whether focus-restore is active.                                       |
| `element`           | `MaybeAccessor<HTMLElement\|null>` | `document.body`            | Element to dispatch the `onFinalFocus` event on.                       |
| `finalFocusElement` | `MaybeAccessor<HTMLElement\|null>` | Previously focused element | Element to focus when deactivated.                                     |
| `onFinalFocus`      | `(event: Event) => void`           | —                          | Callback when focus restores. Call `event.preventDefault()` to cancel. |

## `createFocusGroup`

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createFocusGroup } from "@solid-primitives/focus";

function Demo() {
  const [ref, setRef] = createSignal<HTMLElement>();
  const group = createFocusGroup(ref, () => ({ wrap: true }));

  return (
    <>
      <div ref={setRef} role="menu" style={{ display: "flex", "flex-direction": "column" }}>
        <button role="menuitem">One</button>
        <button role="menuitem">Two</button>
        <button role="menuitem">Three</button>
      </div>
      <p>Focus an item and use the arrow keys, Home / End — or:</p>
      <button onClick={() => group.focusFirst()}>Focus first item</button>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

`createFocusGroup` creates a [FocusGroup](#focusgroup) that moves focus between the focusable elements of a container — e.g. arrow-key navigation in a menu, listbox or toolbar. It walks the DOM with a `TreeWalker`, either restricting itself to tabbable elements or considering everything focusable. Keyboard navigation (arrow keys, Home/End, Tab) is enabled by default: the `keydown` listener is attached to the focus group ref automatically.

### How to use it

```tsx
import { createFocusGroup } from "@solid-primitives/focus";

const [ref, setRef] = createSignal<HTMLElement>();

// Keyboard navigation is attached to the ref automatically.
createFocusGroup(ref);

return (
  <div ref={setRef} role="menu">
    <button role="menuitem">One</button>
    <button role="menuitem">Two</button>
    <button role="menuitem">Three</button>
  </div>
);
```

The returned group also exposes imperative methods for moving focus, e.g. inside a click handler:

```tsx
const group = createFocusGroup(ref);

return <button onClick={() => group.focusNext()}>Next</button>;
```

### `FocusGroup`

The object returned by `createFocusGroup`. Each method focuses its target and returns it (or `undefined` when there is nothing to move to). Methods accept an options object:

| Method            | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `focusNext()`     | Moves focus to the next focusable/tabbable element.     |
| `focusPrevious()` | Moves focus to the previous focusable/tabbable element. |
| `focusFirst()`    | Moves focus to the first focusable/tabbable element.    |
| `focusLast()`     | Moves focus to the last focusable/tabbable element.     |

### Keyboard navigation

Keyboard navigation is enabled by default and can be disabled with the `keyboardNavigation` option. The `keydown` listener is attached to the focus group ref (removed when the ref changes or the group is disposed):

- **Arrow keys** move focus between items, following `orientation` and `textDirection`. Home/End jump to the first/last item.
- **Tab/Shift+Tab** move within the group when `handleTab` is enabled and focus is already inside it; at a boundary the browser takes over.
- **`wrap: true`** loops around at the ends.

```tsx
createFocusGroup(ref, () => ({
  orientation: "horizontal",
  wrap: true,
}));
```

### Options

`from`, `tabbable`, `wrap`, and `accept` are traversal options: pass them per-method-call, or as defaults (second argument to `createFocusGroup`) that every call falls back to unless overridden.

```tsx
const group = createFocusGroup(ref, () => ({ wrap: true, tabbable: true }));

group.focusNext({ tabbable: false }); // overrides the default for this call only
```

| Option     | Type                | Default           | Description                                                    |
| ---------- | ------------------- | ----------------- | -------------------------------------------------------------- |
| `from`     | `Element`           | Currently focused | Element to start searching from.                               |
| `tabbable` | `boolean`           | `false`           | Only include tabbable elements (`tabindex="-1"` excluded).     |
| `wrap`     | `boolean`           | `false`           | Wrap around when reaching the end of the container.            |
| `accept`   | `(node) => boolean` | —                 | Callback determining whether an element is eligible for focus. |

`orientation`, `textDirection`, `handleTab`, and `keyboardNavigation` are group-level keyboard options. They only take effect via `createFocusGroup`'s default options (second argument) — passing them to an individual `focusNext()`/`focusPrevious()`/`focusFirst()`/`focusLast()` call has no effect, since those methods only read the traversal options above from their own `opts` argument.

| Option               | Type                           | Default      | Description                                                          |
| -------------------- | ------------------------------ | ------------ | -------------------------------------------------------------------- |
| `orientation`        | `MaybeAccessor<Orientation>`   | `"vertical"` | The orientation of the focus group (`"vertical"` or `"horizontal"`). |
| `textDirection`      | `MaybeAccessor<TextDirection>` | `"ltr"`      | The text direction of the focus group (`"ltr"` or `"rtl"`).          |
| `handleTab`          | `MaybeAccessor<boolean>`       | `true`       | Whether tab key presses should be handled.                           |
| `keyboardNavigation` | `MaybeAccessor<boolean>`       | `true`       | Whether the `keydown` listener is attached to the ref.               |

## `makeRovingScope` / `createRovingScope`

Manages a [roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex) for the items of a container: only the active item has `tabindex="0"`, all others `-1`, so the whole container is a single tab stop. Arrow keys, Home and End move between items.

```ts
// Type
function makeRovingScope(container: HTMLElement, options?: RovingScopeOptions): RovingScope;
function createRovingScope(
  container: Accessor<HTMLElement | null | undefined>,
  options?: CreateRovingScopeOptions, // same options, each one may be reactive
): RovingScopeSignal; // like RovingScope, with `active` as a signal and no `dispose`

// Example
import { createRovingScope } from "@solid-primitives/focus";

const [ref, setRef] = createSignal<HTMLElement>();
const scope = createRovingScope(ref, { selector: "button", orientation: "horizontal", loop: true });

<div role="toolbar" ref={setRef}>
  <button>Bold</button>
  <button>Italic</button>
  <button disabled>Underline</button>
</div>;

scope.active(); // the tabbable item
scope.focusLast();
```

### Options

| Option               | Type                                   | Default                | Description                                                                                            |
| -------------------- | -------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `selector`           | `string`                               | all focusable elements | CSS selector matching the items.                                                                       |
| `orientation`        | `"horizontal" \| "vertical" \| "both"` | `"both"`               | Which arrow keys navigate. `"both"` accepts all four.                                                  |
| `loop`               | `boolean`                              | `false`                | Wrap around at the ends.                                                                               |
| `textDirection`      | `"ltr" \| "rtl"`                       | detected               | Detected from the closest `[dir]` attribute / computed style. In `rtl`, horizontal arrows are flipped. |
| `skipDisabled`       | `boolean`                              | `true`                 | Skip `aria-disabled="true"` items. Natively `disabled` and hidden items are always skipped.            |
| `initialActive`      | `(items) => HTMLElement \| undefined`  | first navigable item   | Chooses the initially tabbable item.                                                                   |
| `keyboardNavigation` | `boolean`                              | `true`                 | Attach the `keydown` handler.                                                                          |
| `onActiveChange`     | `(item) => void`                       | —                      | `makeRovingScope` only. `createRovingScope` exposes `active` as a signal instead.                      |
| `enabled`            | `MaybeAccessor<boolean>`               | `true`                 | `createRovingScope` only. When `false`, original `tabindex` values are restored.                       |

### Behavior

- The last active item is remembered: when focus leaves the container, that item keeps `tabindex="0"`, so Tab returns to it.
- Items added, removed, disabled or hidden later are picked up with a `MutationObserver`; if the active item disappears the closest navigable neighbour becomes active.
- Nested scopes are independent. An item belongs to the closest scope container above it, and outer scopes release the items of inner scopes (and re-adopt them when the inner scope is disposed).
- Arrow/Home/End are ignored inside text fields, with modifier keys held, and for events that were already `preventDefault`ed. Original `tabindex` attributes are restored on `dispose()` / cleanup.
- `makeRovingScope` returns the scope including `dispose()`; use it when you manage the lifetime yourself. On the server both are inert.

### Difference to `createFocusGroup`

|                  | `createFocusGroup`                                        | `createRovingScope`                                                   |
| ---------------- | --------------------------------------------------------- | --------------------------------------------------------------------- |
| Tab order        | Untouched: every focusable child stays a tab stop.        | Container becomes a single tab stop (roving `tabindex`).              |
| Items            | Everything focusable (or tabbable) found by a TreeWalker. | Elements matching `selector`, skipping disabled/hidden, nested-aware. |
| Remembers item   | No (starts from the focused element).                     | Yes, the active item stays tabbable.                                  |
| Dynamic children | Looked up on every call.                                  | Tracked with a `MutationObserver`.                                    |

Use `createFocusGroup` for imperative "move focus from here" helpers or when tab order should stay as-is; use `createRovingScope` for composite widgets (toolbars, tab lists, menus, radio groups).

## `makePressKeepsFocus` / `createPressKeepsFocus`

Stops presses on non-text controls from moving focus away from the element that currently has it, for example toolbar buttons that must keep a rich text editor focused. `pointerdown` and `mousedown` are `preventDefault`ed; `click` still fires normally.

```ts
// Type
function makePressKeepsFocus(element: HTMLElement, options?: PressKeepsFocusOptions): VoidFunction;
function createPressKeepsFocus(options?: PressKeepsFocusOptions): (element: HTMLElement) => void;

interface PressKeepsFocusOptions {
  enabled?: MaybeAccessor<boolean>; // default true
  ignore?: (target: Element) => boolean; // keep native behavior for these targets
  onlyWhenFocused?: boolean; // default true: do nothing while nothing is focused
}

// Example
import { createPressKeepsFocus } from "@solid-primitives/focus";

<div role="toolbar" ref={createPressKeepsFocus()}>
  <button onClick={() => document.execCommand("bold")}>B</button>
</div>;

// imperative, returns a cleanup function
const clear = makePressKeepsFocus(toolbarEl);
```

### Notes

- Text inputs, `<textarea>`, `<select>` and `contenteditable` hosts always keep the native behavior so they can still be focused, as does anything matched by `ignore`.
- With nothing focused (`document.activeElement` is `<body>`), presses behave natively, so buttons can still take focus. Pass `onlyWhenFocused: false` to always prevent.
- `createPressKeepsFocus` registers cleanup with the current owner; one factory can be passed to several elements.

## `makeFocusListener`

`makeFocusListener` imperatively attaches `focus` and `blur` listeners to an element and returns a function that removes them.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { makeFocusListener } from "@solid-primitives/focus";

function Demo() {
  const [log, setLog] = createSignal<string[]>([]);
  const track = (name: string) => (el: HTMLInputElement) =>
    makeFocusListener(el, focused => setLog(l => [`${name}: ${focused ? "focus" : "blur"}`, ...l]));

  return (
    <>
      <input ref={track("A")} placeholder="Input A" />
      <input ref={track("B")} placeholder="Input B" />
      <ul>
        <For each={log().slice(0, 5)}>{entry => <li>{entry}</li>}</For>
      </ul>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

## `createFocusSignal`

`createFocusSignal` returns a boolean signal that tracks whether an element is focused.

```tsx repl
import { render } from "@solidjs/web";
import { createFocusSignal } from "@solid-primitives/focus";

function Demo() {
  let input!: HTMLInputElement;
  const isFocused = createFocusSignal(() => input);

  return (
    <>
      <input ref={input} placeholder="Click to focus" />
      <p>{isFocused() ? "focused" : "blurred"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

## Credits

`createFocusTrap` is ported from [solid-focus-trap](https://github.com/corvudev/corvu/tree/main/packages/solid-focus-trap), part of the [corvu](https://corvu.dev) UI toolkit by [Jasmin Noetzli (GiyoMoon)](https://github.com/GiyoMoon). Licensed under the MIT License.

`createFocusGroup` is ported from [kobalte](https://kobalte.dev)'s [`createFocusManager`](https://github.com/kobaltedev/kobalte/blob/main/packages/utils/src/focus-manager.ts), which in turn is based on [react-spectrum](https://react-spectrum.adobe.com)'s `FocusManager` (Apache License 2.0, Copyright 2020 Adobe).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
