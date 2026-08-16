# @solid-primitives/history

## 0.2.5

### Patch Changes

- 396a72f: Fix `createUndoHistory` misfiring restores when tracking multiple sources and one of them pauses (returns a falsy value) while another stays active.

  Previously each history entry stored a compacted array of setters, dropping any paused source — so entries on either side of a pause/resume boundary could end up with different lengths, causing `undo`/`redo` to compare setters by the wrong array index and either restore the wrong source or spuriously re-fire one that hadn't actually changed. Entries now keep a fixed-length slot per source (`undefined` when paused), so index alignment is stable across every recorded entry.

  Credit to @mesram, whose `createStore`/`createOptimistic`-based rewrite (for the Solid 2.0 line) is the basis for this fix.

## 0.2.4

### Patch Changes

- Updated dependencies [62e331d]
  - @solid-primitives/utils@6.4.1

## 0.2.3

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.2.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.
- Updated dependencies [396812d]
  - @solid-primitives/utils@6.3.2

## 0.2.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)
- Updated dependencies [53f08cc]
  - @solid-primitives/utils@6.3.1

## 0.2.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/utils@6.3.0

## 0.1.5

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 0.1.4

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 0.1.3

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 0.1.2

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 0.1.1

### Patch Changes

- 2c9d3238: Add `void` as a possible return type.

## 0.1.0

### Minor Changes

- 2157af7d: Allow falsy values to be returned from the source function to not create a point in history.

## 0.0.2

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0
