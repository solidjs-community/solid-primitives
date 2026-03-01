---
"@solid-primitives/sse": patch
---

Fix memory leak when app-level retries are exhausted in `createSSE`. Previously, when all reconnect attempts were used up and the `EventSource` was permanently closed, `currentCleanup` was never called — leaving the `EventSource` instance and its event listeners alive in memory, and the `source` signal pointing to a stale handle. Now an `else if` branch explicitly calls `currentCleanup()`, clears the reference, and sets the `source` signal to `undefined`.
