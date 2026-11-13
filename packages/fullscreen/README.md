<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Fullscreen" alt="Solid Primitives Fullscreen">
</p>

# @solid-primitives/fullscreen

[![size](https://img.shields.io/badge/size-669_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/fullscreen)
[![size](https://img.shields.io/npm/v/@solid-primitives/fullscreen?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/fullscreen)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Reactive wrapper around the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API).

- [**Docs (Storybook)**](https://primitives.solidjs.community/storybook/?path=/docs/browser-apis-fullscreen--docs)
- [`makeFullscreen`](#makefullscreen) — Non-reactive base, no Solid lifecycle.
- [`createFullscreen`](#createfullscreen) — Reactive primitive with `isActive` state tracking.
- [`fullscreen`](#fullscreen-ref-directive-factory) — Ref factory for click-to-toggle.

## Installation

```bash
npm install @solid-primitives/fullscreen
# or
yarn add @solid-primitives/fullscreen
# or
pnpm add @solid-primitives/fullscreen
```

## Primitives

### `makeFullscreen`

Non-reactive base primitive. No Solid lifecycle dependency — safe to use outside components.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { makeFullscreen } from "@solid-primitives/fullscreen";

function Demo() {
  const [error, setError] = createSignal("");
  let enter: (() => Promise<void>) | undefined;
  let exit: (() => Promise<void>) | undefined;
  const run = (fn?: () => Promise<void>) => {
    setError("");
    fn?.().catch((e: Error) => setError(e.message));
  };
  return (
    <>
      <div
        ref={el => {
          [enter, exit] = makeFullscreen(el);
        }}
        style={{ padding: "1rem", background: "#eee" }}
      >
        <button disabled={!document.fullscreenEnabled} onClick={() => run(enter)}>
          Enter fullscreen
        </button>
        <button disabled={!document.fullscreenEnabled} onClick={() => run(exit)}>
          Exit fullscreen
        </button>
      </div>
      <p>{document.fullscreenEnabled ? error() : "Fullscreen is not available here"}</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const [enter, exit] = makeFullscreen(element, options?: FullscreenOptions);
```

`enter(options?)` calls `element.requestFullscreen()`. Call-time options override creation-time options. `exit()` calls `document.exitFullscreen()`.

```ts
const [enter, exit] = makeFullscreen(videoEl, { navigationUI: "hide" });
button.addEventListener("click", enter);
```

---

### `createFullscreen`

Reactive primitive that binds `enter`/`exit` to an element and tracks fullscreen state via the `fullscreenchange` event.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createFullscreen } from "@solid-primitives/fullscreen";

function Demo() {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const [error, setError] = createSignal("");
  const { enter, exit, isActive } = createFullscreen(ref);
  return (
    <div ref={el => setRef(el)} style={{ padding: "1rem", background: "#eee" }}>
      <p>isActive: {String(isActive())}</p>
      <button
        disabled={!document.fullscreenEnabled}
        onClick={() => {
          setError("");
          (isActive() ? exit() : enter()).catch((e: Error) => setError(e.message));
        }}
      >
        {isActive() ? "Exit" : "Enter"} fullscreen
      </button>
      <p>{document.fullscreenEnabled ? error() : "Fullscreen is not available here"}</p>
    </div>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const { enter, exit, isActive } = createFullscreen(
  ref: HTMLElement | Accessor<HTMLElement | undefined>,
  options?: FullscreenPrimitiveOptions,
);
```

`enter()` and `exit()` must be called from a direct user gesture — the browser requires it. `isActive` is an `Accessor<boolean>` that reflects the live fullscreen state.

```tsx
const { enter, exit, isActive } = createFullscreen(ref);

<button onClick={enter}>Go fullscreen</button>
<Show when={isActive()}>
  <button onClick={exit}>Exit</button>
</Show>
```

`ref` can be a reactive accessor — `createFullscreen` rebinds when the element changes:

```tsx
const [ref, setRef] = createSignal<HTMLDivElement>();
const { enter, isActive } = createFullscreen(ref);

<div ref={setRef}>...</div>;
```

#### `FullscreenPrimitiveOptions`

Extends the standard [`FullscreenOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen#options) with:

| Option          | Type      | Default | Description                                          |
| --------------- | --------- | ------- | ---------------------------------------------------- |
| `exitOnCleanup` | `boolean` | `true`  | Exit fullscreen when the reactive scope is disposed. |
| `navigationUI`  | `string`  | —       | Passed to `requestFullscreen`.                       |

```ts
const { enter } = createFullscreen(ref, { exitOnCleanup: false, navigationUI: "hide" });
```

---

### `fullscreen` (ref directive factory)

A ref factory that wires click-to-toggle fullscreen onto any element. Clicking enters fullscreen; clicking again exits. Must be called inside a reactive owner (component body or `createRoot`).

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { fullscreen } from "@solid-primitives/fullscreen";

function Demo() {
  const [error, setError] = createSignal("");
  const attach = fullscreen();
  return (
    <div
      ref={el => {
        // only attach where fullscreen is allowed (sandboxed iframes, iPhone Safari lack it)
        if (document.fullscreenEnabled) attach(el);
        el.addEventListener("fullscreenerror", () => setError("Fullscreen was blocked"));
        el.addEventListener("fullscreenchange", () => setError(""));
      }}
      style={{ padding: "2rem", background: "#eee", cursor: "pointer" }}
    >
      Click to toggle fullscreen
      <p>{document.fullscreenEnabled ? error() : "Fullscreen is not available here"}</p>
    </div>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
const attach = fullscreen(options?: FullscreenOptions);
// attach is a ref callback: (el: HTMLElement) => void
```

```tsx
// Simple toggle
<div ref={fullscreen()}>Click to go fullscreen</div>

// With options
<div ref={fullscreen({ navigationUI: "hide" })}>Click to go fullscreen</div>
```

The click listener is removed automatically when the component unmounts.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
