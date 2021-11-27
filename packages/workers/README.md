---
Name: workers
Stage: 1
Package: "@solid-primitives/workers"
Primitives: createWebWorker,createWorkerPool
Category: Browser APIs
---

# @solid-primitives/workers

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/workers?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/template-primitive)
[![size](https://img.shields.io/npm/v/@solid-primitives/workers?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/template-primitive)

A set of utility to support using Web Workers and Shared Workers:

`createWebWorker` - Provides a getter and setter for the primitive.
`createWorkerPool` - Creates a pool of workers and round-robins requests between each.

## How to use it

Create a basic web worker:

```ts
const [worker, start, stop] = createWebWorker(function add(a, b) {
  return a + b;
});
worker.add();
```

Create a worker pool with a set concurrency:

```ts
const [pool, start, stop] = createWebWorker(4, function add(a, b) {
  return a + b;
});
pool.add();
```

## Demo

You may view a working example here: [ link to Stackblize or CodeSandBox ]

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

</details>
