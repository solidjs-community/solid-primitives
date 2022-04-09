<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Upload" alt="Solid Primitives Upload">
</p>

# @solid-primitives/upload

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg?style=for-the-badge)](https://lerna.js.org/)
[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/upload?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/upload)
[![size](https://img.shields.io/npm/v/@solid-primitives/upload?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/upload)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive to make uploading files easy.

## Installation

```bash
npm install @solid-primitives/upload
# or
yarn add @solid-primitives/upload
```

## How to use it

### createFileUploader

Upload exports getter and setter. Depending on setter's settings, getter will return single file object or array of it.

```ts
// multiple files
const { files, selectFiles } = createFileUploader({ multiple: true, accept: "image/*" });
selectFiles(files => {
  console.log(files);
});

// single file
const { file, selectFile } = createFileUploader();
selectFile(({ source, name, size, file }) => {
  console.log({ source, name, size, file });
});
```

## Demo

Working example: https://codesandbox.io/s/solid-primitives-upload-ry042x?file=/src/index.tsx

## Changelog

<details>
<summary><b>Expand Changelog</b></summary>

1.0.0

Committed first version of primitive.

</details>
