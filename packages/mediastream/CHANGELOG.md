# @solid-primitives/mediastream

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
