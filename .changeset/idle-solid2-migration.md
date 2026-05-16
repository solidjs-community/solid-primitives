---
"@solid-primitives/idle": major
---

Migrate to Solid.js v2.0 (beta.10)

- Updated peer dependencies to `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10`
- Changed `isServer` import from `solid-js/web` to `@solidjs/web`
- Replaced `onMount` with `onSettled`
- Removed `batch` calls (Solid 2.0 batches automatically via microtasks)
- Added `INTERNAL_OPTIONS` (`ownedWrite: true`) to signals to prevent owned-scope write warnings
- Used `noop` from `@solid-primitives/utils` for server-side no-op methods
- Fixed default events list: removed duplicate `"wheel"` entry (was listed twice as `"wheel"` and `"mousewheel"`)
