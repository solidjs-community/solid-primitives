<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Fullscreen" alt="Solid Primitives Fullscreen">
</p>

# @solid-primitives/fullscreen

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/fullscreen?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/fullscreen)
[![size](https://img.shields.io/npm/v/@solid-primitives/fullscreen?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/fullscreen)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive wrapper around the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API) that integrates with Solid's reactive system.

## Installation

```bash
npm install @solid-primitives/fullscreen
# or
pnpm add @solid-primitives/fullscreen
```

## How to use it

### `createFullscreen`

Reactively toggles fullscreen on a target element. Returns an `Accessor<boolean>` reflecting whether the element is currently in fullscreen.

```ts
const isActive: Accessor<boolean> = createFullscreen(
  ref: HTMLElement | Accessor<HTMLElement | undefined>,
  active?: Accessor<FullscreenOptions | boolean>,
  options?: FullscreenOptions
);
```

**Via ref signal:**

```tsx
const MyComponent: Component = () => {
  const [fs, setFs] = createSignal(false);
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const active = createFullscreen(ref, fs);

  return (
    <div ref={setRef} onClick={() => setFs(f => !f)}>
      {active() ? "click to exit fullscreen" : "click to fullscreen"}
    </div>
  );
};
```

The ref must be a signal so the element is captured reactively rather than in a stale closure.

You can pass `FullscreenOptions` either inside the `active` accessor return value or as a third argument:

```tsx
// Options via active accessor (useful for programmatic control):
createFullscreen(ref, () => ({ navigationUI: "hide" }));

// Options as third argument:
createFullscreen(ref, isActive, { navigationUI: "hide" });
```

---

### `fullscreen` (ref directive factory)

A convenience factory that creates a ref callback for use directly in JSX. Solid 2.0 uses `ref` callbacks in place of the old `use:` directive syntax.

```tsx
const MyComponent: Component = () => {
  const [fs, setFs] = createSignal(false);

  return (
    <div ref={fullscreen(fs)} onClick={() => setFs(f => !f)}>
      {fs() ? "click to exit fullscreen" : "click to fullscreen"}
    </div>
  );
};
```

`fullscreen` must be called during component render (inside a reactive owner) — the same constraint as any Solid primitive.

## Demo

TODO

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
