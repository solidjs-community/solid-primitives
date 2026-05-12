---
"@solid-primitives/jsx-tokenizer": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.10` and `@solidjs/web@^2.0.0-beta.10` are now required.

### API changes

- `isServer` is now imported from `@solidjs/web` (not `solid-js/web`)
- `JSX` types are now imported from `@solidjs/web`
- `ResolvedJSXElement` type renamed to `ResolvedElement` (from `solid-js`) in `resolveTokens` overloads
- `renderToString` in SSR tests moved to `@solidjs/web`

### Usage changes

- `createEffect` now requires the split compute/apply form — update any `createEffect` calls in consuming code
- Context is now its own provider: `<MyContext value={...}>` replaces `<MyContext.Provider value={...}>`
- `classList` is replaced by the `class` object/array form

### Vitest config

- Added `moduleName: "@solidjs/web"` to the shared vitest config `solid` option so JSX transforms target `@solidjs/web` instead of the removed `solid-js/web` subpath. This affects all packages with `.tsx` test files.
