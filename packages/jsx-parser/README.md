<p>
  <img width="100%" src="" alt="Solid Primitives parser">
</p>

# @solid-primitives/parser

A primitive to extend the types of values JSX can return. These JSX-elements are named `tokens`.

- [`createJSXParser`](#createJSXParser) — Provides the tools to create and identify `tokens`: `createToken`, `childrenTokens`, `isToken` and `$TOKEN`.
- [`createToken`](#createToken) — Instantiates a `token` associated with the corresponding jsx-parser.
- [`childrenTokens`](#childrenTokens) — A function similar to Solid's `children()`, but that will only return valid `tokens` created by the corresponding jsx-parser's `createToken`
- [`isToken`](#isToken) — A function to validate if an element is a `token` created by the corresponding jsx-parser's `createToken`
- [`$TOKEN`](#$TOKEN) — The symbol unique to the corresponding jsx-parser

## Installation

```bash
npm install @solid-primitives/jsx-parser
# or
yarn add @solid-primitives/parser
# or
pnpm add @solid-primitives/parser
```

## `createJSXParser`

Provides the tools to create and identify `tokens`.

### How to use it

`createJSXParser` takes an optional id as argument, and returns the following functions `createToken`, `childrenTokens`, `isToken` and the symbol associated with the jsx-parser `$TOKEN`.

It also takes as a generic the union of accepted token-types.

```tsx
import { createJSXParser } from "@solid-primitives/jsx-parser";

type UnionOfAcceptedTokens = Token1 | Token2 | ...

const {createToken, childrenTokens, isToken, $TOKEN} = createJSXParser<UnionOfAcceptedTokens>('parser-example');
```

## `createToken`

A function to create a `token` associated with the corresponding jsx-parser.

### How to use it

`createToken` takes two callback-arguments: the first callback returns the token, an optional second callback returns a JSXElement. This second callback is used when the token is being rendered by Solid. If the second callback is not present, the following error will be shown instead: `tokens can only be rendered inside a Parser with id ...`

It takes as generic two types: the props of the associated JSX-element and the return-value of the token.

```tsx
type Props = {
  id: string;
};

type Token = {
  props: Props;
  value: number;
};

const TokenExample = createToken<Props, Token>(
  props => {
    const value = Math.random();
    return {
      props,
      value
    };
  },
  props => {
    return <span>{props.id}</span>;
  }
);
```

This token can then be used as a JSX-element inside your solid-code:

```tsx
const App = () => {
  return <TokenExample id="id" />;
};
```

TokenExample is typed as a JSXElement, this is so TokenExample can be used in JSX without causing type-errors.

## `childrenTokens`

A function similar to Solid's [`children()`](https://www.solidjs.com/docs/latest#children), but that will only return valid `tokens` created by the corresponding jsx-parser's `createToken`

### How to use it

`childrenTokens` takes a callback returning `props.children`, and will return all tokens associated with the corresponding jsx-parser. Just like Solid's `children`, `childrenTokens` will resolve the tokens: multiple `childrenTokens` of the same `props.children` will execute the token-callback multiple times!

```tsx
const tokens = childrenTokens(() => props.children);
```

## `isToken`

A function to validate if a value is a token created by the corresponding jsx-parser, by checking if the value contains the `$TOKEN`-symbol.

### How to use it

`isToken` takes a value, often this would be a JSXElement. The function returns `false` in case the value is not a token created by the corresponding jsx-parser. In case the value is a token `isToken` returns the value cast to a `token`.

```tsx
const value = props.children[0]; // value is typed as a JSXElement
const token = isToken(value);
if (!token) return;
token; // token is typed as UnionOfAcceptedTokens
```

## `$TOKEN`

The symbol which is attached to all tokens of the corresponding jsx-parser. This is internally used in `childrenTokens` and `isToken` to validate if a value is a token.

### How to use it

`$TOKEN` can be used for validation.

```tsx
const value = props.children[0];
if (!($TOKEN in value)) return;
const token = value as UnionOfAcceptedTokens;
```

## Demo

TODO

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
