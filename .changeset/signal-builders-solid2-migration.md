---
"@solid-primitives/signal-builders": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.13` is now required.

- The `on` helper from `solid-js` (used internally by `capitalize`) is removed in Solid 2.0; `capitalize` now uses a plain `createMemo` which is equivalent
- `get` and `merge` now correctly return reactive `Accessor<T>` values via `createMemo` — previously they returned plain (non-reactive) values despite their type signatures claiming otherwise; any code that was working around this bug by calling the result as a plain value will break
