---
"@solid-primitives/raf": patch
---

`createRAF`/`createMs` `start()` no longer tracks its own `running` signal, which made a tracking caller (e.g. one created inside a memo) re-run forever.
