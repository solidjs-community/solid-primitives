import { Accessor, Setter } from "solid-js";

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

export type UserCallback = (files: UploadFile[]) => void | Promise<void>;
export type UserCallback2 = () => void | Promise<void>;

export interface FileUploader {
  files: Accessor<UploadFile[]>;
  selectFiles: (callback: (files: UploadFile[]) => void | Promise<void>) => void;
  removeFile: (fileName: string) => void;
  clearFiles: () => void;
}

export type FileUploaderDirective = {
  userCallback: (files: UploadFile[]) => void | Promise<void>;
  setFiles: Setter<UploadFile[]>;
};

export interface Dropzone<T extends HTMLElement = HTMLElement> {
  setRef: (ref: T) => void;
  files: Accessor<UploadFile[]>;
  isDragging: Accessor<boolean>;
  removeFile: (fileName: string) => void;
  clearFiles: () => void;
}

/**
 * @property `accept` - Comma-separated list of one or more file types, or unique file type specifiers
 * @link `accept` - https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
 */
export interface DropzoneOptions {
  onDrop?: UserCallback;
  onDragStart?: UserCallback;
  onDragEnter?: UserCallback;
  onDragEnd?: UserCallback;
  onDragLeave?: UserCallback;
  onDragOver?: UserCallback;
  onDrag?: UserCallback;
}
