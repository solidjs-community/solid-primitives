---
"@solid-primitives/analytics": major
---

Redesign for Solid.js v2.0 (beta.14) with a queue-based plugin pipeline

## Breaking Changes

**Peer dependencies**: `solid-js@^2.0.0-beta.14` and `@solidjs/web@^2.0.0-beta.14` are now required.

The previous `createAnalytics(handlers)` default export and `EventType` / `TrackHandler` types have been replaced with a richer API:

- **`makeAnalytics(plugins, options?)`** — non-reactive base primitive returning `[controls, cleanup]`
- **`createAnalytics(plugins, options?)`** — reactive primitive returning controls plus `initialized` and `pendingCount` signals

### Plugin format

Plugins follow the [`analytics`](https://www.npmjs.com/package/analytics) npm package interface (`name`, `initialize`, `loaded`, `page`, `track`, `identify`), so any plugin from the [analytics plugin catalogue](https://www.npmjs.com/package/analytics#analytic-plugins) works directly — install it separately and pass it in.

No first-party plugins are bundled in this package.

### Event queue

Events fired before plugins finish initializing are buffered in a bounded FIFO queue and replayed automatically once all plugins report ready. The queue limit and poll interval are configurable via `AnalyticsOptions`.

### Migration

```ts
// Before (v0.x)
import createAnalytics, { EventType } from "@solid-primitives/analytics";
const track = createAnalytics([myHandler]);
track(EventType.Event, { category: "ui", action: "click" });

// After (v1.x) — use any plugin from https://www.npmjs.com/package/analytics#analytic-plugins
import { createAnalytics } from "@solid-primitives/analytics";
import googleAnalytics from "@analytics/google-analytics";

const analytics = createAnalytics([googleAnalytics({ measurementId: "G-xxx" })]);
analytics.track("click", { category: "ui" });
```
