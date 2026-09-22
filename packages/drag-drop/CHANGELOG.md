# @solid-primitives/drag-drop

## 0.1.0-next.2

### Patch Changes

- da17801: Stop calling `flush()` from the `ref` callbacks of `createDraggable`, `createDroppable` and `createNativeDroppable`. Solid 2 runs refs inside an effect, where a synchronous `flush()` is a no-op that logs `FLUSH_IN_EFFECT_CALLBACK` once per item. The `elSignal` write is picked up by the flush already in progress (or Solid's own scheduled flush when `ref` is called outside JSX), so listeners attach as before. Code that calls `ref` manually and needs listeners attached synchronously should call `flush()` itself.

## 0.1.0-next.1

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5

## 0.1.0-next.0

### Minor Changes

- 75d2a1f: New package: `@solid-primitives/drag-drop` — composable drag-and-drop primitives for Solid 2.0.

  ### Exports

  **Pointer-event DnD** (UI element dragging):
  - `makeDraggable` — non-reactive base, no Solid owner required
  - `makeDroppable` — non-reactive drop target base
  - `createDraggable` — reactive draggable with `isDragging`, `transform`, auto style/class; keyboard-accessible (`Space`/`Enter` to pick up/drop, arrow keys to nudge, `Escape` to cancel)
  - `createDroppable` — reactive drop target with `isOver`, `active`, auto style/class
  - `createSortable` — combines draggable + droppable on the same element
  - `createDragContext` — coordinates a tree of draggables and droppables, with optional `autoScroll` near viewport edges
  - `arrayMove` — pure reorder helper for `onDragEnd` + `createSortable`

  **Native HTML5 DnD** (file drops, `draggable="true"` elements):
  - `makeNativeDroppable` — non-reactive base with depth-counter fix for child elements
  - `createNativeDroppable` — reactive native drop zone for OS file drops

  **Collision detection strategies** (pure functions, pass to `createDragContext`):
  - `closestCenter`, `closestCorners`, `rectIntersection`, `pointerWithin` (default)

  ### Notes
  - The reported `transform` is corrected for page scroll during a drag, so the dragged element doesn't visually drift from the pointer if the page scrolls mid-drag (needed for `autoScroll` to look right, and for any scrollable page in general).
  - `createDroppable`/`createSortable` log a dev-mode warning when used without a `createDragContext` ancestor, since `isOver`/`active` silently stay `false`/`null` in that case.
  - `isDragging`/`isOver` are backed by `createProjection` instead of a per-instance `active()?.id === id` memo, so a drag start/end or hover change in a large list only notifies the specific items involved.
