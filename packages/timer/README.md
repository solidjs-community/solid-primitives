# @solid-primitives/timer

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

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

</details>
