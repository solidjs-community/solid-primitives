# @solid-primitives/map

## Changelog up to version 0.2.0

0.0.100

Initial release of the package.

0.2.0

Deprecated `createMap` and `createWeakMap` functions, as they weren't providing any benefit over instanciating with the `new` keyword.

`ReactiveMap` and `ReactiveWeakMap` now will respect `instanceof Map/WeakMap` checks.

Internal signals will be created only if read in a tracking scope.

Remove setter function api from `.set()` method.
