# @solid-primitives/form

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
