---
"@solid-primitives/autofocus": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

- `autofocus` is now a **ref callback factory** (`use:autofocus` directive removed; Solid 2.0 no longer supports `use:` directives):
  ```tsx
  // Before
  <button use:autofocus autofocus>...</button>
  // After
  <button ref={autofocus()} autofocus>...</button>

  // Before
  <button use:autofocus={false} autofocus>...</button>
  // After
  <button ref={autofocus(false)} autofocus>...</button>
  ```
- `JSX` type is now imported from `@solidjs/web` (was `solid-js`)
- `onMount` replaced by `onSettled` from `solid-js`
- `createAutofocus` uses split `createEffect(compute, apply)` form with proper timeout cleanup on re-focus
