---
"@solid-primitives/devices": major
---

Migrate to Solid.js v2.0 (beta.13). `createAccelerometer` and `createGyroscope` have been moved to the new `@solid-primitives/sensors` package.

Breaking changes:
- `solid-js` peer dependency updated to `^2.0.0-beta.13`
- `@solidjs/web` is now a required peer dependency
- `createAccelerometer` removed — use `@solid-primitives/sensors` instead
- `createGyroscope` removed — use `@solid-primitives/sensors` instead
- `createMemo` initialValue arg removed (Solid 2.0 API change)
- `isServer` imported from `@solidjs/web`
- `createStore` imported from `solid-js` (not `solid-js/store`)
