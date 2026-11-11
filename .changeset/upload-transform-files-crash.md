---
"@solid-primitives/upload": patch
---

Fix `transformFiles` throwing for every `FileList`. Iterating with `for...in` also visited the list's `length` and `item` members, so file pickers and drop zones crashed.
