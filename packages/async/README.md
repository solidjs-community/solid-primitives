<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=async" alt="Solid Primitives async">
</p>

# @solid-primitives/async

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/async?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/async)
[![version](https://img.shields.io/npm/v/@solid-primitives/async?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/async)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A collection of primitves for handling of asynchronous memos, optimistic signals, stores and actions:

- [`makeStreamable`](#makeStreamable) - wraps a fetch request to support web streams in memos or optimistic signals
- [`makeAbortable`](#makeabortable) - sets up an AbortSignal with auto-abort on re-fetch or timeout
- [`createAbortable`](#createabortable) - like `makeAbortable`, but with automatic abort on cleanup
- [`makeCache`](#makecache) - wraps the fetcher to cache the responses for a certain amount of time
- [`makeRetrying`](#makeretrying) - wraps the fetcher to retry requests after a delay

## Installation

```bash
npm install @solid-primitives/async
# or
yarn add @solid-primitives/async
# or
pnpm add @solid-primitives/async
```

## How to use it

```ts
// TODO
```

## Demo

You can use this template for publishing your demo on CodeSandbox: https://codesandbox.io/s/solid-primitives-demo-template-sz95h

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
