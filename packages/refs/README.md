<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Refs" alt="Solid Primitives Refs">
</p>

# @solid-primitives/refs

[![size](https://img.shields.io/badge/size-668_B-blue?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/refs)
[![version](https://img.shields.io/npm/v/@solid-primitives/refs?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/refs)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-2.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)
[![tested with vitest](https://img.shields.io/badge/tested_with-vitest-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

Collection of primitives, components and directives that help managing references to JSX elements, keeping track of mounted/unmounted elements.

##### Primitives:

- [`mergeRefs`](#mergerefs) - Utility for chaining multiple `ref` assignments with `props.ref` forwarding.
- [`resolveElements`](#resolveelements) - Utility for resolving recursively nested JSX children to a single element or an array of elements.
- [`resolveFirst`](#resolvefirst) - Utility for resolving recursively nested JSX children in search of the first element that matches a predicate.
- [`<Refs>`](#refs) - Get up-to-date references of the multiple children elements.
- [`<Ref>`](#ref) - Get up-to-date reference to a single child element.

## Installation

```bash
npm install @solid-primitives/refs
# or
pnpm add @solid-primitives/refs
# or
yarn add @solid-primitives/refs
```

## `mergeRefs`

Utility for chaining multiple `ref` assignments with `props.ref` forwarding.

```tsx repl
import { render } from "@solidjs/web";
import { mergeRefs, type Ref } from "@solid-primitives/refs";

function TextInput(props: { ref?: Ref<HTMLInputElement> }) {
  let local!: HTMLInputElement;
  // the local ref selects the text on focus, props.ref is forwarded to the parent
  return (
    <input
      ref={mergeRefs(props.ref, el => (local = el))}
      value="Hello refs"
      onFocus={() => local.select()}
    />
  );
}

function Demo() {
  let input!: HTMLInputElement;
  return (
    <>
      <TextInput ref={input} />
      <button onClick={() => input.focus()}>Focus input</button>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

```tsx
import { mergeRefs, Ref } from "@solid-primitives/refs";

interface ButtonProps {
  ref?: Ref<HTMLButtonElement>;
}

function Button(props: ButtonProps) {
  let ref: HTMLButtonElement | undefined;
  onSettled(() => {
    // use the local ref
  });

  return <button ref={mergeRefs(props.ref, el => (ref = el))} />;
}

// in consumer's component:
let ref: HTMLButtonElement | undefined;
<Button ref={ref} />;
```

## `resolveElements`

Utility for resolving recursively nested JSX children to a single element or an array of elements using a predicate.

```tsx repl
import { render, type JSX } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { resolveElements } from "@solid-primitives/refs";

function Tags(props: { children: JSX.Element }) {
  const els = resolveElements(() => props.children);
  return (
    <div>
      <p>
        elements:{" "}
        {els
          .toArray()
          .map(el => el.localName)
          .join(", ")}
      </p>
      {els()}
    </div>
  );
}

function Demo() {
  const [extra, setExtra] = createSignal(false);
  return (
    <>
      <button onClick={() => setExtra(v => !v)}>Toggle &lt;u&gt;</button>
      <Tags>
        <b>bold </b>
        <i>italic </i>
        <Show when={extra()}>
          <u>underline</u>
        </Show>
      </Tags>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

`resolveElements`'s API is similar to Solid's `children` helper. It accepts a function that returns JSX children and a predicate function that filters the elements.

```tsx
function Button(props: ParentProps) {
  const children = resolveElements(() => props.children);
  //      ^?: Accessor<Element | Element[] | null>

  return (
    // Similarly to `children` helper, a `toArray` method is available
    <For each={children.toArray()}>
      {child => (
        <div>
          {child.localName}: {child}
        </div>
      )}
    </For>
  );
}
```

### Using a custom predicate

The default predicate is `el => el instanceof Element`. You can provide a custom predicate to `resolveElements` to filter the elements.

```tsx
const els = resolveElements(
  () => props.children,
  (el): el is HTMLDivElement => el instanceof HTMLDivElement,
);

els(); // => HTMLDivElement | HTMLDivElement[] | null
```

On the server side the custom predicate will be ignored, but can be overridden by passing it as a third argument.

The default predicate can be imported from `@solid-primitives/refs`:

```tsx
import { defaultElementPredicate } from "@solid-primitives/refs";
```

On the client it uses `instanceof Element` check, on the server it checks for the object with `t` property. (generated by compiling JSX)

## `resolveFirst`

Utility for resolving recursively nested JSX children in search of the first element that matches a predicate.

```tsx repl
import { render, type JSX } from "@solidjs/web";
import { children, createSignal, Show } from "solid-js";
import { resolveFirst } from "@solid-primitives/refs";

const isHeading = (el: unknown): el is HTMLHeadingElement => el instanceof HTMLHeadingElement;

function Card(props: { children: JSX.Element }) {
  const resolved = children(() => props.children);
  const title = resolveFirst(resolved, isHeading);
  return (
    <section>
      <p>first heading: {title()?.textContent ?? "none"}</p>
      {resolved()}
    </section>
  );
}

function Demo() {
  const [intro, setIntro] = createSignal(false);
  return (
    <>
      <button onClick={() => setIntro(v => !v)}>Toggle intro</button>
      <Card>
        <Show when={intro()}>
          <h3>Intro</h3>
        </Show>
        <p>Some text</p>
        <h3>Details</h3>
      </Card>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

`resolveFirst` matches the API of [`resolveElements`](#resolveelements) but returns only the first element that matches the predicate.

```tsx
function Button(props: ParentProps) {
  const child = resolveFirst(() => props.children);
  //     ^?: Accessor<Element | null>

  return (
    <div>
      {child()?.localName}: {child()}
    </div>
  );
}
```

`resolveFirst` also accepts a custom predicate as a second argument. See [`Using a custom predicate`](#using-a-custom-predicate) section for more details.

## `<Ref>`

Get up-to-date reference to a single child element.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { Ref } from "@solid-primitives/refs";

function Demo() {
  const [bold, setBold] = createSignal(true);
  const [el, setEl] = createSignal<Element | undefined>();
  return (
    <>
      <button onClick={() => setBold(v => !v)}>Toggle</button>
      <p>current ref: &lt;{el()?.localName ?? "undefined"}&gt;</p>
      <Ref ref={setEl}>
        <Show when={bold()} fallback={<i>italic</i>}>
          <b>bold</b>
        </Show>
      </Ref>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

`<Ref>` accepts only a `ref` property for getting the current element or `undefined`, and requires `children` to be passed in.

```tsx
import { Ref } from "@solid-primitives/refs";

const [ref, setRef] = createSignal<Element | undefined>();

<Ref ref={setRef}>{props.children}</Ref>;
```

## `<Refs>`

Get up-to-date references of the multiple children elements.

```tsx repl
import { render } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import { Refs } from "@solid-primitives/refs";

function Demo() {
  const [items, setItems] = createSignal(["a", "b"]);
  const [els, setEls] = createSignal<Element[]>([]);
  return (
    <>
      <button onClick={() => setItems(l => [...l, String.fromCharCode(97 + l.length)])}>Add</button>
      <button onClick={() => setItems(l => l.slice(0, -1))}>Remove</button>
      <p>
        {els().length} elements:{" "}
        {els()
          .map(el => el.textContent)
          .join(", ")}
      </p>
      <Refs ref={setEls}>
        <For each={items()}>{item => <span>{item}</span>}</For>
      </Refs>
    </>
  );
}

render(() => <Demo />, document.getElementById("app")!);
```

### How to use it

`<Refs>` accepts only a `ref` property for getting the current array of elements, and requires `children` to be passed in.

```tsx
import { Refs } from "@solid-primitives/refs";

const [refs, setRefs] = createSignal<Element[]>([]);

<Refs ref={setRefs}>
  <For each={my_list()}>{item => <div>{item}</div>}</For>
  <Show when={show()}>
    <div>Hello</div>
  </Show>
</Refs>;
```

## Types

### `Ref`

Type for the `ref` prop

```ts
export type Ref<T> = T | ((el: T) => void) | undefined;
```

### `RefProps`

Component properties with types for `ref` prop

```ts
interface RefProps<T> {
  ref?: Ref<T>;
}
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
