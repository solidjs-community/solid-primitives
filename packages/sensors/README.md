<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Sensors" alt="Solid Primitives Sensors">
</p>

# @solid-primitives/sensors

[![size](https://img.shields.io/badge/size-1.2_kB-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/sensors)
[![size](https://img.shields.io/npm/v/@solid-primitives/sensors?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/sensors)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Reactive primitives for device motion, orientation, and hardware sensors using standard browser APIs.

## Installation

```bash
npm install @solid-primitives/sensors
# or
pnpm add @solid-primitives/sensors
```

## Accelerometer

Uses the [`DeviceMotionEvent`](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent) API.

### `makeAccelerometer`

Attaches a `devicemotion` event listener and calls `onChange` with the latest acceleration reading, throttled to at most once per `interval` milliseconds.

```ts
import { makeAccelerometer } from "@solid-primitives/sensors";

const cleanup = makeAccelerometer(
  acceleration => {
    console.log(acceleration?.x, acceleration?.y, acceleration?.z);
  },
  { includeGravity: false, interval: 100 },
);

// Later, stop listening:
cleanup();
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeGravity` | `boolean` | `false` | When `true`, uses `accelerationIncludingGravity` instead of `acceleration` |
| `interval` | `number` | `100` | Minimum milliseconds between `onChange` calls |

**Returns:** `VoidFunction` — call to remove the event listener.

### `createAccelerometer`

Reactive wrapper around `makeAccelerometer`. Returns a signal accessor that starts as `undefined` and updates to the latest `DeviceMotionEventAcceleration` reading on each throttled event.

```ts
import { createAccelerometer } from "@solid-primitives/sensors";

function MyComponent() {
  const acceleration = createAccelerometer();
  // acceleration() is AccelerometerReading | undefined

  return (
    <div>
      X: {acceleration()?.x ?? 0}, Y: {acceleration()?.y ?? 0}, Z: {acceleration()?.z ?? 0}
    </div>
  );
}
```

**Signature:**

```ts
function createAccelerometer(
  includeGravity?: boolean,  // default: false
  interval?: number,         // default: 100ms
): Accessor<AccelerometerReading | undefined>;

type AccelerometerReading = DeviceMotionEventAcceleration | null;
```

**SSR:** Returns `() => ({ x: 0, y: 0, z: 0 })` on the server — no event listeners are attached.

## Gyroscope

Uses the [`DeviceOrientationEvent`](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent) API.

### `makeGyroscope`

Attaches a `deviceorientation` event listener and calls `onChange` with the latest orientation reading, throttled to at most once per `interval` milliseconds. `null` orientation values (common on some platforms) are coerced to `0`.

```ts
import { makeGyroscope } from "@solid-primitives/sensors";

const cleanup = makeGyroscope(
  orientation => {
    console.log(orientation.alpha, orientation.beta, orientation.gamma);
  },
  { interval: 100 },
);

// Later, stop listening:
cleanup();
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `interval` | `number` | `100` | Minimum milliseconds between `onChange` calls |

**Returns:** `VoidFunction` — call to remove the event listener.

### `createGyroscope`

Reactive wrapper around `makeGyroscope`. Returns an object with reactive `alpha`, `beta`, and `gamma` getters that start at `0` and update on each throttled orientation event.

```ts
import { createGyroscope } from "@solid-primitives/sensors";

function MyComponent() {
  const orientation = createGyroscope();

  return (
    <div>
      α: {orientation.alpha}°, β: {orientation.beta}°, γ: {orientation.gamma}°
    </div>
  );
}
```

**Signature:**

```ts
function createGyroscope(
  interval?: number, // default: 100ms
): GyroscopeReading;

type GyroscopeReading = { alpha: number; beta: number; gamma: number };
```

**SSR:** Returns `{ alpha: 0, beta: 0, gamma: 0 }` — a plain non-reactive object.

## Generic Sensor API

A factory pair for any [Generic Sensor API](https://developer.mozilla.org/en-US/docs/Web/API/Sensor_APIs) sensor (Chromium-based browsers). Covers `LinearAccelerationSensor`, `GravitySensor`, `AbsoluteOrientationSensor`, `RelativeOrientationSensor`, and others.

### `makeSensor`

Sets up any Generic Sensor API sensor and calls `onChange` with the live sensor object on each reading. Returns `null` if the sensor constructor throws (API unsupported or permission denied).

```ts
import { makeSensor } from "@solid-primitives/sensors";

const cleanup = makeSensor(
  LinearAccelerationSensor,
  sensor => console.log(sensor.x, sensor.y, sensor.z),
  { frequency: 60 },
);

if (cleanup) {
  // Later, stop:
  cleanup();
}
```

**Signature:**

```ts
function makeSensor<T extends GenericSensor>(
  SensorClass: { new(options?: any): T },
  onChange: (sensor: T) => void,
  options?: SensorOptions,
): VoidFunction | null;

type SensorOptions = { frequency?: number };
```

**Returns:** `VoidFunction` (cleanup) or `null` if unsupported.

### `createSensor`

Reactive wrapper around `makeSensor`. Returns an accessor that updates on **every reading event** — even if the sensor object reference is the same — because the underlying signal uses `equals: false`. Returns `undefined` until the first reading or if the sensor is unavailable.

```ts
import { createSensor } from "@solid-primitives/sensors";

function MyComponent() {
  const sensor = createSensor(LinearAccelerationSensor, { frequency: 60 });

  return (
    <Show when={sensor()}>
      {s => <div>X: {s().x ?? 0}</div>}
    </Show>
  );
}
```

**Signature:**

```ts
function createSensor<T extends GenericSensor>(
  SensorClass: { new(options?: any): T },
  options?: SensorOptions,
): Accessor<T | undefined>;
```

**SSR:** Returns `() => undefined`.

## Compass

Uses `window.Magnetometer` from the [Generic Sensor API](https://developer.mozilla.org/en-US/docs/Web/API/Magnetometer). Chromium-based browsers only. Reports raw magnetic field strength in microteslas (µT) as `{ x, y, z }` components.

### `makeCompass`

```ts
import { makeCompass } from "@solid-primitives/sensors";

const cleanup = makeCompass(
  ({ x, y, z }) => console.log(`Field: ${x}µT, ${y}µT, ${z}µT`),
  { frequency: 10, referenceFrame: "device" },
);

if (cleanup) cleanup();
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `frequency` | `number` | — | Readings per second |
| `referenceFrame` | `"device" \| "screen"` | `"device"` | Coordinate reference frame |

**Returns:** `VoidFunction` or `null` if `window.Magnetometer` is unavailable.

### `createCompass`

Returns an object with reactive `x`, `y`, `z` getters (in µT), all starting at `0`.

```ts
import { createCompass } from "@solid-primitives/sensors";

function Compass() {
  const mag = createCompass({ frequency: 10 });
  const heading = () => Math.atan2(mag.y, mag.x) * (180 / Math.PI);
  return <div>Heading: {heading()}°</div>;
}
```

**Signature:**

```ts
function createCompass(options?: CompassOptions): CompassReading;

type CompassOptions = { frequency?: number; referenceFrame?: "device" | "screen" };
type CompassReading = { x: number; y: number; z: number };
```

**SSR:** Returns `{ x: 0, y: 0, z: 0 }` — a plain non-reactive object.

## Battery

Uses the [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API) (`navigator.getBattery()`). Supported in Chrome/Edge; not available in Firefox or Safari.

### `makeBattery`

Subscribes to the Battery API and calls `onChange` immediately with the current reading, then again on every battery change event. Returns a synchronous cleanup function — safe to use with `onCleanup` even though the API initializes asynchronously.

```ts
import { makeBattery } from "@solid-primitives/sensors";

const cleanup = makeBattery(({ level, charging }) => {
  console.log(`${Math.round(level * 100)}% ${charging ? "charging" : "discharging"}`);
});

// Later:
cleanup();
```

**Signature:**

```ts
function makeBattery(onChange: (reading: BatteryReading) => void): VoidFunction;

type BatteryReading = {
  charging: boolean;
  chargingTime: number;    // seconds until full; Infinity if not charging
  dischargingTime: number; // seconds until empty; Infinity if charging
  level: number;           // 0.0–1.0
};
```

**Returns:** `VoidFunction` — always (no-ops if the API is unavailable).

### `createBattery`

Returns a reactive accessor for battery status. Starts as `undefined` until the Battery API resolves. Subscribe to any of the four properties to track specific changes.

```ts
import { createBattery } from "@solid-primitives/sensors";

function BatteryIndicator() {
  const battery = createBattery();

  return (
    <Show when={battery()} fallback={<span>Loading battery…</span>}>
      {b => (
        <span>
          {Math.round(b().level * 100)}%{b().charging ? " ⚡" : ""}
        </span>
      )}
    </Show>
  );
}
```

**Signature:**

```ts
function createBattery(): Accessor<BatteryReading | undefined>;
```

**SSR:** Returns `() => ({ charging: false, chargingTime: 0, dischargingTime: 0, level: 1 })`.

## Throttling

Both `makeAccelerometer` and `makeGyroscope` throttle events using a **leading-edge** strategy: the first event in a burst fires `onChange` immediately; subsequent events within `interval` ms are dropped. The next event after the interval elapses fires again.

Set `interval: 0` to disable throttling (useful in tests).

Generic Sensor API primitives (`makeSensor`, `makeCompass`) use the sensor's built-in `frequency` option for rate control — no additional throttling is applied.

## Types

```ts
type AccelerometerReading = DeviceMotionEventAcceleration | null;
type GyroscopeReading = { alpha: number; beta: number; gamma: number };
type SensorOptions = { frequency?: number };
type CompassOptions = { frequency?: number; referenceFrame?: "device" | "screen" };
type CompassReading = { x: number; y: number; z: number };
type BatteryReading = {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
