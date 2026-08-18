---
"@solid-primitives/intersection-observer": patch
---

Fix `isVisible()`/`createVisibilityObserver()`'s `visible()` throwing a locally-defined `NotReadyError` lookalike class instead of the real one exported from `solid-js`. Because the local class wasn't `instanceof` the real `NotReadyError`, `<Loading>` boundaries never actually caught it — despite the documented `<Loading>` integration, calling `isVisible`/`visible` before the first observation would crash rendering instead of showing the Loading fallback. `NotReadyError` is now imported and re-exported from `solid-js` directly, so `<Loading>` (and any `instanceof` check) works as documented.
