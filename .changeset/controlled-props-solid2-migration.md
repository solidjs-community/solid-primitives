---
"@solid-primitives/controlled-props": major
---

Migrate to Solid.js v2.0 (beta.14)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

**Signal writes are now batched**: In Solid 2.0 all signal writes are batched by default. When calling a setter returned by `createControlledProp` or `createControlledProps`, the updated value is not visible synchronously — call `flush()` from `solid-js` before reading it in tests or imperative code.

**`ownedWrite` on internal signal**: The signal created by `createControlledProp` now uses `{ ownedWrite: true }` so setters can safely be called from within reactive scopes (component bodies, effects). This matches Solid 2.0's requirement that signals written inside an owned scope opt in explicitly.

## New Features

**`RangeProp` component**: A new exported component that renders a range slider (`<input type="range">`). Use it standalone or via `createControlledProp` with `type: "range"`.

**`step` option**: `createControlledProp` now accepts `step` in `TestPropOptions` and forwards it to `NumberProp` and `RangeProp`, enabling discrete value increments.
