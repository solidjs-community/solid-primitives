<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Refs" alt="Solid Primitives Refs">
</p>

# @solid-primitives/refs

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/refs?style=for-the-badge&label=size)](https://bundlephobia.com/package/@solid-primitives/refs)
[![version](https://img.shields.io/npm/v/@solid-primitives/refs?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/refs)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-1.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Collection of primitives, components and directives that help managing references to JSX elements, keeping track of mounted/unmounted elements.

##### Primitives:

- [`mergeRefs`](#mergeRefs) - Utility for using jsx refs both for local variables and providing it to the `props.ref` for component consumers.
- [`elements`](#elements) - Reactive signal that filters out non-element items from a signal array. _(Can be used with `children` primitive)_
- [`refs`](#refs) - Get signal references to Elements of the reactive input. Which were added, which were removed. _(Can be used with `children` primitive)_
- [`mapRemoved`](#mapRemoved) - Similar to Solid's `mapArray`, but you map the elements that were removed from source array. Leting you keep them for longer.
- [`resolveElements`](#resolveElements) — Will resolve value to a flat list of HTML elements or a single element or `null`.

##### Directive:

- [`unmount`](#unmount) - A directive that calls handler when the element get's unmounted from DOM.

##### Components:

- [`<Children>`](#children) - Solid's `children` helper in component form. Access it's children elements by `get` property.
- [`<Refs>`](#refs-1) - Get up-to-date references of the multiple children elements.
- [`<Ref>`](#ref) - Get up-to-date reference to a single child element.

##### Types:

- [`RefProps`](#RefProps) - Component properties with types for `ref`
- [`ResolvedChildren`](#ResolvedChildren) - Type of resolved JSX elements provided by Solid's `children` helper.

##### Vanilla helpers:

- `getChangedItems` - Tells you which elements got added to the array, and which got removed
- `getAddedItems` - Tells you elements got added to the array
- `getRemovedItems` - Tells you which elements got removed from the array

## Installation

```bash
npm install @solid-primitives/refs
# or
yarn add @solid-primitives/refs
```

## Primitives

---

### `mergeRefs`

Utility for using jsx refs both for local variables and providing it to the `props.ref` for component consumers.

#### How to use it

```tsx
import { mergeRefs } from "@solid-primitives/refs";

interface ButtonProps {
  ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
}

const Button = (props: ButtonProps) => {
  let ref!: HTMLButtonElement;
  onMount(() => {
    // use the local ref
  });
  return <button ref={mergeRefs(el => (ref = el), props.ref)} />;
};

// in consumer's component:
let ref!: HTMLButtonElement;
<Button ref={ref} />;
```

### `elements`

Reactive signal that filters out non-element items from a signal array. _(Can be used with `children` primitive)_

#### How to use it

```ts
import { elements } from "@solid-primitives/refs";

const resolved = children(() => props.children);
const els = elements(resolved);
els(); // T: Element[]

// or narrow down the element type
const divs = elements(resolved, HTMLDivElement);
divs(); // T: HTMLDivElement[]
```

### `refs`

Get signal references to Elements of the reactive input. Which were added, which were removed. _(Can be used with `children` primitive)_

Used internally by [`<Refs>`](#<Refs>) component.

#### How to use it

```ts
import { refs } from "@solid-primitives/refs";

const resolved = children(() => props.children);
const [els, added, removed] = refs(resolved);
els(); // T: Element[]
added(); // T: Element[]
removed(); // T: Element[]

// or narrow down the element type
const [els, added, removed] = refs(resolved, HTMLDivElement);
els(); // T: HTMLDivElement[]
added(); // T: HTMLDivElement[]
removed(); // T: HTMLDivElement[]
```

### `mapRemoved`

Reactively map removed items from a reactive signal array. If the mapping function return an element signal, this element will be placed in the array returned from primitive.

#### How to use it

```ts
import { mapRemoved } from "@solid-primitives/refs";

const MyComp = props => {
  const resolved = children(() => props.children);

  const combined = mapRemoved(resolved, (ref, index) => {
    const [el, setEl] = createSignal(ref);

    // apply styles/animations to removed element
    ref.style.filter = "grayscale(100%)";

    // computations can be created inside the mapping fn
    createEffect(() => {
      // index is a signal
      index();
    });

    const remove = () => {
      // ...later
      // by setting returned signal to undefined
      // element get's removed from combined array permanently
      setEl(undefined);
    };

    // you can return a signal with element to keep it in the combined array
    return el;
  });

  return combined;
};
```

### `resolveElements`

Similarly to `children()` helper from `solid-js` will resolve provided value to a flat list of HTML elements or a single element or `null`. But doesn't create a computation.

```ts
import { resolveElements } from "@solid-primitives/refs";

const MyComponent: ParentComponent = props => {
  createEffect(() => {
    const resolved = resolveElements(props.children);
    resolved; // T: HTMLElement | HTMLElement[] | null
  });
  return "Don't access props.children here again — it'll create new dom nodes";
};
```

## Directive

---

### `unmount`

A directive that calls handler when the element get's unmounted from DOM.

#### Import

```ts
import { unmount } from "@solid-primitives/refs";
// place it somewhere in the code to prevent it from being tree-shaken
unmount;
```

#### How to use it

```tsx
const [ref, setRef] = createSignal<Element | undefined>();

<div ref={el => setRef(el)} use:unmount={() => setRef(undefined)}>
  Hello
</div>;
```

## Components

---

### `<Children>`

Solid's `children` helper in component form. Access it's children elements by `get` property.

#### How to use it

```tsx
import {Children, ResolvedJSXElement} from "@solid-primitives/refs"

// typing as JSX.Element also works
const [children, setChildren] = createSignal<ResolvedJSXElement>([])

<Children get={setChildren}>
   <div></div>
   ...
</Children>
```

### `<Ref>`

Get up-to-date reference to a single child element.

#### Import

```ts
import { Ref } from "@solid-primitives/refs";
```

#### How to use it

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

##### Providing generic Element type

```tsx
<Ref<HTMLDivElement>
  ref={el => {...}} // HTMLDivElement | undefined
  onMount={el => {...}} // HTMLDivElement
  onUnmount={el => {...}} // HTMLDivElement
>
  <div>Hello</div>
</Ref>
```

### `<Refs>`

Get up-to-date references of the multiple children elements.

#### Import

```ts
import { Refs } from "@solid-primitives/refs";
```

#### How to use it

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

##### Providing generic Element type

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

#### Demo

https://stackblitz.com/edit/solid-vite-unocss-bkbgap?file=index.tsx

(run `npm start` in the terminal)

## Types

### `RefProps`

Component properties with types for `ref`

```ts
interface RefProps<T extends Element> {
  ref?: T | ((el: T) => void);
}
```

### `ResolvedChildren`

Type of resolved JSX elements provided by Solid's `children` helper.

```ts
type ResolvedChildren = ResolvedJSXElement | ResolvedJSXElement[];
```

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
