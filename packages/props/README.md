---
Name: props
Stage: 3
Package: "@solid-primitives/props"
Primitives: createProps
---

# @solid-primitives/props

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/props?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/props)
[![size](https://img.shields.io/npm/v/@solid-primitives/props?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/props)

Creates a primitive to provide props signals for simple component testing

## How to use it

You can either create a single prop:

```ts
// Second argument can be initialValue for boolean, number, string:
const [string, setString, stringField] = createProp("stringValue", "test");
// Arrays or enums can be provided in an options object:
const [language, setLanguage, languageField] = createProp(
  "language",
  { initialValue: "en", options: ["de", "en", "fr", "it"] as const }
  // If you want your array to be able to influence the setter/getter types, use `as const`.
);
enum Currency {
  AUD,
  GBP,
  EUR,
  USD,
  CHF,
  JPY,
  CNY
}
const [currency, setCurrency, currencyField] = createProp("currency", {
  initialValue: Currency.USD,
  options: Currency
});

return { languageField(); };
```

or multiple props in one call:

```ts
enum Test { One, Two, Three };
const languages = ['de', 'en', 'fr', 'it'] as const;
const [props, fields] = createProps({
  boolean: true,
  number: 42,
  string: 'text',
  array: { initialValue: 'en', options: languages },
  enum: { initialValue: Test.Three, options: Test }
});

props == {
  boolean: Accessor<boolean>,
  setBoolean: Setter<boolean>,
  number: Accessor<number>,
  setNumber: Setter<number>,
  string: Accessor<string>,
  setString: Setter<string>,
  array: Accessor<string>,
  setArray: Setter<string>,
  enum: Accessor<Test>,
  setEnum: Setter<Test>
};

fields == JSX.Element[];
```

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release

1.0.1

Release initial version with CJS support.

</details>
