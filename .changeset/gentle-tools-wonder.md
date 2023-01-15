---
"@solid-primitives/pagination": patch
---

Update computed pages when options signal changes.

If the passed pagination options are a reactive signal, ensure that the pages
array is recomputed when it changes. This prevents the pages array getting out
of sync and the resulting pagination props missing pages.