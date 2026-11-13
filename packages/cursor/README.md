<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=cursor" alt="Solid Primitives cursor">
</p>

# @solid-primitives/cursor

[![size](https://img.shields.io/badge/size-651_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/cursor)
[![version](https://img.shields.io/npm/v/@solid-primitives/cursor?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/cursor)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Utilities for setting the CSS cursor property via reactive primitives (`createBodyCursor`, `createElementCursor`) and imperative APIs (`makeBodyCursor`, `makeElementCursor`).

- [`makeBodyCursor`](#makebodycursor) - Set cursor on body immediately; returns a cleanup function.
- [`makeElementCursor`](#makeelementcursor) - Set cursor on an element immediately; returns a cleanup function.
- [`createBodyCursor`](#createbodycursor) - Set cursor on body reactively.
- [`createElementCursor`](#createelementcursor) - Set cursor on a specific element reactively.
- [`createDragCursor`](#createdragcursor) - Show `grab`/`grabbing` cursors during pointer drag.
- [`cursorRef`](#cursorref) - Ref factory for inline JSX use.

## Installation

```bash
npm install @solid-primitives/cursor
# or
yarn add @solid-primitives/cursor
# or
pnpm add @solid-primitives/cursor
```

## `makeBodyCursor`

Sets a cursor on the body element immediately and returns a cleanup function that restores the previous value. No reactive owner required.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { makeBodyCursor } from "@solid-primitives/cursor";

function Demo() {
  const [loading, setLoading] = createSignal(false);
  const simulate = () => {
    setLoading(true);
    const restore = makeBodyCursor("wait");
    setTimeout(() => {
      restore();
      setLoading(false);
    }, 2000);
  };
  return (
    <button onClick={simulate} disabled={loading()}>
      {loading() ? "Loading… (cursor: wait)" : "Simulate async operation"}
    </button>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { makeBodyCursor } from "@solid-primitives/cursor";

// Show a loading cursor during an async operation
const restore = makeBodyCursor("wait");
await doSomething();
restore();
```

## `makeElementCursor`

Sets a cursor on a specific element immediately and returns a cleanup function that restores the previous value. No reactive owner required.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { makeElementCursor } from "@solid-primitives/cursor";

function Demo() {
  let box!: HTMLDivElement;
  let restore: VoidFunction | undefined;
  const [blocked, setBlocked] = createSignal(false);
  const toggle = () => {
    if (restore) {
      restore();
      restore = undefined;
    } else {
      restore = makeElementCursor(box, "not-allowed");
    }
    setBlocked(!!restore);
  };
  return (
    <>
      <button onClick={toggle}>{blocked() ? "Restore cursor" : "Block box"}</button>
      <div ref={box} style={{ padding: "2rem", border: "1px solid #ccc", "margin-top": "8px" }}>
        Hover me — cursor: {blocked() ? "not-allowed" : "default"}
      </div>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { makeElementCursor } from "@solid-primitives/cursor";

const el = document.querySelector("#element")!;
const restore = makeElementCursor(el, "not-allowed");
// ... later
restore();
```

## `createBodyCursor`

Sets a cursor on the body element reactively. The cursor is removed when the owner is disposed or when the signal returns a falsy value.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { createBodyCursor, type CursorProperty } from "@solid-primitives/cursor";

function Demo() {
  const [cursor, setCursor] = createSignal<CursorProperty | false>(false);
  createBodyCursor(cursor);
  const cursors: CursorProperty[] = ["pointer", "crosshair", "help", "wait", "zoom-in"];
  return (
    <>
      <For each={cursors}>
        {c => <button onClick={() => setCursor(p => (p === c ? false : c))}>{c}</button>}
      </For>
      <p>body cursor: {cursor() || "(none)"} — move the pointer anywhere</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createBodyCursor } from "@solid-primitives/cursor";

const [cursor, setCursor] = createSignal("pointer");
const [enabled, setEnabled] = createSignal(true);

createBodyCursor(() => enabled() && cursor());

setCursor("help");
```

## `createElementCursor`

Sets a cursor on a specific element reactively. Accepts an element or a signal returning one — returning a falsy value unsets the cursor.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createElementCursor, type CursorProperty } from "@solid-primitives/cursor";

function Demo() {
  const [el, setEl] = createSignal<HTMLElement>();
  const [enabled, setEnabled] = createSignal(true);
  const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
  createElementCursor(() => enabled() && el(), cursor);
  return (
    <>
      <button onClick={() => setEnabled(e => !e)}>{enabled() ? "Disable" : "Enable"}</button>
      <button onClick={() => setCursor(c => (c === "pointer" ? "crosshair" : "pointer"))}>
        Switch cursor
      </button>
      <div ref={setEl} style={{ padding: "2rem", border: "1px solid #ccc", "margin-top": "8px" }}>
        Hover me — cursor: {enabled() ? cursor() : "(default)"}
      </div>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createElementCursor } from "@solid-primitives/cursor";

const target = document.querySelector("#element");
const [cursor, setCursor] = createSignal("pointer");
const [enabled, setEnabled] = createSignal(true);

createElementCursor(() => enabled() && target, cursor);

setCursor("help");
```

## `createDragCursor`

Shows `"grab"` on a target element and switches to `"grabbing"` on the body during a pointer drag. Setting `"grabbing"` on the body ensures the cursor renders correctly everywhere during drag, not just over the target element.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createDragCursor } from "@solid-primitives/cursor";

function Demo() {
  const [el, setEl] = createSignal<HTMLElement>();
  createDragCursor(el);
  return (
    <div ref={setEl} style={{ padding: "1rem", border: "1px solid #ccc", "user-select": "none" }}>
      Hover to see "grab", press and hold to see "grabbing" everywhere
    </div>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createDragCursor } from "@solid-primitives/cursor";

const [ref, setRef] = createSignal<HTMLElement>();

createDragCursor(ref);

<div ref={setRef}>Drag me</div>
```

Custom cursor values can be provided via options:

```ts
createDragCursor(el, { grab: "crosshair", grabbing: "move" });
```

## `cursorRef`

A ref factory for setting a cursor inline in JSX. Accepts a static cursor value or a reactive signal. The cursor is removed when the component unmounts.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { cursorRef, type CursorProperty } from "@solid-primitives/cursor";

function Demo() {
  const [cursor, setCursor] = createSignal<CursorProperty>("zoom-in");
  return (
    <>
      <div ref={cursorRef("pointer")} style={{ padding: "1rem", border: "1px solid #ccc" }}>
        Static: pointer
      </div>
      <button onClick={() => setCursor(c => (c === "zoom-in" ? "zoom-out" : "zoom-in"))}>
        Toggle
      </button>
      <div ref={cursorRef(cursor)} style={{ padding: "1rem", border: "1px solid #ccc" }}>
        Reactive: {cursor()}
      </div>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```tsx
import { cursorRef } from "@solid-primitives/cursor";

// Static
<div ref={cursorRef("pointer")}>...</div>;

// Reactive
const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
<div ref={cursorRef(cursor)}>...</div>;
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
