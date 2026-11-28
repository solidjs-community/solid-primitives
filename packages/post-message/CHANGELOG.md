# @solid-primitives/post-message

## 0.1.0

### Minor Changes

- 0e88ead: Initial release of `@solid-primitives/post-message`: `makePostMessage` and `createPostMessage` for window, iframe and `MessagePort` messaging with `allowedOrigins`, explicit `targetOrigin`, source filtering, type-narrowing validators and namespaced channels.

  Target detection is cross-origin safe: a `Window` is recognised first via the cross-origin-accessible `window` property, so `iframe.contentWindow`, `window.opener` and `window.parent` of another origin work without throwing a `SecurityError`.
