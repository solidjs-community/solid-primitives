# @solid-primitives/sensors

## 1.0.0-next.2

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).

## 1.0.0-next.1

### Patch Changes

- 5fc4efa: Fix named imports breaking under Rolldown (Vite 8+ / Storybook 10.4.6+) bundlers.

  These packages re-export their public API via `export * from "./x.js"` barrels. Rollup resolves named imports through these at link time, but Rolldown's static analysis doesn't reliably follow `export *` for named-export resolution, causing errors like:

  ```
  "createEventListener" is not exported by "@solid-primitives/event-listener/dist/index.js"
  ```

  The build now also emits explicit `export { name } from "./x.js"` lines for every runtime export reachable through a barrel's `export *`, derived automatically from each submodule's compiled output — so `dist/` is bundler-agnostic regardless of how a given tool resolves star re-exports.

## 1.0.0-next.0

### Major Changes

- 8b5c942: New package. Provides sensor primitives following the Solid Primitives `make*`/`create*` convention (`make*` = raw listener, returns cleanup, no Solid lifecycle; `create*` = reactive accessor or store, integrates with `onCleanup`).

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

## 0.1.0

### Minor Changes

- Initial release. Extracted `createAccelerometer` and `createGyroscope` from `@solid-primitives/devices` and added proper `make*` / `create*` split following Solid Primitives naming conventions.
