---
"@solid-primitives/props": major
---

Move `createCntrolledProp` primitive to a separate package: `@solid-primitives/controlled-props`. This pacakge no longer ships JSX, hence putting it to ssr.noExternal for SSR support is no longer neccessary.
