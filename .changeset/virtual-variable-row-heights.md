---
"@solid-primitives/virtual": minor
---

Support variable row heights: `rowHeight` can now be a `(index) => number` function, and an opt-in measured mode (`estimatedRowHeight` plus `measureElement`, using `ResizeObserver`) records real heights. `createVirtualList` returns a third `helpers` tuple element (`getRowOffset`, `getRowHeight`, `measureElement`, `unmeasureElement`, `resetMeasurements`, `scrollToIndex`) and the state gains `offsets`. The fixed-height path is unchanged.
