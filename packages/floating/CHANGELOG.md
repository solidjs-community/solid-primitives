# @solid-primitives/floating

## 0.1.0

### Minor Changes

- 0e88ead: Initial release of `@solid-primitives/floating`: `computePosition` and `computePositionFromRects` (placement, offset, flip, shift, size, arrow, RTL, boundaries), `makeAutoUpdate`, the reactive `createFloating`, and size CSS variable helpers. `computePosition` handles transformed containing blocks for `strategy: "fixed"` and scaled offset parents. Containing-block detection covers `offset-path`, `content-visibility`, `transform-style: preserve-3d` and exact `will-change` tokens (`filter` is ignored on `html`), a positioned `html` is honoured for `"absolute"`, top-layer elements (popover, modal dialog, fullscreen) ignore ancestor transforms, slotted elements find their containing block across shadow roots, and an RTL scrollbar on the left is excluded from the viewport boundary.
