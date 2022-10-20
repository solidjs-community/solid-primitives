# @solid-primitives/rootless

## 1.2.0

### Minor Changes

- e36ed229: Rename `createBranch` to `createSubRoot`

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0

## 1.1.3

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/utils@3.0.2

## 1.1.2

### Patch Changes

- Updated dependencies [73b6a34]
  - @solid-primitives/utils@3.0.0

## Changelog up to version 1.1.1

0.0.100

Initial release as a Stage-1 primitive.

1.0.0 - **Stage-2**

- Remove `runWithRoot`
- Rename `createSubRoot` to `createBranch` and `runWithSubRoot` to `createDisposable` (also unify returns to only dispose fn)

  1.1.0

Add `createSharedRoot` primitive
