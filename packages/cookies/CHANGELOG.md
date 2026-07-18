# @solid-primitives/cookies

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 1.0.0-next.0

### Major Changes

- 2ca051c: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  - `isServer` and `getRequestEvent` are now imported from `@solidjs/web` (were `solid-js/web`)
  - `createEffect` follows the split compute/apply pattern required by Solid 2.0 — the internal cookie-sync effect now separates reactive tracking from the `document.cookie` write

  ## New
  - Full test suite added: 19 browser tests and 6 SSR tests covering `parseCookie`, `getCookiesString`, `createServerCookie`, and `createUserTheme`

## 0.0.3

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 0.0.2

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)
