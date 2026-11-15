---
"@solid-primitives/props": patch
"@solid-primitives/graphql": patch
---

Fix two regular expressions that could take very long on crafted input (flagged by CodeQL).

- `props`: `stringStyleToObject` (and so `combineStyle` with string styles) used a regex with nested quantifiers that backtracked catastrophically: 26 characters took over a second and every extra character doubled it, and long hyphenated runs were quadratic. It now scans the declarations in linear time. Results are unchanged for valid CSS; a name with an embedded `--` after word characters (not valid CSS) is now returned whole instead of being cut at the `--`.
- `graphql`: the comment-stripping regex in `gql` was quadratic on long runs of `#` (160k characters took about 19 seconds). It is now linear. This also fixes a bug where a bare `#` line commented out the following line, and comments on the last line are now removed too.
