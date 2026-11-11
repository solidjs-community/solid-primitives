---
"@solid-primitives/favicon": major
---

New package: `@solid-primitives/favicon`

Primitives for controlling the document favicon, built for Solid 2.0 (beta.24).

### `makeFavicon` / `createFavicon`

Non-reactive base and reactive primitive for swapping the favicon `<link>` href. Reuses an existing `<link rel="icon">` if present and restores its previous href on `dispose()`/cleanup; creates and removes one otherwise. Nested/sequential calls compose correctly under normal mount/unmount ordering.

### `makeFaviconAnimation` / `createFaviconAnimation`

Cycles the favicon through a sequence of hrefs on an interval — for build-status spinners and similar loading indicators. The reactive version accepts a static or reactive frame list, exposes `frame`/`playing` signals and `play`/`pause`, and automatically pauses while the tab is hidden (`document.visibilitychange`), resuming if it was playing before.

### `makeFaviconBadge` / `createFaviconBadge`

Composites a notification count, short string, or plain dot onto a base icon via an offscreen canvas. `0`/`false`/`undefined`/`""` render no badge; `true` renders a dot; numbers clamp to `"{max}+"`. Falls back to the plain base href if the base image fails to load.

### `makeFaviconScheme` / `createFaviconScheme`

Swaps between a light/dark icon to match `prefers-color-scheme`, staying in sync via a `matchMedia` listener as the OS/browser preference changes. Treats SSR as `"light"` (no reliable server-side signal for OS theme).

### `makeFaviconProgress` / `createFaviconProgress`

Composites a progress ring (0–100, clamped) onto a base icon via an offscreen canvas — for upload/download-style indicators. `undefined` shows the base icon with no ring; `0` still draws the (empty) ring track. Falls back to the plain base href if the base image fails to load.

### `FaviconLink`

A component that renders the favicon `<link>` directly, so its initial href is part of the server-rendered HTML instead of only applying once client JS hydrates. Place it once in your document's real `<head>` region (e.g. your SSR framework's root document component); any `make*`/`create*` call elsewhere composes with it automatically, since `bindFaviconLink`'s existing "reuse an existing link" lookup finds and takes over the exact element it rendered.

### Design notes

Rather than one `createAdvancedFavicon` combining all of this behind an options object, each capability is its own small `make*`/`create*` pair sharing internal DOM (`link.ts`) and canvas (`canvas.ts`) helpers — consistent with this repo's existing layered-primitive packages (e.g. `video`). See [DESIGN.md](../packages/favicon/DESIGN.md) for the full reasoning.
