<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=JSX%20Tokenizer" alt="Solid Primitives JSX Tokenizer">
</p>

# @solid-primitives/jsx-tokenizer

[![version](https://img.shields.io/npm/v/@solid-primitives/jsx-tokenizer?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/jsx-tokenizer)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

A set of primitives that help safely pass data through JSX to the parent component using [token components](#createToken).

This pattern is very useful when you want to use JSX to create a declarative API for your components. It lets you resolve the JSX structure and pass the data to the parent component without triggering rendering of the children - it puts the parent in control over what getting rendered.

- [`createTokenizer`](#createTokenizer) — Creates a JSX Tokenizer that can be used to create multiple token components with the same id.
- [`createToken`](#createToken) — Creates a token component for passing custom data through JSX structure.
- [`resolveTokens`](#resolveTokens) — Resolves passed JSX structure, searching for tokens with the given tokenizer id.
- [`isToken`](#isToken) — Checks if passed value is a token created by the corresponding jsx-tokenizer.

## Installation

```bash
npm install @solid-primitives/jsx-tokenizer
# or
pnpm add @solid-primitives/jsx-tokenizer
# or
yarn add @solid-primitives/jsx-tokenizer
```

## `createTokenizer`

Creates a JSX Tokenizer that can be used to create multiple token components with the same id and resolve their data from the JSX Element structure.

### How to use it

`createTokenizer` takes an optional options param with `name` property to identify the parser during development.

It also a generic type representing the union of accepted token data.

```tsx
import { createTokenizer, createToken, resolveTokens } from "@solid-primitives/jsx-tokenizer";

const Tokenizer = createTokenizer<Token1 | Token2>({
  name: "Example Tokenizer", // optional (used for warnings during development)
});

// lets you create multiple token components with the same id:
const MyTokenA = createToken(Tokenizer, props => ({ type: "A" }));

const MyTokenB = createToken(Tokenizer, props => ({ type: "B" }));

function ParentComponent(props) {
  const tokens = resolveTokens(Tokenizer, () => props.children);
  return (
    <ul>
      <For each={tokens()}>{token => <li>{token.data.type}</li>}</For>
    </ul>
  );
}

<ParentComponent>
  <MyTokenA />
  <MyTokenB />
</ParentComponent>;
```

## `createToken`

Creates a token component for passing custom data through JSX structure.

The token component can be used as a normal component in JSX.

When resolved by [`resolveTokens`](#resolvetokens) it will return the data passed to it.

But when resolved normally (e.g. using the `children()` helper) it will return the fallback JSX Element.

### How to use it

`createToken` takes three parameters: (all are optional)

- `tokenizer` - identity object returned by [`createTokenizer`](#createtokenizer) or other token component. If not passed, a new tokenizer id will be created. _(If not passed, a new tokenizer id will be created.)_
- `tokenData` - function that returns the data of the token _(if one isn't passed, props will be used as data)_
- `render` - function that returns the fallback JSX Element to render _(If not passed, the token will render nothing and warn in development.)_

```tsx
import { createToken } from "@solid-primitives/jsx-tokenizer";

const TokenExample = createToken(
  // identity object returned by `createTokenizer` or other token component
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
const Child = () => {
  return <TokenExample id="id" />;
};
```

TokenExample is typed as a JSXElement, this is so TokenExample can be used in JSX without causing type-errors.

### Using without tokenizer

If `createToken` is called without a tokenizer, it will create a new tokenizer id by itself. Then the token component can be used in `resolveTokens` as the tokenizer in the same way as if it was created with `createTokenizer`.

```tsx
import { createToken, resolveTokens } from "@solid-primitives/jsx-tokenizer";

function Tabs<T>(props: { children: (Tab: Component<{ value: T }>) => JSX.Element; active: T }) {
  const Tab = createToken((props: { value: T }) => props.value);
  // resolveTokens will look for tokens created by Tab component
  const tokens = resolveTokens(Tab, () => props.children(Tab));
  return (
    <ul>
      <For each={tokens()}>
        {token => <li classList={{ active: token.data === props.active }}>{token.data}</li>}
      </For>
    </ul>
  );
}

// usage
<Tabs active="tab1">
  {Tab => (
    <>
      <Tab value="tab1" />
      <Tab value="tab2" />
    </>
  )}
</Tabs>;
```

## `resolveTokens`

A function similar to Solid's [`children()`](https://www.solidjs.com/docs/latest#children). Resolves passed JSX structure, searching for tokens with the given tokenizer id.

### How to use it

`resolveTokens` takes three parameters:

- `tokenizer` - identity object returned by [`createTokenizer`](#createTokenizer) or a token component. An array of multiple tokenizers can be passed.
- `fn` accessor that returns a JSX Element (e.g. `() => props.children`)
- `options` options for the resolver:
  - `includeJSXElements` - if `true`, other JSX Elements will be included in the result array (default: `false`)

`resolveTokens` will return a signal that returns an array of resolved tokens and JSX Elements.

Token data is available on the `data` property of the token.

```tsx
import { resolveTokens } from "@solid-primitives/jsx-tokenizer";

const tokens = resolveTokens(tokenizer, () => props.children);

createEffect(() => {
  tokens().forEach(token => {
    // token is a function that returns the JSX Element fallback
    // token.data is the data returned by the tokenData function
    console.log(token.data);
  });
});

// the return value of resolveTokens can be used in JSX (will render the fallback JSX Elements)
return <>{els()}</>;
```

### Resolve JSX Elements with `resolveTokens`

If you want to resolve the JSX Elements as well, you can pass `{ includeJSXElements: true }` as the third parameter to `resolveTokens`.

Use [`isToken`](#istoken) to validate if a value is a token created by the corresponding jsx-tokenizer.

```tsx
import { resolveTokens, isToken } from "@solid-primitives/jsx-tokenizer";

const els = resolveTokens(tokenizer, () => props.children, {
  includeJSXElements: true,
});

createEffect(() => {
  els().forEach(el => {
    if (!isToken(tokenizer, el)) {
      // el is a normal JSX Element
      return;
    }
    // token is a function that returns the JSX Element fallback
    // token.data is the data returned by the tokenData function
    console.log(token.data);
  });
});

// the return value of resolveTokens can be used in JSX
return <>{els()}</>;
```

### Resolve multiple tokenizers

If you want to resolve multiple tokenizers at once, you can pass an array of tokenizers as the first parameter to `resolveTokens`.

```tsx
import { resolveTokens } from "@solid-primitives/jsx-tokenizer";

const els = resolveTokens([tokenizer1, tokenizer2, MyTokenComponent], () => props.children);
```

### Usage with Context API

Since `resolveTokens` is eagerly resolving the JSX structure, if you want to provide context for the tokens to be accessed in the `tokenData` function, you have to wrap `resolveTokens` with the provider:

```tsx
function ParentComponent(props) {
  return (
    <MyContext.Provider value={{} /* some value */}>
      {untrack(() => {
        const tokens = resolveTokens(tokenizer, () => props.children);

        // handle tokens ...

        return <>{tokens()}</>;
      })}
    </MyContext.Provider>
  );
}
```

Also if you should be wary of placing context providers in between the component resolving the tokens and tokens passed as children. This will cause the context to be available in the `tokenData` function, but not necessarily when resolving the children of the tokens - as it might happen asynchronously under a different owner.

For example, [`@solidjs/router`](https://github.com/solidjs/solid-router) which uses the same pattern, will break if you put a context provider between the `<Routes />` and `<Route />` components.

```tsx
// this will break
function App() {
  return (
    <Routes>
      <MyContext.Provider value={{} /* some value */}>
        {/*
          <Route> component prop is not rendered immediately, it is rendered within <Routes>
          as later time, so the context will not be available in Home component
        */}
        <Route path="/" component={Home} />
      </MyContext.Provider>
    </Routes>
  );
}

function Home() {
  const ctx = useContext(MyContext);
  ctx; // => undefined
}

// do this instead
function App() {
  return (
    <MyContext.Provider value={{} /* some value */}>
      <Routes>
        <Route path="/" component={Home} />
      </Routes>
    </MyContext.Provider>
  );
}
```

## `isToken`

A function to validate if a value is a token created by the corresponding jsx-tokenizer.

### How to use it

`isToken` takes a value, often this would be a JSXElement. The function returns `false` in case the value is not a token created by the corresponding jsx-tokenizer. In case the value is a token `isToken` returns the value cast to a `token`.

```tsx
const token = props.children[0]; // value is typed as a JSXElement
if (!isToken(tokenizer, token)) return;
token; // token is typed as UnionOfAcceptedTokens
```

`isToken` can take an array of tokenizers as the first parameter. In this case it will return `false` if the value is not a token created by any of the tokenizers.

```tsx
isToken([tokenizer1, tokenizer2, MyTokenComponent], token);
```

## Demo

[Live Example](https://primitives.solidjs.community/playground/jsx-tokenizer) | [Source Code](./dev/index.tsx)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
