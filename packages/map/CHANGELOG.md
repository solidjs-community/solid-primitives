# @solid-primitives/map

## 0.2.1

### Patch Changes

- Updated dependencies [73b6a34]
  - @solid-primitives/utils@3.0.0

## Changelog up to version 0.2.0

0.0.100

Initial release of the package.

0.2.0

Deprecated `createMap` and `createWeakMap` functions, as they weren't providing any benefit over instanciating with the `new` keyword.

`ReactiveMap` and `ReactiveWeakMap` now will respect `instanceof Map/WeakMap` checks.

Internal signals will be created only if read in a tracking scope.

Remove setter function api from `.set()` method.
