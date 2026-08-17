---
"@solid-primitives/i18n": minor
---

Add an optional `onMissingKey` third argument to `translator()`, called when the dictionary is loaded but has no value at the requested path — as opposed to when the dictionary itself isn't available yet, which still resolves to `undefined` regardless (resolves #765). Also export `missingKeyAsPath`, a ready-made handler that falls back to the requested path itself (e.g. `"food.meat"`), making missing translations visible in the UI instead of silently rendering blank. The default behavior (no handler passed) is unchanged — missing keys still resolve to `undefined`, matching the existing `NullableTranslator`/`scopedTranslator` documented behavior — so this is purely additive and opt-in.
