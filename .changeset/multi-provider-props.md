---
"@solid-primitives/context": minor
---

`MultiProvider` now passes props to providers created by `createContextProvider`, `createOptionalContextProvider` and `createLayeredContext`: `[CounterProvider, { initial: 1 }]` behaves exactly like `<CounterProvider initial={1}>` (closes #755). Raw contexts and other provider components still receive the second item as `value`, and entries are now type-checked against their provider's props.

**Migration:** a `[Provider, value]` pair for one of these providers previously reached the factory as `props.value`; pass `[Provider, { value }]` to keep that shape.
