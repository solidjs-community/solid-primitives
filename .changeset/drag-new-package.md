---
"@solid-primitives/drag-drop": minor
---

New package: `@solid-primitives/drag-drop` — composable drag-and-drop primitives for Solid 2.0.

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
