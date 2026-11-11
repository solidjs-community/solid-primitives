---
"@solid-primitives/i18n": minor
---

`onMissingKey` handlers now also receive the arguments passed to the translator after the path, and a new `missingKeyAsTemplate(resolveTemplate)` handler resolves the missing path itself as a template. Together they support using source-language text as keys — `t("Hello {{ name }}!", { name })` — with the source text as the fallback and other locales' dictionaries keyed by that text, with no key extraction or build tooling required (related to #493). Existing handlers are unaffected; the extra arguments are ignored by handlers that only take `path`.

The translator now looks up only a dictionary's own keys, so inherited names such as `"toString"` count as missing instead of resolving to `Object.prototype` methods.
