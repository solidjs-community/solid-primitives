---
"@solid-primitives/mediastream": major
---

Initial release of `@solid-primitives/mediastream`, replacing `@solid-primitives/stream` for Solid.js v2.

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
