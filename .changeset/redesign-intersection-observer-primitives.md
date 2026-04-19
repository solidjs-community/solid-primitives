---
"@solid-primitives/intersection-observer": major
---

Redesign `createIntersectionObserver` and `createVisibilityObserver` for Solid 2.0 reactivity.

## `createIntersectionObserver` — breaking changes

**Removed** the `onChange` callback parameter. **Added** a store array as the return value.

```ts
// Before
createIntersectionObserver(elements, entries => console.log(entries), options);

// After
const entries = createIntersectionObserver(elements, options);
createEffect(() => entries.forEach(e => console.log(e.isIntersecting)));
```

**Why a store instead of a signal or callback?**
Each element's intersection state changes independently. With a plain signal the entire array would be a single reactive dependency — any element's change re-runs every computation reading it. A store array gives per-slot granularity: reading `entries[i].isIntersecting` only re-runs the computation that reads slot `i`, not those reading other slots.

**Implementation details worth noting:**
- Entries are frozen (`Object.freeze`) before being stored. Solid 2.0's store proxies any non-frozen object — including DOM elements — which would break reference equality on `entry.target`. Freezing prevents that.
- Array length is updated explicitly in the produce function. Solid 2.0's store tracks length in a separate override map; a bare index assignment (`draft[idx] = value`) does not advance `draft.length` on its own.

**Reactive options (new):**
`options` may now be a reactive accessor (`MaybeAccessor<IntersectionObserverInit>`). When the accessor's value changes, the observer is disconnected and recreated with the new options, and all currently tracked elements are re-observed.

The reactive branch uses a closure over `io` rather than threading state through the effect's return value. Solid 2.0's `EffectFunction` must return `void | (() => void)` (a cleanup function), so the previous-observer reference is held in the outer `let io` variable and mutated on each options change.

## `createVisibilityObserver` — breaking changes

**Removed** the curried factory pattern. The element is now the first argument.

```ts
// Before
const useVisibilityObserver = createVisibilityObserver({ threshold: 0.8 });
const visible = useVisibilityObserver(() => el);

// After
const visible = createVisibilityObserver(() => el, { threshold: 0.8 });
```

**Why flatten the API?**
The factory existed so one `IntersectionObserver` instance could be shared across multiple elements with the same options. In practice most callers observed a single element, making the two-call pattern more confusing than useful. Users who need to observe many elements efficiently should use `createViewportObserver` or `createIntersectionObserver`.

**`runWithOwner` (bug fix):**
Signal writes from the `IntersectionObserver` callback now use `runWithOwner` to bind them to the reactive scope that created the observer. Without this, Solid 2.0 warns "A Signal was written to in an owned scope" and writes may not commit correctly when the callback fires outside the owner's execution context.
