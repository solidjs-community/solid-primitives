# @solid-primitives/intersection-observer

## 3.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/utils@7.0.0-next.2

## 3.0.0-next.0

### Major Changes

- 16a45a9: Redesign intersection-observer primitives for Solid 2.0 async reactivity.

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
    <Show when={isVisible(el)}>
      <p>Visible!</p>
    </Show>
  </Loading>;
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
  visible(); // false

  // After — pending until first IO fires
  const visible = createVisibilityObserver(() => el);
  visible(); // throws NotReadyError (caught by <Loading>)

  // Opt out with initialValue:
  const visible = createVisibilityObserver(() => el, { initialValue: false });
  visible(); // false immediately
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
  Occurrence.Entering; // works, but enum carries runtime overhead

  // After (const object)
  import { Occurrence } from "@solid-primitives/intersection-observer";
  Occurrence.Entering; // "Entering" — plain string, tree-shakeable
  ```

### Patch Changes

- e1fe5e6: Remove `@deprecated` tag from `makeIntersectionObserver` and add it to the README. The deprecation was never documented and the primitive remains useful for imperative, non-reactive use cases.
- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/utils@7.0.0-next.0

## 2.2.4

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 2.2.3

### Patch Changes

- f32f209: Update author email for David Di Biase.

## 2.2.2

### Patch Changes

- 396812d: Enable verbatimModuleSyntax -> add `type` keyword to all type imports.
- Updated dependencies [396812d]
  - @solid-primitives/utils@6.3.2

## 2.2.1

### Patch Changes

- 53f08cc: fix: Move `"@solid-primitives/source"` export condition under import in package.json
  (Fixes #774, Fixes #749)
- Updated dependencies [53f08cc]
  - @solid-primitives/utils@6.3.1

## 2.2.0

### Minor Changes

- ea09f71: Remove CJS support. The package is ESM only now.

### Patch Changes

- Updated dependencies [ea09f71]
  - @solid-primitives/utils@6.3.0

## 2.1.6

### Patch Changes

- 74db287: Correct the "homepage" field in package.json

## 2.1.5

### Patch Changes

- Updated dependencies [48d44c0]
  - @solid-primitives/utils@6.2.3

## 2.1.4

### Patch Changes

- d23dd74: Add type exports for cjs
- Updated dependencies [d23dd74]
  - @solid-primitives/utils@6.2.2

## 2.1.3

### Patch Changes

- Updated dependencies [92c1e5c4]
  - @solid-primitives/utils@6.2.1

## 2.1.2

### Patch Changes

- Updated dependencies [3c007b92]
  - @solid-primitives/utils@6.2.0

## 2.1.1

### Patch Changes

- Updated dependencies [2e0bcedf]
  - @solid-primitives/utils@6.1.1

## 2.1.0

### Minor Changes

- 5cb1e95b: Deprecate `makeIntersectionObserver`, improve `createIntersectionObserver` targets diffing logic

## 2.0.11

### Patch Changes

- Updated dependencies [2f6d3732]
  - @solid-primitives/utils@6.0.0

## 2.0.10

### Patch Changes

- 83843698: Use `!isServer && DEV` for checking development env to support versions prior to 1.6.12
- Updated dependencies [83843698]
  - @solid-primitives/utils@5.5.2

## 2.0.9

### Patch Changes

- 3fad3789: Revert from publishing separate server, development, and production builds that has to rely on export conditions
  to publishing a single build that can be used in any environment.
  Envs will be checked at with `isDev`and `isServer` consts exported by `"solid-js/web"` so it's still tree-shakeable.
- Updated dependencies [3fad3789]
  - @solid-primitives/utils@5.5.1

## 2.0.8

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0

## 2.0.8-beta.0

### Patch Changes

- Updated dependencies [d6559a32]
  - @solid-primitives/utils@5.4.0-beta.0

## 2.0.7

### Patch Changes

- 865d5ee9: Fix build. (remove keepNames option)
- Updated dependencies [865d5ee9]
  - @solid-primitives/utils@5.2.1

## 2.0.6

### Patch Changes

- e6e555b5: Improve types for createVisibilityObserver

## 2.0.5

### Patch Changes

- Updated dependencies [c2866ea6]
  - @solid-primitives/utils@5.0.0

## 2.0.4

### Patch Changes

- dd2d7d1c: Improve export conditions.
- Updated dependencies [dd2d7d1c]
  - @solid-primitives/utils@4.0.1

## 2.0.3

### Patch Changes

- Updated dependencies [9ed32b38]
  - @solid-primitives/utils@4.0.0

## 2.0.2

### Patch Changes

- b662fe9f: Improve package export contidions for SSR (node, workers, deno)
- Updated dependencies [a372d0e7]
- Updated dependencies [b662fe9f]
- Updated dependencies [abb8063c]
  - @solid-primitives/utils@3.1.0

## 2.0.1

### Patch Changes

- 7ac41ed: Update to solid-js version 1.5
- Updated dependencies [7ac41ed]
  - @solid-primitives/utils@3.0.2

## 2.0.0

### Major Changes

- 140d862: - Reworks `createVisibilityObserver` to be able to use it with multiple elements — for reusing the IO instance.
  - Extends it's functionality with a setter callback argument — a way to custom calculate the visibility.
  - Removes the `once` option — imperative `clear` functions and such options don't fit the model of declaring computations. If computation has to be stopped, one needs to wrap it with `createRoot`.
  - Adds `withOccurrence` and `withDirection` setter modifiers.

### Patch Changes

- Updated dependencies [73b6a34]
  - @solid-primitives/utils@3.0.0

## Changelog up to version 1.4.0

0.0.108

Committing first version of primitive.

1.0.0

Minor improvements to structure.

1.1.0

Major improvements to types and breaking changes of the interface.

1.1.1

Minor type adjustments.

1.1.2

Released with CJS support.

1.1.11

After a couple rounds, patched CJS support.

1.2.0

Patched issue with observer only firing once and disconnecting not functional.

1.2.1

Updated to Solid 1.3

1.2.2

Minor improvements

1.3.0

General improvements to bring up to latest standards.

1.4.0

Migrated to new `make` pattern and improved primitive structures.
