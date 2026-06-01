---
"@solid-primitives/props": major
---

Migrate to Solid.js v2.0 (beta.13)

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.13` and `@solidjs/web@^2.0.0-beta.13` are now required.

**`classList` support removed**: Solid 2.0 removes the `classList` JSX prop in favour of the `class` prop accepting objects and arrays. `combineProps` no longer handles a `classList` key. Use `class` with an object or array instead:

```tsx
// Before
combineProps(props, { classList: { active: isActive() } })

// After
combineProps(props, { class: { active: isActive() } })
```

**`class` combining updated**: When all combined `class` values are strings they are joined with a space (unchanged). When any value is a `ClassList` object or array, the result is a flat array accepted by Solid 2.0's `class` prop.

**`merge` replaces `mergeProps`**: The internal call to `mergeProps` has been updated to Solid 2.0's `merge`. Non-special props now follow `merge` semantics — an explicit `undefined` in a later source overrides earlier values (previously `undefined` was skipped).

**`createMemo` second argument**: `createPropsPredicate` used `createMemo(fn, undefined, options)` — the removed `initialValue` arg. It now correctly passes `createMemo(fn, options)`.
