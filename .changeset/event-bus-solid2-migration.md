---
"@solid-primitives/event-bus": major
---

Migrate to Solid.js v2.0 (beta.10)

## Breaking Changes

**Peer dependency**: `solid-js@^2.0.0-beta.10` is now required.

### `batchEmits`

In Solid 2.0, all signal writes are automatically batched via microtasks. `batchEmits` is now a no-op that returns the bus unchanged. The `batch` wrapper has been removed.

### `toEffect`

Updated to use the Solid 2.0 split `createEffect(compute, apply)` signature. The `on()` helper (removed in Solid 2.0) has been replaced with the split effect pattern. The reactive owner is now explicitly captured at creation time and forwarded via `runWithOwner` in the apply phase, since the apply phase is unowned in Solid 2.0.

### `createEventStack`

The internal stack signal is created with `{ ownedWrite: true }` to allow writes from event listeners called within reactive contexts (e.g. `createRoot`, effects). Signal reads are now deferred in Solid 2.0, so the stack value emitted in event payloads is now computed inside the setter callback to ensure it reflects the updated state.

### Tests

Tests that read signal values after `emit()` now require `flush()` to commit pending signal updates before assertions.
