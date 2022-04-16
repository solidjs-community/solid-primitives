import { noop, asAccessor } from "@solid-primitives/utils";
import { CreateFileUploaderOptions } from ".";
import * as api from "./index";

const createFileUploader: typeof api.createFileUploader = (options?: CreateFileUploaderOptions) => {
  return {
    files: noop,
    selectFiles: noop,
    handleFilesInput: noop,
    removeFile: noop,
    clearFiles: noop
  };
};

export { createFileUploader };
