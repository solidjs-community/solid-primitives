---
"@solid-primitives/input-mask": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` is now required.

- The `solid-js/web` sub-path no longer exists in Solid 2.0; consumers using `render` must import it from `@solidjs/web`

## Fixes

- Corrected `maskArrayToFn` export name in README examples (was incorrectly documented as `arrayMaskToFn`)
- Fixed optional-letter mask character documentation: `o` (was incorrectly documented as `z`)
