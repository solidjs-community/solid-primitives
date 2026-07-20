# @solid-primitives/interaction

## 1.0.0-next.3

### Minor Changes

- b7ef2f3: `createHideOutside`/`ariaHideOutside` gain an opt-in `inert` option — in addition to `aria-hidden`, also sets the `inert` attribute on hidden elements, ref-counted alongside `aria-hidden`. `aria-hidden` alone only affects the accessibility tree; `inert` additionally removes hidden content from focus order, tab order, and pointer/text-selection interaction. Defaults to `false` (no behavior change for existing callers).

  Also hardened the module-scope ref-counting/observer-stack state (used internally by both the existing `aria-hidden` tracking and the new `inert` tracking) against duplicate installed copies of this package, via the same `globalRegistry` pattern used in `@solid-primitives/scroll`.

### Patch Changes

- Updated dependencies [b7ef2f3]
  - @solid-primitives/utils@7.0.0-next.3

## 1.0.0-next.2

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.1

### Patch Changes

- c485250: fix: `makeInteractOutside`/`createInteractOutside` firing outside-interaction callbacks from an orphaned instance whose watched element was removed from the document before its reactive owner disposed (a common race when a dismissable layer closes and a new one opens in quick succession)

## 1.0.0-next.0

### Major Changes

- 9b2475d: Migrate to Solid.js v2.0 (beta.14)

### Patch Changes

- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0
