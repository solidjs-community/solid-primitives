---
"@solid-primitives/date": patch
---

`formatDateRelative` no longer returns "60 seconds ago" or "in 60 seconds" for differences between 59.5 and 60 seconds; they now read "1 minute".
