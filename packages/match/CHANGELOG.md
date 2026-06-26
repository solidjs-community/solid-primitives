# @solid-primitives/match

## 1.0.0-next.0

### Major Changes

- 9a698ea: Migrate to Solid.js v2.0 (beta.14)

  ## Breaking Changes

  **Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

  - `JSX` types are now sourced from `@solidjs/web` per Solid 2.0 conventions

## 0.1.0

### Major Changes

Migrate to Solid.js v2.0 (beta.13)

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

- `JSX` types are now sourced from `@solidjs/web` per Solid 2.0 conventions
- Signal writes are batched by default in Solid 2.0 — call `flush()` after signal writes in tests before reading reactive values
