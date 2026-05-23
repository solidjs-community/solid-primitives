# @solid-primitives/mediastream

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
