# @solid-primitives/countdown

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/countdown?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/countdown)
[![size](https://img.shields.io/npm/v/@solid-primitives/countdown?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/countdown)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fstage-badges%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Creates a countdown primitive based on supplied dates and interval.

## Installation

```
npm install @solid-primitives/countdown
# or
yarn add @solid-primitives/countdown
```

## How to use it

Create a countdown based on a Javascript Date. Provides broken down time remaining.

```ts
const { days, hours, minutes, seconds, milliseconds } = createCountdown(
  new Date("January 1, 2025 00:00:00")
);
```

## Demo

You may view a working example here: https://codesandbox.io/s/create-countdown-s5f6n?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

First commit of the countdown primitive.

1.0.9

Updated to Stage 3 and published CJS.

</details>
