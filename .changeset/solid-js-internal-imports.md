---
"@solid-primitives/bounds": patch
"@solid-primitives/lifecycle": patch
"@solid-primitives/list": patch
"@solid-primitives/mouse": patch
"@solid-primitives/resize-observer": patch
"@solid-primitives/rootless": patch
"@solid-primitives/scroll": patch
"@solid-primitives/static-store": patch
"@solid-primitives/utils": patch
---

Import `sharedConfig` and `createOwner` from `solid-js/internal`, where `solid-js@2.0.0` declares them. They resolve to the same objects as before; this only fixes type resolution (and the JSR type check).
