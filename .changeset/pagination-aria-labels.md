---
"@solid-primitives/pagination": minor
---

Add `firstAriaLabel`/`prevAriaLabel`/`nextAriaLabel`/`lastAriaLabel` options to `createPagination`, applied as an `aria-label` on the corresponding button props (resolves #750). Previously the first/prev/next/last buttons had no accessible name beyond their visible content, which defaults to bare symbols (`|<`, `<`, `>`, `>|`) — screen reader users got no meaningful announcement. Defaults are `"First page"`, `"Previous page"`, `"Next page"`, `"Last page"`; override any of them independently. These are separate from the existing `firstContent`/`prevContent`/`nextContent`/`lastContent` options, which control visible (possibly JSX/icon) content — `aria-label` must be a plain string, so it can't reuse those.
