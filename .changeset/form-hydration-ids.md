---
"@solid-primitives/form": patch
---

`createForm` no longer replaces itself with a stub on the server. The stub created none of the memos the client creates, and in Solid 2 each render-body memo takes a hydration id, so every element after the form missed its server-rendered node and the form never became interactive after hydration. The server now runs the same code, so `valid()`, `errors()` and `validate()` report the real initial state there too.
