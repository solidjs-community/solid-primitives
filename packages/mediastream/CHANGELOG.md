# @solid-primitives/mediastream

## 1.0.1

### Patch Changes

- 6457c24: Fix the README `createStream` and `createScreen` examples, which created an effect inside a JSX `ref` callback and threw `PRIMITIVE_IN_EFFECT_CALLBACK` in Solid 2 (#1143). They now keep the element in a signal via `ref={setVideo}` and assign `srcObject` from an effect in the component body. Documentation only, no source change.

  The examples also no longer wrap in `<Loading>` (`stream()` is a plain signal, so it never shows a fallback; they render their own loading state) and `createScreen` now starts from a click, since `getDisplayMedia` requires a user gesture. The same inaccurate `<Loading>` claim is removed from the JSDoc.

## 1.0.0

### Major Changes

- 21acc8a: Initial release of `@solid-primitives/mediastream`, replacing `@solid-primitives/stream` for Solid.js v2.

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/mediastream`
  - `createStream` and `createScreen` now return `[Accessor<MediaStream | undefined>, { stop, mute }]` instead of `[Resource<MediaStream>, ResourceActions & { stop, mute }]`. The `mutate` and `refetch` controls are removed — source reactivity drives re-acquisition automatically.
  - `createAmplitudeStream` second element is now `{ stream, stop }` (no `mutate` / `refetch`).
  - `ResourceActions` type export removed; no longer depends on `createResource`.
  - Loading state: use `<Loading>` from `@solidjs/web` to handle the pending state.
  - Error state: use `<Errored>` from `@solidjs/web` to handle stream acquisition errors.
  - `isServer` imported internally from `@solidjs/web` (not `solid-js/web`).
  - All `createEffect` calls use the Solid 2.0 split compute/apply form.

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- c98cb2d: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [89c5324]
- Updated dependencies [5fc4efa]
- Updated dependencies [4a5bf32]
- Updated dependencies [dd165cd]
- Updated dependencies [7ee755d]
- Updated dependencies [50e36c9]
- Updated dependencies [c98cb2d]
- Updated dependencies [1b703e1]
- Updated dependencies [638c530]
- Updated dependencies [04a170e]
- Updated dependencies [b7ef2f3]
- Updated dependencies [5c23fda]
  - @solid-primitives/utils@7.0.0

## 1.0.0-next.4

### Patch Changes

- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- Updated dependencies [1b703e1]
  - @solid-primitives/utils@7.0.0-next.6

## 1.0.0-next.3

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

## 1.0.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- 21acc8a: Initial release of `@solid-primitives/mediastream`, replacing `@solid-primitives/stream` for Solid.js v2.

  ## Breaking Changes

  **Peer dependency**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  ### `@solid-primitives/mediastream`
  - `createStream` and `createScreen` now return `[Accessor<MediaStream | undefined>, { stop, mute }]` instead of `[Resource<MediaStream>, ResourceActions & { stop, mute }]`. The `mutate` and `refetch` controls are removed — source reactivity drives re-acquisition automatically.
  - `createAmplitudeStream` second element is now `{ stream, stop }` (no `mutate` / `refetch`).
  - `ResourceActions` type export removed; no longer depends on `createResource`.
  - Loading state: use `<Loading>` from `@solidjs/web` to handle the pending state.
  - Error state: use `<Errored>` from `@solidjs/web` to handle stream acquisition errors.
  - `isServer` imported internally from `@solidjs/web` (not `solid-js/web`).
  - All `createEffect` calls use the Solid 2.0 split compute/apply form.

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 0.1.0

### Major Changes

Initial release as `@solid-primitives/mediastream`, replacing `@solid-primitives/stream` with full Solid.js v2 compatibility.

- Migrated from `createResource` to reactive signals + split `createEffect` for async stream acquisition
- `isServer` imported from `@solidjs/web`
- `createStream` / `createScreen`: return type is now `[Accessor<MediaStream | undefined>, { stop, mute }]` — `mutate` and `refetch` removed
- `createAmplitudeStream`: second element simplified to `{ stream, stop }`
- `createAmplitudeFromStream`: split `createEffect` for stream-to-analyser binding
- Loading state handled via `<Loading>` from `@solidjs/web`; error state via `<Errored>`
- Added `getDisplayMedia` mock support in test setup
- Race conditions between concurrent getUserMedia calls handled with `active` flag
