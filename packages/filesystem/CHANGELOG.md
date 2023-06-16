# @solid-primitives/filesystem

## 1.2.0

### Minor Changes

- 15a45a50: filesystem: support for webkitEntries

## 1.1.0

### Minor Changes

- 3525d165: filesystem: rsync utility

## 1.0.0

### Major Changes

- 51b5bec5: improve fail case (return null instead of mock)

## 0.0.101

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
