<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Props" alt="Solid Primitives Props">
</p>

# @solid-primitives/props

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/props?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/props)
[![size](https://img.shields.io/npm/v/@solid-primitives/props?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/props)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Library of primitives focused around component props.

- [`combineProps`](#combineProps) - Reactively merges multiple props objects together while smartly combining some of Solid's JSX/DOM attributes.
- [`createProps`](#createProps) - Provides controllable props signals like knobs/controls for simple component testing.

## Installation

```
npm install @solid-primitives/props
# or
yarn add @solid-primitives/props
```

## `combineProps`

A helper that reactively merges multiple props objects together while smartly combining some of Solid's JSX/DOM attributes.

Event handlers _(onClick, onMouseMove)_, **(every function property with name mathing `on[A-Z].\*` get's chained – lowercase like "onclick" will NOT)** and refs _(props.ref)_ are chained.

`class`, `className`, `classList` and `style` are combined.

For all other props, the last prop object overrides all previous ones. Similarly to Solid's [mergeProps](https://www.solidjs.com/docs/latest/api#mergeprops).

### How to use it

```tsx
import { combineProps } from "@solid-primitives/props";

const MyButton: Component<ButtonProps> = props => {
  // primitives of a lot of headless ui libraries will provide props to spread
  const { buttonProps } = createButton();
  // they can be combined with user's props easily
  const combined = combineProps(props, buttonProps);

  return <button {...combined} />;
};

// component consumer can provide button props
// they will be combined with those provided by createButton() primitive
<MyButton style={{ margin: "24px" }} />;
```

### Additional helpers

A couple of lower-lever helpers that power `combineProps`:

#### `stringStyleToObject`

```ts
const styles = stringStyleToObject("margin: 24px; border: 1px solid #121212");
styles; // { margin: "24px", border: "1px solid #121212" }
```

#### `combineStyle`

```ts
const styles = combineStyle("margin: 24px; border: 1px solid #121212", {
  margin: "2rem",
  padding: "16px"
});
styles; // { margin: "2rem", border: "1px solid #121212", padding: "16px" }
```

## `createProps`

Primitive that provides controllable props signals like knobs/controls for simple component testing

### How to use it

You can either create a single prop:

```ts
// Second argument can be initialValue for boolean, number, string:
const [string, setString, stringField] = createControlledProp("stringValue", "test");
// Arrays or enums can be provided in an options object:
const [language, setLanguage, languageField] = createControlledProp(
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
const [currency, setCurrency, currencyField] = createControlledProp("currency", {
  initialValue: Currency.USD,
  options: Currency
});

return { languageField(); };
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

### Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release

1.0.2

Release initial version with CJS support.

2.0.0 - [PR#127](https://github.com/solidjs-community/solid-primitives/pull/127)

Renamed `createProps` to `createControlledProps`, `createProp` to `createControlledProp` etc. (for all of the primitives focused on testing)

Added `combineProps` primitive

</details>
