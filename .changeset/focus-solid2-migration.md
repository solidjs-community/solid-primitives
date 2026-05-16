---
"@solid-primitives/focus": major
---

Migrate to Solid.js v2.0 (beta.12)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.12` and `@solidjs/web@^2.0.0-beta.12` are now required.

- `autofocus` is now a **ref callback factory** (`use:autofocus` directive removed; Solid 2.0 no longer supports `use:` directives):
  ```tsx
  // Before
  <button use:autofocus autofocus>...</button>
  // After
  <button ref={autofocus()} autofocus>...</button>

  // Before
  <button use:autofocus={false} autofocus>...</button>
  // After
  <button ref={autofocus(false)} autofocus>...</button>
  ```
- `JSX` type is now imported from `@solidjs/web` (was `solid-js`)
- `onMount` replaced by `onSettled` from `solid-js`
- `createAutofocus` uses split `createEffect(compute, apply)` form with proper timeout cleanup on re-focus

## New Primitives

`makeFocusListener` and `createFocusSignal` have moved here from `@solid-primitives/active-element`:

- **`makeFocusListener(target, callback, useCapture?)`** — attaches `focus`/`blur` listeners to an element, calling `callback` with the new boolean focus state. Returns a cleanup function.
  ```ts
  const clear = makeFocusListener(el, isFocused => console.log(isFocused));
  clear(); // remove listeners
  ```
- **`createFocusSignal(target)`** — reactive signal that tracks whether `target` is focused.
  ```ts
  const isFocused = createFocusSignal(() => el);
  isFocused(); // boolean
  ```
