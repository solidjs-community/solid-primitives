---
"@solid-primitives/jsx-tokenizer": major
---

Package got renamed from `jsx-parser` to `jsx-tokenizer`.

Improved jsdoc comments with better descriptions.

`createJSXParser` renamed to `createTokenizer`.

`isToken` and `resolveTokens` can now accept an array of tokenizers to match.

`createToken` can be used without passing a tokenizer. This will create a token with the component function as the tokenizer.
