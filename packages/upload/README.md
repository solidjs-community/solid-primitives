<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=Upload" alt="Solid Primitives Upload">
</p>

# @solid-primitives/upload

[![size](https://img.shields.io/bundlephobia/minzip/@solid-primitives/upload?style=for-the-badge)](https://bundlephobia.com/package/@solid-primitives/upload)
[![size](https://img.shields.io/npm/v/@solid-primitives/upload?style=for-the-badge)](https://www.npmjs.com/package/@solid-primitives/upload)
[![stage](https://img.shields.io/endpoint?style=for-the-badge&url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolidjs-community%2Fsolid-primitives%2Fmain%2Fassets%2Fbadges%2Fstage-0.json)](https://github.com/solidjs-community/solid-primitives#contribution-process)

Primitive to make uploading files and making dropzones easier.

## Installation

```bash
npm install @solid-primitives/upload
# or
yarn add @solid-primitives/upload
# or
pnpm add @solid-primitives/upload
```

> **Requires Solid.js 2.0 and `@solidjs/web` 2.0.**

## How to use it

### [createFileUploader](#createfileuploader)

A reactive primitive that opens the OS file-picker dialog and exposes the selected files as a signal.

```ts
// single file
const { files, selectFiles } = createFileUploader();
selectFiles(([file]) => console.log(file));

// multiple files with accept filter
const { files, selectFiles } = createFileUploader({ multiple: true, accept: "image/*" });
selectFiles(files => files.forEach(file => console.log(file)));
```

**Returns:**

| Name          | Type                                      | Description                                                        |
| ------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| `files`       | `Accessor<UploadFile[]>`                  | Reactive list of selected files                                    |
| `error`       | `Accessor<unknown>`                       | Error thrown by the last `selectFiles` callback; `null` if none    |
| `selectFiles` | `(callback?: UserCallback) => void`       | Opens file-picker and runs optional callback                       |
| `removeFile`  | `(fileName: string) => void`              | Removes a file by name from the list                               |
| `clearFiles`  | `() => void`                              | Clears all selected files                                          |

### [fileUploader](#fileuploader-ref-callback)

A **ref callback factory** for `<input type="file">` elements (replaces the Solid 1.x `use:fileUploader` directive).

```tsx
const [files, setFiles] = createSignal<UploadFile[]>([]);
const [uploadError, setUploadError] = createSignal<unknown>(null);

<input
  type="file"
  multiple
  ref={fileUploader({
    userCallback: fs => fs.forEach(f => console.log(f)),
    setFiles,
    onError: err => setUploadError(err),
  })}
/>;
```

If `onError` is omitted, a rejection from `userCallback` propagates as an unhandled promise rejection.

> **Migration note (Solid 2.0):** The `use:fileUploader` directive syntax has been removed.
> Replace `use:fileUploader={opts}` with `ref={fileUploader(opts)}`.

### [createDropzone](#createdropzone)

A reactive primitive for drag-and-drop file targets.

```tsx
const { setRef: dropzoneRef, files: droppedFiles, isDragging } = createDropzone({
  onDrop: async files => {
    await doStuff(2);
    files.forEach(f => console.log(f));
  },
  onDragStart: files => files.forEach(f => console.log(f)),
  onDragOver: files => console.log("drag over"),
});

<div
  ref={dropzoneRef}
  style={{ width: "100px", height: "100px", background: isDragging() ? "green" : "red" }}>
  Dropzone
</div>
```

**Returns:**

| Name          | Type                          | Description                                                        |
| ------------- | ----------------------------- | ------------------------------------------------------------------ |
| `setRef`      | `(el: T) => void`             | Ref callback — pass to the `ref` prop of an element                |
| `files`       | `Accessor<UploadFile[]>`      | Reactive list of dropped files                                     |
| `error`       | `Accessor<unknown>`           | Error thrown by the last drag callback; `null` if none             |
| `isDragging`  | `Accessor<boolean>`           | `true` while a drag is in progress                                 |
| `removeFile`  | `(fileName: string) => void`  | Removes a file by name from the list                               |
| `clearFiles`  | `() => void`                  | Clears all dropped files                                           |

**DropzoneOptions:**

| Callback      | Type           | Description                            |
| ------------- | -------------- | -------------------------------------- |
| `onDrop`      | `UserCallback` | Fired when files are dropped           |
| `onDragStart` | `UserCallback` | Fired when a drag starts               |
| `onDragEnter` | `UserCallback` | Fired when dragged item enters element |
| `onDragEnd`   | `UserCallback` | Fired when drag ends                   |
| `onDragLeave` | `UserCallback` | Fired when dragged item leaves element |
| `onDragOver`  | `UserCallback` | Fired continuously while dragging over |
| `onDrag`      | `UserCallback` | Fired on drag events                   |

## Types

```ts
type UploadFile = {
  source: string; // blob URL (URL.createObjectURL)
  name: string;
  size: number;
  file: File;
};

type UserCallback = (files: UploadFile[]) => void | Promise<void>;

type FileUploaderOptions = {
  accept?: string;
  multiple?: boolean;
};

type FileUploaderDirective = {
  userCallback: UserCallback;
  setFiles: Setter<UploadFile[]>;
  onError?: (error: unknown) => void;
};
```

## Demo

Working example: https://primitives.solidjs.community/playground/upload
Source code: https://github.com/solidjs-community/solid-primitives/blob/main/packages/upload/dev/index.tsx

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)
