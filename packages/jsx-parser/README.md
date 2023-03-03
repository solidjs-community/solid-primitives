<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=JSX%20Parser" alt="Solid Primitives JSX Parser">
</p>

# @solid-primitives/jsx-parser

A primitive to extend the types of values JSX can return. These JSX-elements are named `tokens`.

- [`createJSXParser`](#createJSXParser) — Creates a JSX Parser that can be used to create tokenized components and parse JSX Elements for tokens.
- [`createToken`](#createToken) — Creates a token component associated with the corresponding jsx-parser.
- [`resolveTokens`](#resolveTokens) — A function similar to Solid's `children()`, but that will only return valid token elements created by the corresponding parser's `createToken`
- [`isToken`](#isToken) — A function to validate if an element is a `token` created by the corresponding parser's `createToken`

## Installation

```bash
npm install @solid-primitives/jsx-parser
# or
pnpm add @solid-primitives/jsx-parser
# or
yarn add @solid-primitives/jsx-parser
```

## `createJSXParser`

Creates a JSX Parser that can be used to create tokenized components and parse JSX Elements for tokens.

### How to use it

`createJSXParser` takes an optional options param with `name` property to identify the parser during development.

It also takes as a generic the union of accepted token-types.

```tsx
import { createJSXParser } from "@solid-primitives/jsx-parser";

type UnionOfAcceptedTokens = Token1 | Token2 | ...

const parser = createJSXParser<UnionOfAcceptedTokens>('parser-example');
```

## `createToken`

Creates a token component associated with the corresponding jsx-parser.

### How to use it

`createToken` takes three parameters:

- `parser` object returned by `createJSXParser`
- `tokenData` function that returns the data of the token _(if one isn't passed, props will be used as data)_
- `render` function that returns the fallback JSX Element to render _(if one isn't passed, nothing will get rendred)_

```tsx
import { createToken } from "@solid-primitives/jsx-parser";

const TokenExample = createToken(
  parser,
  // function that returns the data of the token - called when the token is resolved by `resolveTokens`
  (props: { id: string }) => {
    const value = Math.random();
    return {
      props,
      value,
    };
  },
  // function that returns the fallback JSX Element to render - called when the token rendered by Solid
  props => <span>{props.id}</span>,
);
```

This token can then be used inside JSX as a component:

```tsx
const App = () => {
  return <TokenExample id="id" />;
};
```

TokenExample is typed as a JSXElement, this is so TokenExample can be used in JSX without causing type-errors.

## `resolveTokens`

A function similar to Solid's [`children()`](https://www.solidjs.com/docs/latest#children), but that will only return valid token elements created by the corresponding parser's `createToken`

### How to use it

`createToken` takes three parameters:

- `parser` object returned by `createJSXParser`
- `fn` accessor that returns a JSX Element
- `render` function that returns the fallback JSX Element to render

`resolveTokens` will return accessor of tokens associated with the corresponding jsx-parser

Token data is available on the `data` property of the token.

```tsx
import { resolveTokens } from "@solid-primitives/jsx-parser";

const tokens = resolveTokens(parser, () => props.children);

createEffect(() => {
  tokens().forEach(token => {
    // token is a function that returns the JSX Element fallback
    // token.data is the data returned by the tokenData function
    console.log(token.data);
  });
});
```

### `resolveData`

If you never intend to render the tokens, you can use `resolveData` instead of `resolveTokens`. This will return the data of the tokens instead of the JSX Element fallback.

```tsx
import { resolveData } from "@solid-primitives/jsx-parser";

const tokens = resolveData(parser, () => props.children);

createEffect(() => {
  tokens().forEach(token => {
    // token is the data returned by the tokenData function
    console.log(token);
  });
});
```

## `isToken`

A function to validate if a value is a token created by the corresponding jsx-parser.

### How to use it

`isToken` takes a value, often this would be a JSXElement. The function returns `false` in case the value is not a token created by the corresponding jsx-parser. In case the value is a token `isToken` returns the value cast to a `token`.

```tsx
const value = props.children[0]; // value is typed as a JSXElement
const token = isToken(value);
if (!token) return;
token; // token is typed as UnionOfAcceptedTokens
```

## Demo

A working example can be found in the [dev folder](./dev/index.tsx).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
