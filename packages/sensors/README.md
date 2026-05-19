<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Sensors" alt="Solid Primitives Sensors">
</p>

# @solid-primitives/sensors

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/sensors?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/sensors)
[![size](https://img.shields.io/npm/v/@solid-primitives/sensors?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/sensors)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitives for reading device motion and orientation sensors — accelerometer and gyroscope — using the browser's [`DeviceMotionEvent`](https://developer.mozilla.org/en-US/docs/Web/API/DeviceMotionEvent) and [`DeviceOrientationEvent`](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent) APIs.

## Installation

```
npm install @solid-primitives/sensors
# or
pnpm add @solid-primitives/sensors
```

## Accelerometer

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

Reactive wrapper around `makeAccelerometer`. Returns a signal accessor that starts as `undefined` and updates to the latest `DeviceMotionEventAcceleration` reading on each throttled event. Registers cleanup with `onCleanup` when called inside a reactive owner.

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

Reactive wrapper around `makeGyroscope`. Returns an object with reactive `alpha`, `beta`, and `gamma` getters that start at `0` and update on each throttled orientation event. Registers cleanup with `onCleanup` when called inside a reactive owner.

```ts
import { createGyroscope } from "@solid-primitives/sensors";

function MyComponent() {
  const orientation = createGyroscope();
  // orientation.alpha / .beta / .gamma are reactive getters

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

**SSR:** Returns `{ alpha: 0, beta: 0, gamma: 0 }` on the server — a plain non-reactive object with no event listeners attached.

## Throttling

Both `make*` primitives throttle events using a leading-edge strategy: the first event in a burst fires `onChange` immediately, then subsequent events within `interval` milliseconds are dropped. After the interval elapses, the next event fires again.

Set `interval: 0` to disable throttling entirely (useful in tests).

## Types

```ts
type AccelerometerReading = DeviceMotionEventAcceleration | null;

type GyroscopeReading = {
  alpha: number;
  beta: number;
  gamma: number;
};
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
