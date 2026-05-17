import { createSignal } from "solid-js";
import { isServer } from "@solidjs/web";
import { transformFiles, createInputComponent } from "./helpers.js";
import type { FilePicker, FilePickerOptions, UploadFile, UserCallback } from "./types.js";

/**
 * Primitive to open the OS file-picker and expose the selected files reactively.
 *
 * @returns `files`
 * @returns `error` - Reactive error from the last `selectFiles` callback, cleared on next selection
 * @returns `isLoading` - True while the `selectFiles` callback is pending
 * @returns `selectFiles` - Open file picker, set files and run user callback
 * @returns `removeFile`
 * @returns `clearFiles`
 *
 * @example
 * ```ts
 * // multiple files
 * const { files, error, selectFiles } = createFilePicker({ multiple: true, accept: "image/*" });
 * selectFiles(files => files.forEach(file => console.log(file)));
 *
 * // single file
 * const { files, error, selectFiles } = createFilePicker();
 * selectFiles(([{ source, name, size, file }]) => console.log({ source, name, size, file }));
 * ```
 */
function createFilePicker(options?: FilePickerOptions): FilePicker {
  if (isServer) {
    return {
      files: () => [],
      error: () => null,
      isLoading: () => false,
      selectFiles: () => {},
      removeFile: () => {},
      clearFiles: () => {},
    };
  }
  const [files, setFiles] = createSignal<UploadFile[]>([]);
  const [error, setError] = createSignal<unknown>(null);
  const [isLoading, setIsLoading] = createSignal(false);

  let userCallback: UserCallback = () => {};

  const onChange = async (event: Event) => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.currentTarget as HTMLInputElement;

    let parsedFiles: UploadFile[] = [];
    if (target.files) {
      parsedFiles = transformFiles(target.files);
    }

    target.removeEventListener("change", onChange);
    target.remove();

    setFiles(parsedFiles);
    setError(null);
    setIsLoading(true);

    try {
      await userCallback(parsedFiles);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectFiles = (callback?: UserCallback) => {
    if (callback) {
      userCallback = callback;
    }

    const inputElement = createInputComponent(options || {});

    inputElement.addEventListener("change", onChange);
    inputElement.click();
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    files,
    error,
    isLoading,
    selectFiles,
    removeFile,
    clearFiles,
  };
}

export { createFilePicker };
