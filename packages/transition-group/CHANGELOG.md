# @solid-primitives/transition-group

## 1.0.3

### Patch Changes

- a6e6cf9f: Correct order of callbacks in parallel switch transition.

## 1.0.2

### Patch Changes

- ef0c0a0e: fix homepage url in package.json

## 1.0.1

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 1.0.0

### Major Changes

- 1ba2f037: Initial release. Adds `createSwitchTransition` and `createListTransition` primitives.

### Patch Changes

- ba06b334: Remove effects - change the rendered array and call transitions in a pure computation.
- 2b4fb9be: Improve `appear` SSR - always render the initial items.

## 0.0.1-beta.2

### Patch Changes

- Remove effects - change the rendered array and call transitions in a pure computation.

## 0.0.1-beta.1

### Patch Changes

- 2b4fb9be: Improve `appear` SSR - always render the initial items.

## 0.0.1-beta.0

### Major Changes

- Initial release. Adds `createSwitchTransition` and `createListTransition` primitives.
