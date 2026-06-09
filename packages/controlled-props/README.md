<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Controlled%20Props" alt="Solid Primitives Controlled Props">
</p>

# @solid-primitives/controlled-props

[![size](https://img.shields.io/badge/size-849_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/controlled-props)
[![size](https://img.shields.io/npm/v/@solid-primitives/controlled-props?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/controlled-props)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

[**Docs & demos**](https://primitives.solidjs.community/package/controlled-props)

Library of helpers for creating your own component prototyping tool. _(a Storybook alternative if you will)_ The primitives in this package allow you to create controlls for component props.

## Installation

```bash
npm install @solid-primitives/controlled-props
# or
yarn add @solid-primitives/controlled-props
# or
pnpm add @solid-primitives/controlled-props
```

## `createControlledProp`

Primitive that provides controllable props signals like knobs/controls for simple component testing.

### How to use it

You can either create a single prop:

```ts
// Second argument can be initialValue for boolean, number, string:
const [string, setString, stringField] = createControlledProp("stringValue", "test");

// Number with min/max/step:
const [count, setCount, countField] = createControlledProp("count", {
  initialValue: 5,
  min: 1,
  max: 10,
  step: 2,
});

// Range slider:
const [opacity, setOpacity, opacityField] = createControlledProp("opacity", {
  initialValue: 50,
  min: 0,
  max: 100,
  type: "range",
});

// Arrays or enums can be provided in an options object:
const [language, setLanguage, languageField] = createControlledProp(
  "language",
  { initialValue: "en", options: ["de", "en", "fr", "it"] as const }
  // If you want your array to be able to influence the setter/getter types, use `as const`.
);

enum Currency { AUD, GBP, EUR, USD, CHF, JPY, CNY }
const [currency, setCurrency, currencyField] = createControlledProp("currency", {
  initialValue: Currency.USD,
  options: Currency
});

return <>{languageField()}</>;
```

or multiple props in one call:

```ts
enum Test { One, Two, Three };
const languages = ['de', 'en', 'fr', 'it'] as const;
const [props, fields] = createControlledProps({
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

### Control type inference

| Initial value type | `type` option | Rendered control |
|--------------------|---------------|------------------|
| `boolean` | — | `<input type="checkbox">` |
| `number` | — | `<input type="number">` |
| `number` | `"range"` | `<input type="range">` (slider) |
| `string` | — | `<input type="text">` |
| any + `options` array/enum | — | `<select>` |

### Exported field components

The individual field components are exported if you need them standalone:

```ts
import { BoolProp, NumberProp, RangeProp, StringProp, SelectProp } from "@solid-primitives/controlled-props";
```

`RangeProp` renders a slider with a live value readout and accepts `min`, `max`, and `step` props.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
