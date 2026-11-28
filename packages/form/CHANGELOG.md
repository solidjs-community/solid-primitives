# @solid-primitives/form

## 1.0.2

### Patch Changes

- 2f75087: Fix `form.ref` and `form.bind()` throwing `CLEANUP_IN_FORBIDDEN_SCOPE` (and `PRIMITIVE_IN_EFFECT_CALLBACK`) when used as JSX `ref` callbacks (#1143).

  Solid 2 runs a `ref` callback in a restricted context where `onCleanup` and creating roots, memos or effects are forbidden. `ref` and `bind` registered their listeners with `makeEventListener` (which calls `onCleanup`) and `bind` created its DOM-sync effect inside the callback. In a hydrated app the throw aborted hydration, so the submit handler was never attached and a native GET submission put the fields, including passwords, into the URL.

  Listeners are now plain `addEventListener` calls inside the ref callback, which still returns its cleanup. The field → DOM sync effect is created when `form.bind("name")` is evaluated (the component body), and the listeners are also torn down with the owner of `createForm` / `bind()`, because the runtime ignores a ref callback's return value. The unused `@solid-primitives/event-listener` dependency is removed.

  A `bind()` callback created without an owner is also torn down, together with its sync root, when the owner that mounted the ref is disposed.

## 1.0.1

### Patch Changes

- c037814: `createForm` no longer replaces itself with a stub on the server. The stub created none of the memos the client creates, and in Solid 2 each render-body memo takes a hydration id, so every element after the form missed its server-rendered node and the form never became interactive after hydration. The server now runs the same code, so `valid()`, `errors()` and `validate()` report the real initial state there too.
- Updated dependencies [b8a7727]
  - @solid-primitives/utils@7.0.1

## 1.0.0

### Major Changes

- 9b2475d: Initial release targeting Solid.js v2.0 (beta.14)

### Patch Changes

- 1c687d9: Fix `createForm`'s default `validateOn: "change"` mode showing a field's error immediately on mount, before the user had touched it. `error()` was wired directly to the raw, ungated validation result for `"change"` mode, so any field whose initial value failed validation (e.g. a required field starting empty) rendered errored from the first paint.

  `"change"` mode's validator error is now gated on per-field dirtiness (`value() !== initial`) — hidden until the field's value actually changes, and hidden again if it's changed back to the initial value. `blur`/`submit` modes are unaffected (still gated on `touched()`/`submitted()` respectively).

  Fixing this also surfaced a second, separate bug: the gating was applied to the _combined_ raw error, which included any `setError()`-injected external error (e.g. a server-side validation message) — so an external error set on a pristine `"change"`-mode field was incorrectly hidden too. External errors are now always shown immediately regardless of mode/dirty/touched/submitted state, matching their documented purpose (`setError`: "Inject an external error (e.g. from a server response)").

  `form.errors()` and `form.valid()` are unaffected either way — both were already, and remain, ungated (true validity regardless of display timing).

- cc30d55: Async validation state is now derived instead of mirrored through an effect. After `setValue()` on a field that has async validators, `field.pending()`, `form.pending()` and `form.valid()` are correct in the same flush as the value change; previously the first committed frame reported `pending() === false` and `valid() === true` until the next flush. Error display is unchanged: the previous async error stays visible while the next validation is in flight and is cleared by a sync error, as before. Results for an outdated value are still discarded. One further fix: a result that arrives after a sync error has superseded its run is now discarded too; before, it could be applied and later surface as the error of a newer value.

  Behavior changes: `pending()` is `true` from creation (before the first effect flush) while the initial async validation is outstanding, and one transient frame is gone (the torn frame where the new value looked valid). Server output is unchanged (`pending()` stays `false`). Note: `createForm` already desyncs hydration ids between server and client (the server returns a static object that allocates no owners); this change neither introduces nor fixes that.

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- c98cb2d: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [b7ef2f3]
- Updated dependencies [9b2475d]
- Updated dependencies [e395f54]
- Updated dependencies [89c5324]
- Updated dependencies [cc30d55]
- Updated dependencies [5fc4efa]
- Updated dependencies [a47cf15]
- Updated dependencies [ab4c926]
- Updated dependencies [4a5bf32]
- Updated dependencies [dd165cd]
- Updated dependencies [7ee755d]
- Updated dependencies [50e36c9]
- Updated dependencies [c98cb2d]
- Updated dependencies [1b703e1]
- Updated dependencies [638c530]
- Updated dependencies [04a170e]
- Updated dependencies [91a92aa]
- Updated dependencies [b7ef2f3]
- Updated dependencies [5c23fda]
  - @solid-primitives/a11y@1.0.0
  - @solid-primitives/utils@7.0.0
  - @solid-primitives/event-listener@3.0.0

## 1.0.0-next.6

### Patch Changes

- cc30d55: Async validation state is now derived instead of mirrored through an effect. After `setValue()` on a field that has async validators, `field.pending()`, `form.pending()` and `form.valid()` are correct in the same flush as the value change; previously the first committed frame reported `pending() === false` and `valid() === true` until the next flush. Error display is unchanged: the previous async error stays visible while the next validation is in flight and is cleared by a sync error, as before. Results for an outdated value are still discarded. One further fix: a result that arrives after a sync error has superseded its run is now discarded too; before, it could be applied and later surface as the error of a newer value.

  Behavior changes: `pending()` is `true` from creation (before the first effect flush) while the initial async validation is outstanding, and one transient frame is gone (the torn frame where the new value looked valid). Server output is unchanged (`pending()` stays `false`). Note: `createForm` already desyncs hydration ids between server and client (the server returns a static object that allocates no owners); this change neither introduces nor fixes that.

- Updated dependencies [cc30d55]
  - @solid-primitives/event-listener@3.0.0-next.10

## 1.0.0-next.5

### Patch Changes

- 1b703e1: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.14`.
- Updated dependencies [1b703e1]
  - @solid-primitives/a11y@1.0.0-next.5
  - @solid-primitives/event-listener@3.0.0-next.7
  - @solid-primitives/utils@7.0.0-next.6

## 1.0.0-next.4

### Patch Changes

- 638c530: Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals` peer and dev dependency range to `2.0.0-rc.9`, and `babel-preset-solid` to `2.0.0-rc.2`.

  Two behavior fixes were needed to keep up with upstream changes in this range:

  - `@solid-primitives/deep`: `captureStoreUpdates` no longer missed property changes. As of `2.0.0-rc.1` a store's `[$TRACK]` only fires for structural changes (key additions/removals), so leaf value changes stopped being reported. Each node's direct property values are now tracked individually. Updates are still reported at the shallowest node that actually changed.
  - `@solid-primitives/storage`: `makePersisted` no longer persists stale data. Signal writes stay pending until the next flush in `2.0.0-rc.1`+, so reading the value back inside the setter returned the _previous_ one — persisting stale data, or removing the stored entry entirely when the previous value was nullish. The value returned by the setter is now persisted directly.

- Updated dependencies [7ee755d]
- Updated dependencies [638c530]
  - @solid-primitives/utils@7.0.0-next.5
  - @solid-primitives/event-listener@3.0.0-next.6
  - @solid-primitives/a11y@1.0.0-next.4

## 1.0.0-next.3

### Patch Changes

- 1c687d9: Fix `createForm`'s default `validateOn: "change"` mode showing a field's error immediately on mount, before the user had touched it. `error()` was wired directly to the raw, ungated validation result for `"change"` mode, so any field whose initial value failed validation (e.g. a required field starting empty) rendered errored from the first paint.

  `"change"` mode's validator error is now gated on per-field dirtiness (`value() !== initial`) — hidden until the field's value actually changes, and hidden again if it's changed back to the initial value. `blur`/`submit` modes are unaffected (still gated on `touched()`/`submitted()` respectively).

  Fixing this also surfaced a second, separate bug: the gating was applied to the _combined_ raw error, which included any `setError()`-injected external error (e.g. a server-side validation message) — so an external error set on a pristine `"change"`-mode field was incorrectly hidden too. External errors are now always shown immediately regardless of mode/dirty/touched/submitted state, matching their documented purpose (`setError`: "Inject an external error (e.g. from a server response)").

  `form.errors()` and `form.valid()` are unaffected either way — both were already, and remain, ungated (true validity regardless of display timing).

## 1.0.0-next.2

### Patch Changes

- Bump the `solid-js`/`@solidjs/web`/`@solidjs/signals`/`babel-preset-solid` peer and dev dependency range to `2.0.0-rc.0`. No API or behavior changes on our end — this tracks upstream's move from the beta series into the release candidate.
- Updated dependencies
  - @solid-primitives/a11y@1.0.0-next.3
  - @solid-primitives/event-listener@3.0.0-next.3
  - @solid-primitives/utils@7.0.0-next.4

## 1.0.0-next.1

### Patch Changes

- 50e36c9: Bump the `solid-js`/`@solidjs/web` peer and dev dependency range to `2.0.0-beta.20`. No API or behavior changes; beta.19/beta.20 introduced no breaking changes upstream (internal tree-shaking work, a new `solid-js/refresh` HMR entry point, and SSR/hydration/`lazy()` bug fixes).
- Updated dependencies [50e36c9]
  - @solid-primitives/a11y@1.0.0-next.1
  - @solid-primitives/event-listener@3.0.0-next.2
  - @solid-primitives/utils@7.0.0-next.2

## 1.0.0-next.0

### Major Changes

- 9b2475d: Initial release targeting Solid.js v2.0 (beta.14)

### Patch Changes

- Updated dependencies [9b2475d]
- Updated dependencies [89c5324]
- Updated dependencies [4a5bf32]
  - @solid-primitives/a11y@1.0.0-next.0
  - @solid-primitives/utils@7.0.0-next.0
  - @solid-primitives/event-listener@3.0.0-next.0
