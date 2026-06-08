---
"@solid-primitives/active-element": major
---

Migrate to Solid.js v2.0 (beta.12)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.12` and `@solidjs/web@^2.0.0-beta.12` are now required.

- `makeFocusListener` and `createFocusSignal` have moved to `@solid-primitives/focus`. Import them from there instead:
  ```ts
  // Before
  import { makeFocusListener, createFocusSignal } from "@solid-primitives/active-element";
  // After
  import { makeFocusListener, createFocusSignal } from "@solid-primitives/focus";
  ```
- `isServer` is now sourced from `@solidjs/web` internally (no user-facing API change)
