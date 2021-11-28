---
Name: workers
Stage: 1
Package: "@solid-primitives/workers"
Primitives: createWebWorker, createWorkerPool
Category: Browser APIs
---

# @solid-primitives/workers

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/workers?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/workers)
[![size](https://img.shields.io/npm/v/@solid-primitives/workers?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/workers)

A set of utility to support using Web Workers and Shared Workers:

`createWebWorker` - Provides a getter and setter for the primitive.

`createWorkerPool` - Creates a pool of workers and round-robins requests between each.

## How to use it

Create a basic web worker:

```ts
const [worker, start, stop] = createWebWorker(function add(a, b) {
  return a + b;
});
console.log(await worker.add(1, 2));
// output: 3
```

Create a worker pool with a set concurrency:

```ts
const [pool, start, stop] = createWorkerPool(4, function add(a, b) {
  return a + b;
});
console.log(await pool.add(1, 2));
// output: 3
```

## Demo

You may view a working example here: [ link to Stackblize or CodeSandBox ]

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-1 primitive.

</details>

## Inspiration

Inspired by Jason Miller's worker function. Borrows the RPC and function export method.
