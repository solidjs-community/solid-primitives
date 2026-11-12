<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=vibrate" alt="Solid Primitives vibrate">
</p>

# @solid-primitives/vibrate

[![size](https://img.shields.io/badge/size-831_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/vibrate)
[![version](https://img.shields.io/npm/v/@solid-primitives/vibrate?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/vibrate)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Primitives for triggering and managing device haptic feedback via the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API).

- [`isVibrationSupported`](#isvibrationSupported) — Check if the Vibration API is available.
- [`makeVibrate`](#makevibrate) — Non-reactive helper; returns `[start, stop]` with no Solid lifecycle dependency.
- [`createVibrate`](#createvibrate) — Reactive primitive; returns `{ vibrating, start, stop, supported }` with automatic cleanup and reactive pattern support.
- [`frequencyToPattern`](#frequencytopattern) — Convert a frequency in Hz to a `[onMs, offMs]` pattern.
- [`makePulse`](#makepulse) — Non-reactive pulse helper; vibrates continuously at a given frequency.
- [`createPulse`](#createpulse) — Reactive pulse primitive; supports reactive `hz` that restarts on change.

## Installation

```bash
npm install @solid-primitives/vibrate
# or
yarn add @solid-primitives/vibrate
# or
pnpm add @solid-primitives/vibrate
```

## `isVibrationSupported`

Returns `true` when the [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API) is available. Useful for conditionally rendering haptic UI or showing fallback content.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { isVibrationSupported } from "@solid-primitives/vibrate";

function Demo() {
  const [checked, setChecked] = createSignal<boolean>();
  return (
    <>
      <button onClick={() => setChecked(isVibrationSupported())}>Check support</button>
      <p>
        {checked() === undefined
          ? "Not checked yet"
          : checked()
            ? "Vibration API available"
            : "Vibration API not available"}
      </p>
      <p>
        "Available" only means navigator.vibrate exists — it may still be blocked (e.g. in this
        iframe).
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { isVibrationSupported } from "@solid-primitives/vibrate";

if (isVibrationSupported()) {
  console.log("haptics available");
}
```

## `makeVibrate`

A non-reactive building block. Wraps `navigator.vibrate` with an optional repeating interval and returns `[start, stop]`. No Solid lifecycle dependency — both functions are no-ops when the API is unavailable.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { isVibrationSupported, makeVibrate } from "@solid-primitives/vibrate";

function Demo() {
  const [active, setActive] = createSignal(false);
  const [start, stop] = makeVibrate([100, 50, 100, 50, 300], { interval: 1000 });
  const toggle = () => {
    if (active()) stop();
    else start();
    setActive(a => !a);
  };
  return (
    <>
      <button onClick={toggle}>{active() ? "Stop" : "Start"} repeating vibration</button>
      <p>{active() ? "Active" : "Stopped"}</p>
      <p>
        {isVibrationSupported()
          ? "No buzz? Vibration may be blocked in this iframe — try on an Android device."
          : "Vibration API not available — start/stop are no-ops."}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { makeVibrate } from "@solid-primitives/vibrate";

// Single-shot vibration
const [start, stop] = makeVibrate([200, 100, 200]);
button.addEventListener("click", start);

// Repeating vibration every 2 seconds
const [start, stop] = makeVibrate(100, { interval: 2000 });
start();
// later:
stop();
```

## `createVibrate`

A reactive primitive tied to the current reactive owner. Returns `{ vibrating, start, stop, supported }`. Cleans up automatically on owner disposal.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createVibrate } from "@solid-primitives/vibrate";

function Demo() {
  const [pattern, setPattern] = createSignal<number | number[]>([200, 100, 200]);
  const { vibrating, start, stop, supported } = createVibrate(pattern, { interval: 1000 });
  return (
    <>
      <button onClick={() => (vibrating() ? stop() : start())}>
        {vibrating() ? "Stop" : "Start"}
      </button>
      <button onClick={() => setPattern([50, 30, 50, 30, 50])}>Short taps</button>
      <button onClick={() => setPattern(400)}>Long buzz</button>
      <p>pattern: {JSON.stringify(pattern())}</p>
      <p>{vibrating() ? "Vibrating" : "Idle"}</p>
      <p>
        {supported
          ? "No buzz? Vibration may be blocked in this iframe — try on an Android device."
          : "Vibration API not available — controls are no-ops."}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

When `pattern` is a reactive accessor and changes **while vibrating**, vibration restarts with the new pattern automatically.

```ts
import { createVibrate } from "@solid-primitives/vibrate";
import { createEffect } from "solid-js";

const { vibrating, start, stop, supported } = createVibrate([200, 100, 200]);

createEffect(() => {
  console.log("vibrating:", vibrating());
});
```

### Reactive pattern

```ts
import { createVibrate } from "@solid-primitives/vibrate";
import { createSignal } from "solid-js";

const [pattern, setPattern] = createSignal<number | number[]>(200);
const { vibrating, start, stop } = createVibrate(pattern);

start();

// Changing pattern while vibrating restarts automatically
setPattern([100, 30, 100, 30, 100]);
```

### With interval

```ts
const { vibrating, start, stop } = createVibrate(200, { interval: 1000 });
start(); // repeats every second
stop(); // cancels interval + active vibration
```

## `frequencyToPattern`

Converts a frequency in Hz and an optional duty cycle into a single-cycle `[onMs, offMs]` vibration pattern. Useful for previewing what `makePulse` / `createPulse` will produce.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { frequencyToPattern } from "@solid-primitives/vibrate";

function Demo() {
  const [hz, setHz] = createSignal(2);
  const [duty, setDuty] = createSignal(0.5);
  return (
    <>
      <label>
        {hz()} Hz
        <input
          type="range"
          min="0.5"
          max="20"
          step="0.5"
          value={hz()}
          onInput={e => setHz(+e.currentTarget.value)}
        />
      </label>
      <label>
        duty {duty()}
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.1"
          value={duty()}
          onInput={e => setDuty(+e.currentTarget.value)}
        />
      </label>
      <p>[on, off] = {JSON.stringify(frequencyToPattern(hz(), duty()))} ms</p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { frequencyToPattern } from "@solid-primitives/vibrate";

frequencyToPattern(2); // [250, 250] — 2 Hz, equal on/off
frequencyToPattern(4, 0.25); // ~[63, 188] — 4 Hz, short tap
```

## `makePulse`

Non-reactive pulse helper. Vibrates continuously at `hz` cycles per second. No Solid lifecycle dependency; both functions are no-ops when the API is unavailable.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { isVibrationSupported, makePulse } from "@solid-primitives/vibrate";

function Demo() {
  const [held, setHeld] = createSignal(false);
  const [start, stop] = makePulse(4); // 4 taps per second
  // Note: a touch pointerdown isn't user activation, so the very first hold may not buzz.
  const press = () => {
    start();
    setHeld(true);
  };
  const release = () => {
    stop();
    setHeld(false);
  };
  return (
    <>
      <button onPointerDown={press} onPointerUp={release} onPointerLeave={release}>
        Hold to pulse at 4 Hz
      </button>
      <p>{held() ? "Pulsing" : "Idle"}</p>
      <p>
        {isVibrationSupported()
          ? "No buzz? Vibration may be blocked in this iframe — try on an Android device."
          : "Vibration API not available — start/stop are no-ops."}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { makePulse } from "@solid-primitives/vibrate";

const [start, stop] = makePulse(4); // 4 taps per second
button.addEventListener("pointerdown", start);
button.addEventListener("pointerup", stop);
```

## `createPulse`

Reactive pulse primitive tied to the current reactive owner. Returns `{ pulsing, start, stop, supported }`. Accepts a reactive `hz` accessor — changing the frequency while pulsing restarts the vibration immediately at the new rhythm.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createPulse } from "@solid-primitives/vibrate";

function Demo() {
  const [hz, setHz] = createSignal(2);
  const { pulsing, start, stop, supported } = createPulse(hz);
  return (
    <>
      <button onClick={() => (pulsing() ? stop() : start())}>{pulsing() ? "Stop" : "Pulse"}</button>
      <label>
        {hz()} Hz
        <input
          type="range"
          min="0.5"
          max="20"
          step="0.5"
          value={hz()}
          onInput={e => setHz(+e.currentTarget.value)}
        />
      </label>
      <p>{pulsing() ? "Pulsing — drag the slider to change the rhythm" : "Idle"}</p>
      <p>
        {supported
          ? "No buzz? Vibration may be blocked in this iframe — try on an Android device."
          : "Vibration API not available — controls are no-ops."}
      </p>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

```ts
import { createPulse } from "@solid-primitives/vibrate";
import { createSignal, createMemo } from "solid-js";

// Fixed frequency
const { pulsing, start, stop } = createPulse(2);

// Reactive frequency — escalates as a countdown nears zero
const [seconds, setSeconds] = createSignal(10);
const hz = createMemo(() => 1 + (10 - seconds()) * 0.5);
const { start, stop } = createPulse(hz);
```

## Types

```ts
export type VibratePattern = number | number[];

export interface VibrateOptions {
  /** Milliseconds between pattern repetitions. Omit to vibrate once per call. */
  interval?: number;
}

export interface PulseOptions {
  /**
   * Fraction of each cycle spent vibrating (0–1). Defaults to `0.5`.
   * A higher value produces longer buzzes; a lower value produces shorter taps.
   */
  dutyCycle?: number;
}
```

## Browser Support

The Vibration API is supported on Chrome/Firefox for Android. It is **not** supported on iOS or most desktop browsers. Always check `isVibrationSupported()` or rely on `supported` from `createVibrate` before enabling haptic features in your UI.

> Note: vibration requires a prior user interaction (sticky activation) and may be suppressed by silent/DND mode.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
