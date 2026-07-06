---
"@solid-primitives/i18n": minor
---

Add rich text support for translations that need to embed JSX (links, formatted text, etc.), resolving #715.

- `resolveRichTemplate` — a `resolveTemplate` variant that accepts JSX values (not just strings) in `{{ placeholder }}` substitutions, returning a plain string when every value is a string, or JSX otherwise.
- `richText(string, tags)` — resolves `<tag>content</tag>` markup in an already-resolved string into JSX, by calling the matching renderer in `tags` with the tag's inner content. Meant to be composed with `resolveTemplate`/`resolveRichTemplate` for `{{ }}` variables. Tag names aren't type-checked against `tags`; an unmapped tag logs a dev-only warning and renders its contents as plain text (stripped from production builds).
- `BaseTemplateArgs` is widened from `Record<string, string | number | boolean>` to `Record<string, unknown>` to allow JSX (or any other value) as a template argument. This is additive and doesn't change any existing behavior — the built-in `resolveTemplate` still stringifies its arguments the same way it always has.
- New peer dependency: `@solidjs/web@^2.0.0-beta.15` (previously only `solid-js` was required), needed for the `JSX.Element` type and the dev-only warning.

The existing pattern of dictionary entries as plain functions returning JSX (e.g. `hello: (name) => <>Hi {name}</>`) already worked before this change and remains the recommended approach for dictionaries fully owned in TS/TSX — the additions here are for dictionaries loaded as translated strings (e.g. from JSON).
