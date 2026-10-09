---
"@solid-primitives/storage": patch
---

fix: restore `makePersisted` generic type inference under TypeScript 5+/7. Calling `makePersisted(createSignal("hello"), { name, storage: localStorage })` previously fell back to `T = unknown` and errored with `TS2769`. The public overloads now extract `T` from `S` via `SignalType<S>` (as in 4.3.5).
