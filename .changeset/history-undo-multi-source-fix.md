---
"@solid-primitives/history": patch
---

Fix two independent bugs in `createUndoHistory` that could each cause `undo`/`redo` to misfire — the second affects single-source usage too, not just multiple sources.

**Microtask race on the internal "ignore" flag.** The previous implementation suppressed re-recording a history entry during `undo`/`redo` with a flag (`ignoreNext`) reset via a separately-scheduled microtask (`createMicrotask`). Since Solid 2.0 batches signal writes into their own microtask-scheduled flush, the flag's reset microtask could resolve *before* the write's own flush — so the restore triggered by `undo`/`redo` got recorded as a brand-new history entry instead of being suppressed, corrupting `canRedo`/`canUndo` bookkeeping. This reproduces with a single source and no multi-source setup at all. The rewrite replaces the flag with `createOptimistic`, whose revert is coordinated by Solid's own flush (it runs after the same flush's pending recomputes, not via an independent competing microtask), which structurally removes this race.

**Misaligned/spurious restores with multiple sources.** Separately, each history entry stored a compacted array of setters, dropping any paused source — so entries on either side of a pause/resume boundary could end up with different lengths, causing `undo`/`redo` to compare setters by the wrong array index and either restore the wrong source or spuriously re-fire one that hadn't actually changed. Entries now keep a fixed-length slot per source (`undefined` when paused), so index alignment is stable across every recorded entry.

Also fixes the `limit` option: the default silently became unbounded and `limit: 0` no longer meant zero retention. Restored the documented default of `100` and made trimming unconditional so `limit: 0` correctly retains no undo history.

Credit to @mesram, whose `createStore`/`createOptimistic`-based rewrite is the basis for this fix.
