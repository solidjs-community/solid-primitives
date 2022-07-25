<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Clipboard" alt="Solid Primitives Clipboard">
</p>

# @solid-primitives/clipboard

[![turborepo](https://img.shields.io/badge/built%20with-turborepo-cc00ff.svg?style=for-the-badge&logo=turborepo)](https://turborepo.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/clipboard?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/clipboard)
[![size](https://img.shields.io/npm/v/@solid-primitives/clipboard?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/clipboard)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-3.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

This primitive is designed to that make reading and writing to [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) easy. It also comes with a convenient directive to write to clipboard.

## Installation

```bash
npm install @solid-primitives/clipboard
# or
yarn add @solid-primitives/clipboard
```

## How to use it

### makeClipboard

A basic non-reactive primitive that makes accessing the clipboard easy. Note that write supports both string and ClipboardItems object structure.

```ts
const [write, read, newItem] = makeClipboard();
```

#### Definition

```ts
function makeClipboard(): [
  write: ClipboardSetter,
  read: () => Promise<ClipboardItems | undefined>,
  newItem: NewClipboardItem
];
```

### createClipboard

This primitive provides full facilities for reading and writing to the clipboard. It allows for writing to clipboard via exported function or input signal. It wraps the Clipboard Async API with a resource and supplies reactive helpers to make pulling from the clipboard easy.

```tsx
const [data, setData] = createSignal('Hello);
const [clipboard, refresh] = createClipboard(data);
setData("foobar");
return (
  <Suspense fallback={"Loading..."}>
    <For each={clipboard()}>
      {item => (
        <Switch>
          <Match when={item.type == "text/plain"}>{item.text()}</Match>
          <Match when={item.blob() && item.type == "image/png"}>
            <img class="w-full" src={URL.createObjectURL(item.blob())} />
          </Match>
        </Switch>
      )}
    </For>
  </Suspense>
)
```

Note: The primitive binds and listens for `clipboardchange` meaning that clipboard changes should automatically propagate. The implementation however is buggy on certain browsers.

#### Definition

```ts
function createClipboard(
  data?: Accessor<string | ClipboardItem[]>,
  setInitial?: boolean
): [
  clipboardItems: Resource<
    {
      type: string;
      text: Accessor<string>;
      blob: Accessor<Blob>;
    }[]
  >,
  refetch: VoidFunction,
  write: ClipboardSetter
];
```

### copyToClipboard

You can also use clipboard as a convenient directive for setting the clipboard value. You can override the default value and the setter with the options parameter.

```ts
import { copyToClipboard } from "@solid-primitives/clipboard";
<input type="text" use:copyToClipboard />;
```

#### Definition

```ts
function copyToClipboard(
  el: Element,
  options: MaybeAccessor<{
    value?: any;
    setter?: ClipboardSetter;
    highlight?: HighlightModifier;
  }>
);
```

#### Highlighters/Range Selection

In some scenarios you'll want to highlight or select a range of text. copyToClipboard has an option to specify the type of highlighting you'd like. Use either `input` or `element` based on the type you're making selectable.

```tsx
import { copyToClipboard, input, element } from "@solid-primitives/clipboard";
<input type="text" use:copyToClipboard={{ highlight: input() }} />;
<div use:copyToClipboard={{ highlight: element(5, 10) }} />;
```

### newItem

This package ships with newItem which is a helper method for creating new ClipboardItem types.

```ts
import { newItem } from "@solid-primitives/clipboard";
write([newItem("image/png", await image.blob())]);
```

#### Definition

```ts
function newItem(type: string, data: ClipboardItemData): ClipboardItem;
```

## Demo

You may view a working example here: https://stackblitz.com/edit/vitejs-vite-okxns7

## Changelog

See [CHANGELOG.md](.\CHANGELOG.md)

