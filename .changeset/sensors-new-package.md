---
"@solid-primitives/sensors": minor
---

New package. Provides `makeAccelerometer`, `createAccelerometer`, `makeGyroscope`, and `createGyroscope` following the Solid Primitives `make*`/`create*` convention.

- `makeAccelerometer(onChange, options?)` — raw event listener, returns cleanup, no Solid lifecycle
- `createAccelerometer(includeGravity?, interval?)` — reactive accessor backed by `devicemotion` events
- `makeGyroscope(onChange, options?)` — raw event listener, returns cleanup, no Solid lifecycle
- `createGyroscope(interval?)` — reactive store `{ alpha, beta, gamma }` backed by `deviceorientation` events
