---
"@solid-primitives/upload": minor
---

Migrate to Solid.js 2.0 (beta.7)

- Updated peer dependencies to `solid-js@^2.0.0-beta.7` and `@solidjs/web@^2.0.0-beta.7`
- `isServer` is now imported from `@solidjs/web` (moved out of `solid-js/web`)
- `createDropzone`: replaced `onMount`/`onCleanup` with `onSettled` (returns cleanup function) per Solid 2.0 lifecycle API
- `fileUploader`: replaced the `use:fileUploader` directive (removed in Solid 2.0) with a **ref callback factory** — use `ref={fileUploader(opts)}` instead of `use:fileUploader={opts}`
