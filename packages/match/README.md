<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=match" alt="Solid Primitives match">
</p>

# @solid-primitives/match

[![size](https://img.shields.io/badge/size-164_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/match)
[![version](https://img.shields.io/npm/v/@solid-primitives/match?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/match)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

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

```tsx repl
import { render } from "@solidjs/web";
import { createSignal } from "solid-js";
import { MatchTag } from "@solid-primitives/match";

type Shape = { type: "circle"; radius: number } | { type: "rect"; width: number; height: number };

function Demo() {
  const [shape, setShape] = createSignal<Shape | null>(null);
  return (
    <>
      <button onClick={() => setShape(null)}>none</button>
      <button onClick={() => setShape({ type: "circle", radius: 40 })}>circle</button>
      <button onClick={() => setShape({ type: "rect", width: 80, height: 50 })}>rect</button>
      <MatchTag
        on={shape()}
        case={{
          circle: v => <p>Circle with radius {v().radius}px</p>,
          rect: v => (
            <p>
              Rectangle {v().width} × {v().height}px
            </p>
          ),
        }}
        fallback={<p>No shape selected</p>}
      />
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

> **Note:** `partial` is a TypeScript-only escape hatch — it switches the `case` mapped type from required to optional keys. It has no runtime effect; unmatched values fall through to `fallback` regardless of whether `partial` is set.

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

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { MatchValue } from "@solid-primitives/match";

type Status = "idle" | "loading" | "success" | "error";

function Demo() {
  const [status, setStatus] = createSignal<Status>("idle");
  return (
    <>
      <For each={["idle", "loading", "success", "error"] as const}>
        {s => <button onClick={() => setStatus(s)}>{s}</button>}
      </For>
      <MatchValue
        on={status()}
        case={{
          idle: () => <p>Waiting</p>,
          loading: () => <p>Fetching data…</p>,
          success: () => <p>Data loaded successfully</p>,
          error: () => <p>Request failed</p>,
        }}
      />
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

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

> **Note:** `partial` is a TypeScript-only escape hatch — it has no runtime effect. See [`MatchTag` partial matching](#partial-matching) for details.

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

## `MatchField` (deprecated)

`MatchField` is an alias for `MatchTag` kept for backwards compatibility. Use `MatchTag` in new code.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
