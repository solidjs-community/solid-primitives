# @solid-primitives/set

## Changelog up to version 0.2.0

0.0.100

Initial release of the package.

0.2.0

Deprecated `createSet` and `createWeakSet` functions, as they weren't providing any benefit over instanciating with the `new` keyword.

`ReactiveSet` and `ReactiveWeakSet` now will respect `instanceof Set/WeakSet` checks.

Internal signals will be created only if read in a tracking scope.
