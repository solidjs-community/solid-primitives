---
Name: analytics
Stage: 0
Package: "@solid-primitives/analytics"
Primitives: createAnalytics
Category: Utilities
---

# @solid-primitives/analytics

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Creates a primitive for analytics management.

## How to use it

```ts
const [running, start, stop] = createAnalytics(() => console.log('hi')));
start();
```

## Demo

You may view a working example here: https://codesandbox.io/s/solid-create-analytics?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

</details>
