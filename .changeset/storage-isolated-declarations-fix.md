---
"@solid-primitives/storage": patch
---

Fixed a build failure in `messageSync` and `wsSync`: their `url` parameter's default value (`globalThis.location?.href`) lacked an explicit type annotation, which `--isolatedDeclarations` (used by the package's `.d.ts` generation) requires on any parameter whose type can't be trivially inferred. No behavior or API changes — `url` is still `string | undefined`.
