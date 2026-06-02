<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Fullscreen" alt="Solid Primitives Fullscreen">
</p>

# @solid-primitives/fullscreen

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/fullscreen?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/fullscreen)
[![size](https://img.shields.io/npm/v/@solid-primitives/fullscreen?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/fullscreen)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive wrapper around the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API).

- [**Docs (Storybook)**](https://primitives.solidjs.community/storybook/?path=/docs/browser-apis-fullscreen--docs)
- [`makeFullscreen`](#makefullscreen) — Non-reactive base, no Solid lifecycle.
- [`createFullscreen`](#createfullscreen) — Reactive primitive with `isActive` state tracking.
- [`fullscreen`](#fullscreen-ref-directive-factory) — Ref factory for click-to-toggle.

## Installation

```bash
npm install @solid-primitives/fullscreen
# or
pnpm add @solid-primitives/fullscreen
```

## Primitives

### `makeFullscreen`

Non-reactive base primitive. No Solid lifecycle dependency — safe to use outside components.

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

<div ref={setRef}>...</div>
```

#### `FullscreenPrimitiveOptions`

Extends the standard [`FullscreenOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen#options) with:

| Option | Type | Default | Description |
|---|---|---|---|
| `exitOnCleanup` | `boolean` | `true` | Exit fullscreen when the reactive scope is disposed. |
| `navigationUI` | `string` | — | Passed to `requestFullscreen`. |

```ts
const { enter } = createFullscreen(ref, { exitOnCleanup: false, navigationUI: "hide" });
```

---

### `fullscreen` (ref directive factory)

A ref factory that wires click-to-toggle fullscreen onto any element. Clicking enters fullscreen; clicking again exits. Must be called inside a reactive owner (component body or `createRoot`).

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
