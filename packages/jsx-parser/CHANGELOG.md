# @solid-primitives/jsx-parser

## 0.1.2

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/utils@5.2.1

## 0.1.1

### Patch Changes

- 3f2cc1fb: Warn about invalid elements only if thy are truthy

## 0.1.0

### Minor Changes

- fd0d137a: Add the token object to the `data` property of the token element, instead of spreading it with `Object.assign`.

  Separates available functions into own exports, `parser` is now required to be passed to the functions.

### Patch Changes

- Updated dependencies [c1538561]
  - @solid-primitives/utils@5.1.0

## 0.0.2

### Patch Changes

- e2533800: set returnType createToken from JSX.Element to TokenComponent<Token>
