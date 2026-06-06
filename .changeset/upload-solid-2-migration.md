---
"@solid-primitives/upload": minor
---

Migrate to Solid.js 2.0 (beta.14)

- Updated peer dependencies to `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14`
- `isServer` is now imported from `@solidjs/web` (moved out of `solid-js/web`)
- `createDropzone`: now returns a `setRef` ref callback; event listeners are attached when the ref is assigned and cleaned up via `onCleanup` registered through `runWithOwner` back into the reactive owner scope
- `fileUploader`: replaced the `use:fileUploader` directive (removed in Solid 2.0) with a **ref callback factory** — use `ref={fileUploader(opts)}` instead of `use:fileUploader={opts}`
