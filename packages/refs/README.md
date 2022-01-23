# @solid-primitives/refs

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/refs?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/refs)
[![version](https://img.shields.io/npm/v/@solid-primitives/refs?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/refs)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fdavedbase%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/davedbase/solid-primitives#contribution-process)

Collection of primitives, components and directives that help managing references to JSX elements, keeping track of mounted elements.

- [`unmount`](#unmount) - A directive that calls handler when the element get's unmounted from DOM.
- [`Ref`](#Ref) - Get up-to-date reference to a single child element.
- [`Refs`](#Refs) - Get up-to-date references of the multiple children elements.
- [`Key`](#Key) - Causes the children to rerender when the `key` changes.

## Installation

```bash
npm install @solid-primitives/refs
# or
yarn add @solid-primitives/refs
```

## `unmount`

A directive that calls handler when the element get's unmounted from DOM.

### Import

```ts
import { unmount } from "@solid-primitives/refs";
// place it somewhere in the code to prevent it from being tree-shaken
unmount;
```

### How to use it

```tsx
const [ref, setRef] = createSignal<Element | undefined>();

<div ref={el => setRef(el)} use:unmount={() => setRef(undefined)}>
  Hello
</div>;
```

## `Ref`

Get up-to-date reference to a single child element.

### Import

```ts
import { Ref } from "@solid-primitives/refs";
```

### How to use it

`<Ref>` accepts these properties:

- `ref` - Getter of current element _(or `undefined` if not mounted)_
- `onMount` - handle the child element getting mounted to the dom
- `onUnmount` - handle the child element getting unmounted from the dom

```tsx
const [ref, setRef] = createSignal<Element | undefined>();

<Ref
  ref={setRef}
  onMount={el => console.log("Mounted", el)}
  onUnmount={el => console.log("Unmounted", el)}
>
  <Show when={show()}>
    <div>Hello</div>
  </Show>
</Ref>;
```

#### Providing generic Element type

```tsx
<Ref<HTMLDivElement>
  ref={el => {...}} // HTMLDivElement | undefined
  onMount={el => {...}} // HTMLDivElement
  onUnmount={el => {...}} // HTMLDivElement
>
  <div>Hello</div>
</Ref>
```

### Definition

```ts
const Ref: <U extends Element>(props: {
  ref?: Get<U | undefined>;
  onMount?: Get<U>;
  onUnmount?: Get<U>;
  children: JSX.Element;
}) => JSX.Element;
```

## `Refs`

Get up-to-date references of the multiple children elements.

### Import

```ts
import { Refs } from "@solid-primitives/refs";
```

### How to use it

`<Refs>` accepts these properties:

- `refs` - Getter of current array of elements
- `added` - Getter of added elements since the last change
- `removed` - Getter of removed elements since the last change
- `onChange` - handle children changes

```tsx
const [refs, setRefs] = createSignal<Element[]>([]);

<Refs
  refs={setRefs}
  added={els => console.log("Added elements", els)}
  removed={els => console.log("Removed elements", els)}
  onChange={e => console.log(e)}
>
  <For each={my_list()}>{item => <div>{item}</div>}</For>
  <Show when={show()}>
    <div>Hello</div>
  </Show>
</Refs>;
```

#### Providing generic Element type

```tsx
<Refs<HTMLDivElement>
  refs={els => {}} // HTMLDivElement[]
  added={els => {}} // HTMLDivElement[]
  removed={els => {}} // HTMLDivElement[]
  // { refs: HTMLDivElement[]; added: HTMLDivElement[]; removed: HTMLDivElement[] }
  onChange={e => {}}
>
  <div>Hello</div>
</Refs>
```

### Definition

```ts
const Refs: <U extends Element>(props: {
  refs?: Get<U[]>;
  added?: Get<U[]>;
  removed?: Get<U[]>;
  onChange?: Get<{
    refs: U[];
    added: U[];
    removed: U[];
  }>;
  children: JSX.Element;
}) => JSX.Element;
```

## `Key`

Causes the children to rerender when the `key` changes.

### Import

```ts
import { Key } from "@solid-primitives/refs";
```

### How to use it

You have to provide a `key` prop. Changing it, will cause the children to rerender.

```tsx
const [count, setCount] = createSignal(0);

// will rerender whole <button>, instead of just text
<Key key={count()}>
  <button onClick={() => setCount(p => ++p)}>{count()}</button>
</Key>;
```

#### Using with Transition

`<Key>` can be used together with [`solid-transition-group`](#https://github.com/solidjs/solid-transition-group) to animate single component's transition, on state change.

```tsx
<Transition name="your-animation" mode="out-in">
  <Key key={count()}>
    <button onClick={() => setCount(p => ++p)}>{count()}</button>
  </Key>
</Transition>
```

### Definition

```ts
const Key: Component<{
  key: any;
}>;
```

## Demo

https://stackblitz.com/edit/solid-vite-unocss-bkbgap?file=index.tsx

(run `npm start` in the terminal)

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release as a Stage-0 primitive.

</details>
