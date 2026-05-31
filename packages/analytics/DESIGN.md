# Analytics Primitive — Design Document

## Goals

1. Provide idiomatic Solid 2.0 `make*` / `create*` primitives for analytics tracking.
2. Be **plugin-compatible** with the [`analytics`](https://www.npmjs.com/package/analytics) npm package so that any existing plugin (GA4, Segment, Amplitude, Mixpanel, etc.) from the [plugin catalogue](https://www.npmjs.com/package/analytics#analytic-plugins) can be dropped in without modification. **No first-party plugins are maintained here.**
3. Expose a simple **event queue** that buffers events while plugins are still initializing, then drains automatically once all plugins are ready.
4. Stay **isomorphic** — no-ops on the server, full functionality in the browser.

---

## Plugin Interface

Plugins follow the same contract as the `analytics` npm package:

```ts
interface AnalyticsPlugin {
  name: string;
  config?: Record<string, unknown>;

  // Called once when the plugin is registered.
  initialize?: (args: { config: Record<string, unknown> }) => void | Promise<void>;

  // Polled to determine whether an async script has finished loading.
  loaded?: () => boolean;

  // Event handlers — each receives payload + config + an abort() fn.
  page?:     (args: PluginArgs<PagePayload>)     => void | Promise<void>;
  track?:    (args: PluginArgs<TrackPayload>)    => void | Promise<void>;
  identify?: (args: PluginArgs<IdentifyPayload>) => void | Promise<void>;
}
```

Calling `abort()` inside a plugin handler stops further plugins from receiving that event (sequential dispatch model).

Existing community plugins for the `analytics` npm package implement the same interface and are therefore directly compatible.

---

## Event Payloads

```
PagePayload     → { type: "page",     properties: PageProperties, meta: EventMeta }
TrackPayload    → { type: "track",    event: string, properties, meta }
IdentifyPayload → { type: "identify", userId: string, traits, meta }

EventMeta       → { rid: string, ts: number }   (request ID + timestamp)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  createAnalytics / makeAnalytics                        │
│                                                         │
│  ┌──────────────┐   dispatch()   ┌──────────────────┐  │
│  │  page()      │──────────────▶ │                  │  │
│  │  track()     │                │   Plugin         │  │
│  │  identify()  │                │   Registry       │  │
│  └──────────────┘                │                  │  │
│                                  │  isReady(plugin) │  │
│                                  └────────┬─────────┘  │
│                                           │             │
│                              ready?       │             │
│                          ┌────yes─────────┤             │
│                          │                │ no          │
│                          ▼                ▼             │
│                   send sequential    EventQueue         │
│                   to each plugin     (FIFO, bounded)    │
│                                           │             │
│                                    poll timer           │
│                                    (500 ms default)     │
│                                           │             │
│                                    allReady? → drain    │
└─────────────────────────────────────────────────────────┘
```

### Dispatch pipeline

Events are dispatched **sequentially** through the plugin list. Each plugin can call `abort()` to prevent subsequent plugins from receiving the event. This mirrors the analytics npm package middleware model.

### Queue

A bounded FIFO `EventQueue` (default limit: 100 events) stores events when one or more plugins are not yet ready. The queue is drained automatically:

- When `initialize()` resolves for a plugin and `allReady()` becomes true.
- On each poll-timer tick (default 500 ms) that observes `allReady()`.
- When a plugin added via `use()` causes `allReady()` to flip to true.

---

## API

### `makeAnalytics(plugins, options?)`

Non-reactive base primitive. Returns `[AnalyticsControls, cleanup]`. The consumer is responsible for calling `cleanup()` to stop the poll timer.

```ts
import googleAnalytics from "@analytics/google-analytics";
const [analytics, cleanup] = makeAnalytics([googleAnalytics({ measurementId: "G-xxx" })]);
analytics.page({ title: "Home" });
analytics.track("signup", { plan: "pro" });
analytics.identify("u-1", { email: "alice@example.com" });
analytics.use(anotherPlugin);
cleanup();
```

### `createAnalytics(plugins, options?)`

Reactive primitive that integrates with Solid's owner tree. Auto-cleans up on disposal. Adds two reactive signals:

- `initialized: Accessor<boolean>` — true when all plugins have initialized and `loaded()` returns true.
- `pendingCount: Accessor<number>` — number of events currently queued.

```ts
import googleAnalytics from "@analytics/google-analytics";
const analytics = createAnalytics([googleAnalytics({ measurementId: "G-xxx" })]);

// Use in JSX:
<Show when={analytics.initialized()}>
  <TrackingReady />
</Show>
<p>Pending events: {analytics.pendingCount()}</p>
```

## Options

```ts
type AnalyticsOptions = {
  queueLimit?:    number;  // max queued events, default 100
  retryInterval?: number;  // ms between plugin-readiness checks, default 500
};
```

---

## Solid 2.0 Patterns Used

| Concern | Pattern |
|---|---|
| Server detection | `isServer` from `@solidjs/web` |
| Reactive state | `createSignal` (plain, no ownedWrite needed — writes from async callbacks) |
| Lifecycle cleanup | `tryOnCleanup` from `@solid-primitives/utils` |
| No reactive scope required | All dispatches are imperative (event handlers, timers) |

No `createEffect`, `createMemo`, or `createResource` are needed — analytics tracking is inherently imperative. Signals are used only to expose observable state (`initialized`, `pendingCount`) to consumers.

---

## Non-Goals

- **First-party plugins** — use the [analytics plugin catalogue](https://www.npmjs.com/package/analytics#analytic-plugins) directly. No plugins are maintained in this package.
- Middleware/transform pipeline on payload values (plugins handle their own transformations).
- Persistent event log / replay across page loads.
- Built-in retry logic for failed plugin calls (plugins are responsible for their own error handling).
- Replacing the full `analytics` npm package — this primitive is intentionally simpler.

---

## Future Improvements

- `withMiddleware(fn)` — a payload transformer before dispatch.
- Per-plugin event filtering (route-based, user-segment-based).
- Offline/service-worker queue persistence.
- Additional first-party plugins (Segment, Mixpanel, Plausible).
