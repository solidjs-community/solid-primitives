---
"@solid-primitives/drag-drop": patch
---

Stop calling `flush()` from the `ref` callbacks of `createDraggable`, `createDroppable` and `createNativeDroppable`. Solid 2 runs refs inside an effect, where a synchronous `flush()` is a no-op that logs `FLUSH_IN_EFFECT_CALLBACK` once per item. The `elSignal` write is picked up by the flush already in progress (or Solid's own scheduled flush when `ref` is called outside JSX), so listeners attach as before. Code that calls `ref` manually and needs listeners attached synchronously should call `flush()` itself.
