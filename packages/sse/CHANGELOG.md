# @solid-primitives/sse

## 0.0.101

### Patch Changes

- Updated dependencies [6680ab9]
  - @solid-primitives/utils@6.4.0

## 0.0.100

### Initial release

- `makeSSE` — base non-reactive primitive wrapping the browser `EventSource` API
- `createSSE` — reactive primitive with signals for `data`, `error`, and `readyState`, reactive URL support, SSR safety, and configurable app-level reconnection
