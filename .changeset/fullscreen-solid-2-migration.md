---
"@solid-primitives/fullscreen": major
---

Migrate `@solid-primitives/fullscreen` to Solid.js 2.0 (beta.7).

**Breaking changes:**

- Peer dependency updated from `solid-js ^1.6.12` to `solid-js ^2.0.0-beta.7` and `@solidjs/web ^2.0.0-beta.7`.
- The `use:createFullscreen` JSX directive (Solid 1.x `use:` namespace) is removed. Use the new `fullscreen()` ref directive factory instead:

  ```tsx
  // Before (Solid 1.x)
  <div use:createFullscreen={fs} />

  // After (Solid 2.0)
  <div ref={fullscreen(fs)} />
  ```

**New exports:**

- `fullscreen(active?, options?)` — ref directive factory that wraps `createFullscreen` for direct use on JSX elements via the `ref` prop.

**Internal changes:**

- `isServer` now imported from `@solidjs/web` (was `solid-js/web`).
- `createEffect` updated to Solid 2.0 split compute/effect signature.
- Test mock fixed: `document.fullscreenElement` is now a dynamic getter reflecting current fullscreen state; `document.exitFullscreen` now dispatches `fullscreenchange` matching browser behaviour.
