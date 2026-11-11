---
"@solid-primitives/history": patch
---

Fix undo/redo recording a bogus history entry on Solid 2.0.0-rc.14+, where optimistic writes made outside a parked transition are void. The "restoring" flag is now a plain flag consumed by the next recompute.
