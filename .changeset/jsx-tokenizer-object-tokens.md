---
"@solid-primitives/jsx-tokenizer": minor
---

Add `createObjectToken` (#399): an opt-in token component whose element is a plain `{ data }` object instead of a function. Object tokens survive Solid's `children()` helper and components that resolve their children (such as context providers), so the resolved children can still be parsed with `resolveTokens` / `isToken`. Existing `createToken` tokens are unchanged.
