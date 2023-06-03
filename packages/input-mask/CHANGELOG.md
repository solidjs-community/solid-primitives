# @solid-primitives/input-mask

## 0.2.0

### Minor Changes

- 281006e4: added mask-pattern primitive

## 0.1.7

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.

## 0.1.6

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)

## 0.1.5

### Patch Changes

- dd2d7d1c: Improve export conditions.

## 0.1.4

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)

## 0.1.3

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5

## Changelog up to version 0.1.2

0.0.100

Initial release as a Stage-0 primitive.

0.0.101

Document onPaste event.

0.1.1

Expose string replacements.

Optional generic to type events.

0.1.2

New regexMaskToFn helper.
