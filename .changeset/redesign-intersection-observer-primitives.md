---
"@solid-primitives/intersection-observer": major
---

Redesign intersection-observer primitives for Solid 2.0 async reactivity.

## `createIntersectionObserver` — breaking changes

**Return type changed** from a plain store array to a tuple `[entries, isVisible]`.

```ts
// Before
const entries = createIntersectionObserver(elements, options);

// After
const [entries, isVisible] = createIntersectionObserver(elements, options);
```

**Added `isVisible(el)` helper** — a pending-aware accessor that throws `NotReadyError` until the first observation fires for a given element, then returns `entry.isIntersecting` reactively. Integrates with `<Loading>` for a natural loading fallback:

```tsx
const [entries, isVisible] = createIntersectionObserver(targets);

<Loading fallback={<p>Checking…</p>}>
  <Show when={isVisible(el)}><p>Visible!</p></Show>
</Loading>
```

**Removed** the `onChange` callback parameter. **Added** a store array as the return value.

```ts
// Before
createIntersectionObserver(elements, entries => console.log(entries), options);

// After
const [entries] = createIntersectionObserver(elements, options);
createEffect(() => entries.forEach(e => console.log(e.isIntersecting)));
```

**Why a store instead of a signal or callback?**
Each element's intersection state changes independently. With a plain signal the entire array would be a single reactive dependency — any element's change re-runs every computation reading it. A store array gives per-slot granularity: reading `entries[i].isIntersecting` only re-runs the computation that reads slot `i`, not those reading other slots.

**Reactive options (new):**
`options` may now be a reactive accessor (`MaybeAccessor<IntersectionObserverInit>`). When the accessor's value changes, the observer is disconnected and recreated with the new options, and all currently tracked elements are re-observed.

## `createViewportObserver` — breaking changes

**Removed `use:` directive support.** The `add` function now supports a curried ref form instead, which is nearly as terse and compatible with Solid 2.0 (RFC 07 removed the `use:` directive namespace):

```tsx
// Before
const [intersectionObserver] = createViewportObserver()
<div use:intersectionObserver={(e) => console.log(e.isIntersecting)}></div>

// After
const [add] = createViewportObserver()
<div ref={add(e => console.log(e.isIntersecting))}></div>
```

`add(callback)` returns a `(el) => void` ref callback. The imperative `add(el, callback)` form is unchanged.

## `createVisibilityObserver` — breaking changes

**Pending state (new):** When `initialValue` is omitted, `visible()` now throws `NotReadyError` until the first `IntersectionObserver` callback fires, integrating with `<Loading>` for a loading fallback. Previously the signal defaulted to `false`.

```tsx
// Before — returned false immediately
const visible = createVisibilityObserver(() => el);
visible() // false

// After — pending until first IO fires
const visible = createVisibilityObserver(() => el);
visible() // throws NotReadyError (caught by <Loading>)

// Opt out with initialValue:
const visible = createVisibilityObserver(() => el, { initialValue: false });
visible() // false immediately
```

**Removed** the curried factory pattern. The element is now the first argument.

```ts
// Before
const useVisibilityObserver = createVisibilityObserver({ threshold: 0.8 });
const visible = useVisibilityObserver(() => el);

// After
const visible = createVisibilityObserver(() => el, { threshold: 0.8 });
```

**Removed `runWithOwner`:** Signal writes from the `IntersectionObserver` callback no longer use `runWithOwner`. Solid 2.0 allows signal writes from external callbacks without owner binding.

## `Occurrence`, `DirectionX`, `DirectionY` — breaking changes

Converted from TypeScript `enum` to `const` objects with type aliases. This makes them tree-shakeable and avoids TypeScript enum pitfalls.

```ts
// Before (enum)
import { Occurrence } from "@solid-primitives/intersection-observer";
Occurrence.Entering // works, but enum carries runtime overhead

// After (const object)
import { Occurrence } from "@solid-primitives/intersection-observer";
Occurrence.Entering // "Entering" — plain string, tree-shakeable
```
