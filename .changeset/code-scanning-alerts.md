---
"@solid-primitives/i18n": patch
"@solid-primitives/sse": patch
---

Fix two CodeQL code scanning alerts.

- `@solid-primitives/i18n`: `richText` no longer takes quadratic time on strings with many unclosed tags such as `<a><a><a>…` (polynomial ReDoS). It now finds tags linearly with the same output, and a tag named after an inherited `Object` property such as `<constructor>` is no longer called as a renderer.
- `@solid-primitives/sse`: the worker handler only calls a stored cleanup function when it is one, so a hostile connection id in a `postMessage` can't trigger an unexpected call.
