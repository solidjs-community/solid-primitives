---
"@solid-primitives/event-bus": major
---

Simplify the API:

- Remove createSimpleEmitter (createEventBus has the same functionality now)
- Remove emit/remove Guards from event buses
- Remove value signal of createEventBus
- Replace createEmitter with one that can emit various events. A multi channel functionality similar to createEventHub. When event-bus is a single channel.
- Add `batchEmits` helper that will wrap passed bus and it's `emit` method with Solids `batch`
