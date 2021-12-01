---
Name: timer
Stage: 3
Package: "@solid-primitives/timer"
Primitives: createTimer
---

# @solid-primitives/timer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/timer?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/timer)
[![size](https://img.shields.io/npm/v/@solid-primitives/timer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/timer)

A timer wrapper to handle setTimeout and setInterval.

`createTimer` - A single timer that can handle timeouts and intervals.

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

1.0.2

Release official version with CJS support.

</details>
