# @solid-primitives/intersection-observer

## 2.0.6

### Patch Changes

- e6e555b5: Improve types for createVisibilityObserver

## 2.0.5

### Patch Changes

- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0

## 2.0.4

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/utils@4.0.1

## 2.0.3

### Patch Changes

- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0

## 2.0.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0

## 2.0.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/utils@3.0.2

## 2.0.0

### Major Changes

- 140d862: - Reworks `createVisibilityObserver` to be able to use it with multiple elements — for reusing the IO instance.
  - Extends it's functionality with a setter callback argument — a way to custom calculate the visibility.
  - Removes the `once` option — imperative `clear` functions and such options don't fit the model of declaring computations. If computation has to be stopped, one needs to wrap it with `createRoot`.
  - Adds `withOccurrence` and `withDirection` setter modifiers.

### Patch Changes

- Updated dependencies [73b6a34]
  - @solid-primitives/utils@3.0.0

## Changelog up to version 1.4.0

0.0.108

Committing first version of primitive.

1.0.0

Minor improvements to structure.

1.1.0

Major improvements to types and breaking changes of the interface.

1.1.1

Minor type adjustments.

1.1.2

Released with CJS support.

1.1.11

After a couple rounds, patched CJS support.

1.2.0

Patched issue with observer only firing once and disconnecting not functional.

1.2.1

Updated to Solid 1.3

1.2.2

Minor improvements

1.3.0

General improvements to bring up to latest standards.

1.4.0

Migrated to new `make` pattern and improved primitive structures.
