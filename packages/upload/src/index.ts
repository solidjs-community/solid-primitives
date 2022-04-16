import { Accessor, createSignal } from "solid-js";

/**
 * @property `source` - DOMString containing a URL representing the object given in the parameter
 */
export type UploadFile = {
  source: string;
  name: string;
  size: number;
  file: File;
};

/**
 * @property `accept` - Comma-separated list of one or more file types, or unique file type specifiers
 * @link `accept` - https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
 */
export type CreateFileUploaderOptions = {
  accept?: string;
  multiple?: boolean;
};

export type FileSelectCallback = {
  (file: UploadFile): void | Promise<void>;
  (files: UploadFile[]): void | Promise<void>;
};

export interface FilesUploader {
  files: Accessor<UploadFile[]>;
  selectFiles: (callback: (file: UploadFile[]) => void | Promise<void>) => void;
  /**
   * `change` event handler for input element. Handles `drop` event as well
   */
  handleFilesInput: (
    event: (Event | DragEvent) & {
      currentTarget: HTMLInputElement;
      target: Element;
    }
  ) => void | Promise<void>;
  removeFile: (fileName: string) => void;
  clearFiles: () => void;
}

export interface FileUploader extends Omit<FilesUploader, "files" | "selectFiles"> {
  files: Accessor<UploadFile>;
  selectFiles: (callback: (file: UploadFile) => void | Promise<void>) => void;
}

/**
 * Primitive to make uploading files easier.
 *
 * @returns `file (files)`
 * @returns `selectFile (selectFiles)` - Open file picker and set files
 * @returns `handleFileInput (handleFilesInput)` - Event handler for `<input type="file" />`
 * @returns `removeFile`
 * @returns `clearFiles`
 *
 * @example
 * ```ts
 * // multiple files
 * const {files, selectFiles} = createFileUploader({ multiple: true, accept: "image/*" });
 * selectFiles(files => {
 *   console.log(files);
 * });
 *
 * // single file
 * const {file, selectFile} = createFileUploader();
 * selectFile(({ source, name, size, file }) => {
 *   console.log({ source, name, size, file });
 * });
 * ```
 */

function createFileUploader(): FileUploader;
function createFileUploader(options?: CreateFileUploaderOptions): FilesUploader;
function createFileUploader(options?: CreateFileUploaderOptions): any {
  const [files, setFiles] = createSignal<UploadFile | UploadFile[]>();

  let userCallback: FileSelectCallback;

  async function onChange(this: HTMLInputElement, ev: Event) {
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

    if (target.multiple) {
      setFiles(parsedFiles);
      return userCallback(parsedFiles);
    }

    setFiles(parsedFiles[0]);
    return userCallback(parsedFiles[0]);
  }

  const selectFiles = (callback: FileSelectCallback) => {
    userCallback = callback;

    if (callback instanceof Promise) {
      callback.then().catch(e => console.error(e));
    }

    const inputEL = createInputComponent(options || {});

    inputEL.addEventListener("change", onChange);
    inputEL.click();
  };

  const handleFilesInput = async (
    event: (Event | DragEvent) & {
      currentTarget: HTMLInputElement;
      target: Element;
    }
  ) => {
    const filesArr: File[] = Array.from(
      event?.currentTarget?.files || (event as DragEvent)?.dataTransfer?.files || []
    );
    if (options?.multiple) {
      setFiles(filesArr.map(transformFile));
    } else {
      setFiles(filesArr.map(transformFile)[0]);
    }
  };

  const removeFile = (fileName: string) => {
    if (options?.multiple) {
      setFiles(prev => (prev as UploadFile[]).filter(f => f.name !== fileName));
    } else {
      setFiles(undefined);
    }
  };

  const clearFiles = () => {
    if (options?.multiple) {
      setFiles([]);
    } else {
      setFiles(undefined);
    }
  };

  return {
    files,
    selectFiles,
    handleFilesInput,
    removeFile,
    clearFiles
  };
}

export { createFileUploader };

function createInputComponent({ multiple = false, accept = "" }: CreateFileUploaderOptions) {
  const element = document.createElement("input");
  element.type = "file";
  element.accept = accept;
  element.multiple = multiple;

  return element;
}

function transformFile(file: File): UploadFile {
  const parsedFile: UploadFile = {
    source: URL.createObjectURL(file),
    name: file.name,
    size: file.size,
    file
  };
  return parsedFile;
}
