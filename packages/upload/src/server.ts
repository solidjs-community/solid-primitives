import { noop } from "@solid-primitives/utils";
import * as api from "./index";

export const createFileUploader: typeof api.createFileUploader = () => ({
  files: () => [],
  selectFiles: noop,
  handleFilesInput: noop,
  removeFile: noop,
  clearFiles: noop
});

export const createDropzone: typeof api.createDropzone = () => ({
  files: () => [],
  isDragging: () => false,
  setRef: noop,
  clearFiles: noop,
  removeFile: noop
});

export const fileUploader: typeof api.fileUploader = noop;
