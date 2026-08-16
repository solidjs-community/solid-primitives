---
"@solid-primitives/history": patch
---

Fix `createUndoHistory` misfiring restores when tracking multiple sources and one of them pauses (returns a falsy value) while another stays active.

Previously each history entry stored a compacted array of setters, dropping any paused source — so entries on either side of a pause/resume boundary could end up with different lengths, causing `undo`/`redo` to compare setters by the wrong array index and either restore the wrong source or spuriously re-fire one that hadn't actually changed. Entries now keep a fixed-length slot per source (`undefined` when paused), so index alignment is stable across every recorded entry.

Credit to @mesram, whose `createStore`/`createOptimistic`-based rewrite (for the Solid 2.0 line) is the basis for this fix.
