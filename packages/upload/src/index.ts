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
export type UploadSetter = (
  {
    accept,
    multiple
  }: {
    accept?: string | undefined;
    multiple?: boolean | undefined;
  },
  cb: (files: UploadFile | UploadFile[]) => void
) => void;

function createInputComponent({
  multiple = false,
  accept = ""
}: {
  multiple: boolean;
  accept: string;
}) {
  const element = document.createElement("input");
  element.type = "file";
  element.accept = accept;
  element.multiple = multiple;

  return element;
}

/**
 * Primitive to make uploading files easier.
 *
 * @return files - Uploaded file or files
 * @return uploadFiles - Setter function
 *
 * @example
 * ```ts
 * const [files, selectFiles] = createUpload();
 * // single file
 * selectFiles({ multiple: true, accept: "image/*" }, (files: CustomFile[]) => {
 *   console.log(files);
 * });
 * // multiple files
 * selectFile({}, ({ source, name, size, file }: CustomFile) => {
 *   console.log({ source, name, size, file });
 * });
 * ```
 */
const createUpload = (): [Accessor<UploadFile | UploadFile[] | null>, UploadSetter] => {
  const [files, setFiles] = createSignal<UploadFile | UploadFile[] | null>(null);

  let userCallback: any = () => {};

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

  const uploadFile = (
    { accept = "", multiple = false }: { accept?: string; multiple?: boolean },
    cb: any
  ) => {
    if (typeof cb === "function") {
      userCallback = cb;
    }

    const inputEL = createInputComponent({ multiple, accept });

    inputEL.addEventListener("change", onChange);
    inputEL.click();
  };

  return [files, uploadFile];
};

export default createUpload;
