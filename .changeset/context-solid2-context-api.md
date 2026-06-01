---
"@solid-primitives/context": minor
---

Update context provider helpers for Solid 2 context semantics.

- `createContextProvider` now returns `Exclude<T, undefined>` from its `useContext` helper, matching Solid 2's throwing behavior for missing or undefined context values.
- Added `createOptionalContextProvider`, which uses an internal empty Symbol fallback and returns `undefined` when the context is missing or when the provider value is `undefined`.
- `createOptionalContextProvider` accepts an optional fallback value for missing providers.
