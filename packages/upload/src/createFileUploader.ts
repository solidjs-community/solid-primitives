import { createSignal } from "solid-js";
import { transformFile, createInputComponent } from "./helpers";
import { FileUploader, FileUploaderOptions, UploadFile, UserCallback } from "./types";

/**
 * Primitive to make uploading files easier.
 *
 * @returns `files`
 * @returns `selectFiles` - Open file picker, set files and run user callback
 * @returns `removeFile`
 * @returns `clearFiles`
 *
 * @example
 * ```ts
 * // multiple files
 * const {files, selectFiles} = createFileUploader({ multiple: true, accept: "image/*" });
 * selectFiles(files => files.forEach(file => console.log(file)));
 *
 * // single file
 * const {file, selectFile} = createFileUploader();
 * selectFiles(([{ source, name, size, file }]) => console.log({ source, name, size, file }));
 * ```
 */
function createFileUploader(options?: FileUploaderOptions): FileUploader {
  const [files, setFiles] = createSignal<UploadFile[]>([]);

  let userCallback: UserCallback;

  async function onChange(this: HTMLInputElement, event: Event) {
    const parsedFiles = [];
    const target = this;

    for (const index in target.files) {
      const fileIndex = +index;
      if (isNaN(+fileIndex)) {
        continue;
      }

      const file = target.files[fileIndex];
      const parsedFile = transformFile(file);

      parsedFiles.push(parsedFile);
    }

    target.removeEventListener("change", onChange);
    target.remove();

    setFiles(parsedFiles);

    try {
      await userCallback(parsedFiles);
    } catch (error) {
      console.error(error);
    }
    return;
  }

  const selectFiles = (callback: UserCallback) => {
    userCallback = callback;

    const inputElement = createInputComponent(options || {});

    inputElement.addEventListener("change", onChange);
    inputElement.click();
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => (prev as UploadFile[]).filter(f => f.name !== fileName));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    files,
    selectFiles,
    removeFile,
    clearFiles
  };
}

export { createFileUploader };
