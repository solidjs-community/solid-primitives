---
"@solid-primitives/pagination": patch
---

Removed a leftover `declare module "solid-js"` global JSX augmentation (and its associated unused `_E` type alias) from `createInfiniteScroll`. It was left over from an earlier `use:` directive-based implementation that was replaced by the current plain ref-callback API (`loader: (el: Element) => void`) — nothing in the package referenced it anymore. JSR's publish step rejects packages that modify global types, which was blocking `deno publish` for this package. No API or behavior changes.
