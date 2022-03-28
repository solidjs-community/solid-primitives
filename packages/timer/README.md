# @solid-primitives/timer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/timer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/timer)
[![size](https://img.shields.io/npm/v/@solid-primitives/timer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/timer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A timer wrapper to handle setTimeout and setInterval.

## Installation

```
npm install @solid-primitives/timer
# or
yarn add @solid-primitives/timer
```

## How to use it

```ts
let [count, setCount] = createSignal(0);
createTimer(() => setCount(count() + 1), 500, Schedule.Interval);
<h1>Counting up: {count()}</h1>;
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-primitives-timer-6n7dt?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First commit of the timer primitive.

0.0.107

Patched an issue with clear on clean-up.

1.0.3

Release official version with CJS support.

1.1.0

Updated to Solid 1.3

</details>
