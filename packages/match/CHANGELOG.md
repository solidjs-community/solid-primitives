# @solid-primitives/match

## 0.1.0

### Major Changes

Migrate to Solid.js v2.0 (beta.13)

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

- `JSX` types are now sourced from `@solidjs/web` per Solid 2.0 conventions
- Signal writes are batched by default in Solid 2.0 — call `flush()` after signal writes in tests before reading reactive values
