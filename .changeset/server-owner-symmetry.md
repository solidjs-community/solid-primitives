---
"@solid-primitives/event-listener": patch
"@solid-primitives/interaction": patch
"@solid-primitives/keyboard": patch
"@solid-primitives/scroll": patch
"@solid-primitives/media": patch
"@solid-primitives/utils": patch
"@solid-primitives/static-store": patch
---

Make client-only effects transparent to Solid 2 hydration and call hydratable helpers’ onSettled on both server and client so later nodes bind correctly.
