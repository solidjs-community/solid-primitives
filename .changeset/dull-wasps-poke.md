---
"@solid-primitives/intersection-observer": major
---

- Reworks `createVisibilityObserver` to be able to use it with multiple elements — for reusing the IO instance.
- Extends it's functionality with a setter callback argument — a way to custom calculate the visibility.
- Removes the `once` option — imperative `clear` functions and such options don't fit the model of declaring computations. If computation has to be stopped, one needs to wrap it with `createRoot`.
- Adds `withOccurrence` and `withDirection` setter modifiers.
