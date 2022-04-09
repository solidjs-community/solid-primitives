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
export type FileUploaderOptions = {
  accept?: string;
  multiple?: boolean;
};
export type FileUploader = [
  files: FileUploaderAccessor,
  selectFile: (callback: FileSelectCallback) => void
];
export type FileUploaderAccessor = {
  (): UploadFile;
  (): UploadFile[];
  (): null;
};
export type FileSelectCallback = {
  (file: UploadFile): void;
  (files: UploadFile[]): void;
};

/**
 * Primitive to make uploading files easier.
 *
 * @return files - Uploaded file or files
 * @return uploadFiles - Setter function
 *
 * @example
 * ```ts
 * // multiple files
 * const [files, selectFiles] = createFileUploader({ multiple: true, accept: "image/*" });
 * selectFiles(files => {
 *   console.log(files);
 * });
 *
 * // single file
 * const [file, selectFile] = createFileUploader();
 * selectFile(({ source, name, size, file }) => {
 *   console.log({ source, name, size, file });
 * });
 * ```
 */
function createFileUploader(): [
  files: Accessor<UploadFile>,
  uploadFiles: (callback: (file: UploadFile) => void) => void
];
function createFileUploader(
  options?: FileUploaderOptions
): [files: Accessor<UploadFile[]>, uploadFiles: (callback: (files: UploadFile[]) => void) => void];
function createFileUploader(options?: FileUploaderOptions): any {
  const [files, setFiles] = createSignal<UploadFile | UploadFile[] | null>(null);

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

      const parsedFile: UploadFile = {
        source: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        file
      };

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

  const uploadFiles = (callback: FileSelectCallback = () => {}) => {
    userCallback = callback;

    const inputEL = createInputComponent(options || {});

    inputEL.addEventListener("change", onChange);
    inputEL.click();
  };

  return [files, uploadFiles];
}

export default createFileUploader;

function createInputComponent({ multiple = false, accept = "" }: FileUploaderOptions) {
  const element = document.createElement("input");
  element.type = "file";
  element.accept = accept;
  element.multiple = multiple;

  return element;
}
