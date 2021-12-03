---
Name: countdown
Stage: 3
Package: "@solid-primitives/countdown"
Primitives: createCountdown
Category: Utilities
---

# @solid-primitives/countdown

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/countdown?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/countdown)
[![size](https://img.shields.io/npm/v/@solid-primitives/countdown?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/countdown)

Creates a countdown primitive based on supplied dates and interval.

## How to use it

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

1.0.4

Updated to Stage 3 and published CJS.

</details>
