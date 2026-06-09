---
"@solid-primitives/sensors": minor
---

New package. Provides sensor primitives following the Solid Primitives `make*`/`create*` convention (`make*` = raw listener, returns cleanup, no Solid lifecycle; `create*` = reactive accessor or store, integrates with `onCleanup`).

- `makeSensor(SensorClass, onChange, options?)` — generic raw Generic Sensor API listener, returns cleanup
- `createSensor(SensorClass, options?)` — reactive accessor for any Generic Sensor API sensor
- `makeAccelerometer(onChange, options?)` — raw `devicemotion` event listener, returns cleanup
- `createAccelerometer(includeGravity?, interval?)` — reactive accessor backed by `devicemotion` events
- `makeGyroscope(onChange, options?)` — raw `deviceorientation` event listener, returns cleanup
- `createGyroscope(interval?)` — reactive store `{ alpha, beta, gamma }` backed by `deviceorientation` events
- `makeCompass(onChange, options?)` — raw compass/orientation event listener, returns cleanup
- `createCompass(options?)` — reactive store for compass heading/orientation
- `makeBattery(onChange)` — raw Battery Status API listener, returns cleanup
- `createBattery()` — reactive accessor for battery status `{ level, charging, … }`
