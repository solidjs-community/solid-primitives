---
"@solid-primitives/keyed": patch
"@solid-primitives/share": patch
"@solid-primitives/analytics": patch
---

Fix package manifests. `keyed` and `share` import `@solid-primitives/utils` at runtime but did not declare it, so the import could not be resolved under strict installs (pnpm, Yarn PnP). It is now a dependency. `analytics` no longer declares the legacy optional peer `@tanstack/start`: the TanStack relay takes the user's `createServerFn` and imports nothing from TanStack.
