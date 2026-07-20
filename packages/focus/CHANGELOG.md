# @solid-primitives/focus

## 1.0.0-next.2

### Minor Changes

- b7ef2f3: Add `createFocusRestore` — saves the currently focused element while active and restores focus to it once deactivated, without trapping focus or managing tab order. For non-modal surfaces (Popover, Tooltip, Menu) that should return focus to their trigger on close but must not intercept Tab navigation while open; for modal dialogs needing both behaviors, use `createFocusTrap`'s existing `restoreFocus` option instead.

  Also fixed a stale-closure race shared between `createFocusTrap` and the new `createFocusRestore`: the restore target used to be read from a mutable outer variable inside a deferred `afterPaint` callback, so a fast reactivate-before-restore-fires cycle could restore focus to the wrong element. Both primitives now share one internal helper that captures the target synchronously at deactivation time.

### Patch Changes

- Updated dependencies [b7ef2f3]
  - @solid-primitives/utils@7.0.0-next.3

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/event-listener@3.0.0-next.2
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- ddf4ecd: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

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

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0
  - @solid-primitives/event-listener@3.0.0-next.0

## 0.1.4

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.1.3

### Patch Changes

- 48d890d: Add missing type keyword to type imports.

## 0.1.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.
- Updated dependencies [396812d]
  - @solid-primitives/utils@6.3.2

## 0.1.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)
- Updated dependencies [53f08cc]
  - @solid-primitives/utils@6.3.1

## 0.1.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/utils@6.3.0

## 0.0.111

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.0.110

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 0.0.109

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 0.0.108

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.0.107

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

## 0.0.106

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 0.0.105

### Patch Changes

- e0d87bcf: Make `autofocus` usable with `ref`

## 0.0.104

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0

## 0.0.103

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/utils@5.5.1

## 0.0.102

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0

## 0.0.102-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0

## 0.0.101

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/utils@5.2.1
