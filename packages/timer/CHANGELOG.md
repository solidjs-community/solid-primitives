# @solid-primitives/timer

## 1.4.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.

## 1.4.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)

## 1.4.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

## 1.3.10

### Patch Changes

- 8dfd42d: Fix createPolled firing twice initially (#632)

## 1.3.9

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 1.3.8

### Patch Changes

- d23dd74: Add type exports for cjs

## 1.3.7

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 1.3.6

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 1.3.5

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 1.3.4

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 1.3.3

### Patch Changes

- 91060c3d: Adds a separate (NOOP) runtime for the server. — Fixes #214

## 1.3.2

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 1.3.1

0.0.100

First commit of the timer primitive.

0.0.107

Patched an issue with clear on clean-up.

1.0.3

Release official version with CJS support.

1.1.0

Updated to Solid 1.3

1.3.0

[PR#106](https://github.com/solidjs-community/solid-primitives/pull/106)

Added [`makeTimer`](#maketimer), [`createTimeoutLoop`](#createtimeoutloop), [`createPolled`](#createpolled), [`createIntervalCounter`](#createintervalcounter), and made the timeout of [`createTimer`](#createtimer) optionally reactive.

1.3.1

[PR#113](https://github.com/solidjs-community/solid-primitives/pull/113)

Make the calc function of `createPolled` reactive
