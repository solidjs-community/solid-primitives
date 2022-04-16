# @solid-primitives/timers

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/timers?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/timers)
[![version](https://img.shields.io/npm/v/@solid-primitives/timers?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/timers)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Timer primitives related to `setInterval` and `setTimeout`:

- `createTimeout` - setTimeout with an optionally reactive delay.
- `createInterval` - setInterval with an optionally reactive delay.
- `createTimeoutLoop` - Like createInterval, except the delay only updates between executions.
- `createPolled` - Polls a function periodically. Returns an to the latest polled value.
- `createIntervalCounter` - Creates a counter which increments periodically.

## Installation

```bash
npm install @solid-primitives/timers
# or
yarn add @solid-primitives/timers
```

## How to use it

### Basic Usage

#### createTimeout

[setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout), but with a fully reactive delay.

```ts
const callback = () => {};
createTimeout(callback, 1000);

// with reactive delay
const [delay, setDelay] = createSignal(1000);
createTimeout(callback, delay);
// ...
setDelay(500);
```

#### createInterval

[setInterval](https://developer.mozilla.org/en-US/docs/Web/API/setInterval), but with a fully reactive delay.

```ts
const callback = () => {};
createInterval(callback, 1000);

// with reactive delay
const callback = () => {};
const [delay, setDelay] = createSignal(1000);
createInterval(callback, delay);
// ...
setDelay(500);
```

#### createTimeoutLoop

Similar to [createInterval](#createinterval), but the delay does not update until the callback is executed.

```ts
const callback = () => {};
createTimeoutLoop(callback, 1000);

// with reactive delay
const callback = () => {};
const [delay, setDelay] = createSignal(1000);
createTimeoutLoop(callback, delay);
// ...
setDelay(500);
```

#### createPolled

[createInterval](#createinterval), but an Accessor containing the callback's last return value is also returned.

```tsx
const date = createPolled(() => new Date(), 1000);
// ...
<span>The time is: {date()}</span>;

// with reactive delay
const [delay, setDelay] = createSignal(1000);
createPolled(() => new Date(), delay);
// ...
setDelay(500);
```

#### createIntervalCounter

A counter which increments periodically based on the delay. Uses [createPolled](#createpolled).

```tsx
const count = createIntervalCounter(1000);
// ...
<span>The time is: {date()}</span>;

// with reactive delay
const [delay, setDelay] = createSignal(1000);
createIntervalCounter(delay);
// ...
setDelay(500);
```

### Note on Reactive Delays

When a delay is changed, the fraction of the existing delay already elapsed be carried forward to the new delay. For instance, a delay of 1000ms changed to 2000ms after 250ms will be considered 1/4 done, and next callback will be executed after 250ms + 1500ms. Afterwards, the new delay will be used.

## Demo

You can use this template for publishing your demo on CodeSandbox: https://codesandbox.io/s/solid-primitives-demo-template-sz95h

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
