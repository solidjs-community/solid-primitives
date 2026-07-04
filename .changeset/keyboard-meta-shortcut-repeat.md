---
"@solid-primitives/keyboard": patch
---

Fix `createShortcut` and `useKeyDownList` (and everything built on it: `useCurrentlyHeldKey`, `useKeyDownSequence`) failing to re-trigger — and, for `createShortcut`, failing to `preventDefault` — on repeated presses of shortcuts involving the `Meta` key, e.g. `["Meta", "P"]` on macOS. macOS never fires `keyup` for other keys held down together with Meta, only for Meta itself, so both now treat Meta's `keyup` as a signal to clear all tracked keys, preventing stale key state from corrupting the next press.
