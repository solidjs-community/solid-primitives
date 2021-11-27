---
Name: workers
Stage: 0
Package: "@solid-primitives/workers"
Primitives: createWebWorker
Category: Browser APIs
---

# @solid-primitives/workers

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/workers?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/template-primitive)
[![size](https://img.shields.io/npm/v/@solid-primitives/workers?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/template-primitive)

A set of utility to support using Web Workers and Shared Workers:

`createWebWorker` - Provides a getter and setter for the primitive.

## How to use it

```ts
const [worker] = createWebWorker(`export function add(a, b) { return a + b; }`);
worker.add();
```

## Demo

You may view a working example here: [ link to Stackblize or CodeSandBox ]

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
