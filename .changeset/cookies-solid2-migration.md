---
"@solid-primitives/cookies": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

- `isServer` and `getRequestEvent` are now imported from `@solidjs/web` (were `solid-js/web`)
- `createEffect` follows the split compute/apply pattern required by Solid 2.0 — the internal cookie-sync effect now separates reactive tracking from the `document.cookie` write

## New

- Full test suite added: 19 browser tests and 6 SSR tests covering `parseCookie`, `getCookiesString`, `createServerCookie`, and `createUserTheme`
