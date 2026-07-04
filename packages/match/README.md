<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=match" alt="Solid Primitives match">
</p>

# @solid-primitives/match

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/match?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/match)
[![version](https://img.shields.io/npm/v/@solid-primitives/match?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/match)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Control-flow components for matching discriminated union (tagged union) members and union literals.

## Installation

```bash
npm install @solid-primitives/match
# or
yarn add @solid-primitives/match
# or
pnpm add @solid-primitives/match
```

## `MatchTag`

Control-flow component for matching discriminated union (tagged union) members.

### How to use it

```tsx
type MyUnion = {
  type: "foo",
  foo:  "foo-value",
} | {
  type: "bar",
  bar:  "bar-value",
}

const [value, setValue] = createSignal<MyUnion>({type: "foo", foo: "foo-value"})

<MatchTag on={value()} case={{
  foo: v => <>{v().foo}</>,
  bar: v => <>{v().bar}</>,
}} />
```

### Changing the tag key

The default tag key is `"type"`, but it can be changed with the `tag` prop:

```tsx
type MyUnion =
  | {
      kind: "foo";
      foo: "foo-value";
    }
  | {
      kind: "bar";
      bar: "bar-value";
    };

<MatchTag
  on={value()}
  tag="kind"
  case={{
    foo: v => <>{v().foo}</>,
    bar: v => <>{v().bar}</>,
  }}
/>;
```

### Partial matching

Use the `partial` prop to only handle some of the union members:

```tsx
<MatchTag
  partial
  on={value()}
  case={{
    foo: v => <>{v().foo}</>,
    // bar case is not handled
  }}
/>
```

### Fallback

Provide a fallback element when no match is found or the value is `null`/`undefined`:

```tsx
<MatchTag
  on={value()}
  case={{
    foo: v => <>{v().foo}</>,
    bar: v => <>{v().bar}</>,
  }}
  fallback={<div>No match found</div>}
/>
```

## `MatchValue`

Control-flow component for matching union literals.

### How to use it

```tsx
type MyUnion = "foo" | "bar";

const [value, setValue] = createSignal<MyUnion>("foo");

<MatchValue
  on={value()}
  case={{
    foo: () => <p>foo</p>,
    bar: () => <p>bar</p>,
  }}
/>;
```

### Partial matching

Use the `partial` prop to only handle some of the union members:

```tsx
<MatchValue
  partial
  on={value()}
  case={{
    foo: () => <p>foo</p>,
    // bar case is not handled
  }}
/>
```

### Fallback

Provide a fallback element when no match is found or the value is `null`/`undefined`:

```tsx
<MatchValue
  on={value()}
  case={{
    foo: () => <p>foo</p>,
    bar: () => <p>bar</p>,
  }}
  fallback={<div>No match found</div>}
/>
```

## Demo

[Deployed example](https://primitives.solidjs.community/playground/match) | [Source code](https://github.com/solidjs-community/solid-primitives/tree/main/packages/match/dev)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
