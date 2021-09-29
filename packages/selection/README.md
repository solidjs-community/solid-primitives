# @solid-primitives/permission

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

Creates a primitive to handle selection in editable elements.

## How to use it

```ts
type Selection = {
  start: number;
  end: number;
  text?: string;
}
const [selection: Accessor<Selection>, setSelection: Setter<Selection>] =
  createInputSelection(ref?: HTMLInputElement | HTMLTextAreaElement);
```

## Demo

TODO

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

0.0.100

Initial release.

</details>
