---
"@solid-primitives/graphql": major
---

**Breaking:** The query primitive now accepts a `ResourceOptions` object, instead of just `initialValue`.

Changes to `url` or `options` will invalidate the resource now. Fixes #328
