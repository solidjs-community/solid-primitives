---
"@solid-primitives/timer": minor
---

Add `makePausableTimer` and `createPausableTimer`: one-shot timeouts that track remaining time across pause/resume, with a reactive delay, signal accessors (`remaining`, `isActive`, `isPaused`) and an opt-in `pauseWhenHidden` option.
